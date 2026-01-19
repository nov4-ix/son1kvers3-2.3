import { PrismaClient, TokenPool } from '@prisma/client';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import { TokenManager } from './tokenManager';

interface TokenSelectionResult {
  tokenId: string;
  token: string;
  estimatedWaitTime: number;
  qualityScore: number;
  tier: string;
}

interface PoolMetrics {
  totalTokens: number;
  activeTokens: number;
  averageHealth: number;
  availableCapacity: number;
  queueLength: number;
}

export class TokenPoolService {
  private prisma: PrismaClient;
  private redis: Redis | null;
  private tokenManager: TokenManager;
  private encryptionKey: string;

  constructor(prisma: PrismaClient, tokenManager: TokenManager) {
    this.prisma = prisma;
    this.tokenManager = tokenManager;
    this.encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key-change-this';

    // Initialize Redis if URL is present, otherwise null (graceful degradation)
    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
      this.redis.on('error', (err) => console.error('Redis Error:', err));
    } else {
      console.warn('Redis not configured, falling back to database-only mode (slower)');
      this.redis = null;
    }
  }

  async initialize() {
    console.log('HybridTokenPoolService initialized');
  }

  // ========================================
  // Token Selection with Intelligence
  // ========================================

  async selectOptimalToken(
    userTier: 'free' | 'basic' | 'pro' | 'enterprise',
    userId: string
  ): Promise<TokenSelectionResult> {
    const cacheKey = `optimal-token:${userTier}`;

    // Check cache first (10 second TTL)
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    // For enterprise users, check dedicated token first
    if (userTier === 'enterprise') {
      const dedicatedToken = await this.prisma.tokenPool.findFirst({
        where: {
          dedicatedToUser: userId,
          isActive: true,
          healthScore: { gte: 70 }
        }
      });

      if (dedicatedToken) {
        return this.formatTokenResult(dedicatedToken, 0, 100);
      }
    }

    // Get tokens by tier with health check
    const tokens = await this.prisma.tokenPool.findMany({
      where: {
        isActive: true,
        healthScore: { gte: 50 },
        tier: { in: this.getTierAccess(userTier) }, // Assuming simple string match for now
        // currentDailyUsage: { lt: this.prisma.tokenPool.fields.dailyLimit } // Prisma raw field ref limitation, handled below
      },
      // orderBy is tricky with computed fields, so we sort in memory for now or simple fields
      orderBy: [
        { priority: 'desc' },
        { healthScore: 'desc' },
      ],
      take: 20 // Fetch a candidate pool
    });

    // Filter out those who really exceeded daily limit (if needed, though Prisma query above can't easily do col comparison without raw)
    const validTokens = tokens.filter(t => t.currentDailyUsage < t.dailyLimit);

    if (validTokens.length === 0) {
      // ✅ FALLBACK CRÍTICO: Si TokenPool está vacío, usar TokenManager
      console.warn('⚠️ TokenPool vacío, usando TokenManager como fallback');
      try {
        const tokenData = await this.tokenManager.getHealthyToken(userId);
        if (tokenData) {
          // Convertir Token a formato TokenSelectionResult
          return {
            tokenId: tokenData.tokenId,
            token: tokenData.token,
            estimatedWaitTime: 60, // Default wait time
            qualityScore: 80, // Default quality
            tier: 'free' // Default tier
          };
        }
      } catch (fallbackError) {
        console.error('❌ Fallback a TokenManager también falló:', fallbackError);
      }

      // Si todo falla, lanzar error
      throw new Error('No healthy tokens available. Please add tokens to the pool or link a Suno account.');
    }

    // Select best token using weighted algorithm
    const selectedToken = this.selectByWeightedScore(validTokens, userTier);

    // Calculate wait time based on queue (mocked for now until Queue service is live)
    const queueLength = await this.getQueueLength(userTier);
    const estimatedWaitTime = this.calculateWaitTime(queueLength, selectedToken.avgResponseTime);

    const result = this.formatTokenResult(
      selectedToken,
      estimatedWaitTime,
      selectedToken.healthScore
    );

    // Cache for 5 seconds to reduce DB load
    if (this.redis) {
      await this.redis.setex(cacheKey, 5, JSON.stringify(result));
    }

    return result;
  }

  private getTierAccess(userTier: string): string[] {
    switch (userTier) {
      case 'enterprise':
        return ['enterprise', 'pro', 'basic', 'free'];
      case 'pro':
        return ['pro', 'basic', 'free'];
      case 'basic':
        return ['basic', 'free'];
      default:
        return ['free'];
    }
  }

  private selectByWeightedScore(tokens: TokenPool[], userTier: string): TokenPool {
    // Weighted scoring algorithm
    const scores = tokens.map(token => {
      let score = 0;

      // Health score (40% weight)
      score += (token.healthScore / 100) * 40;

      // Response time (30% weight) - lower is better
      const responseScore = Math.max(0, 100 - (token.avgResponseTime / 100)); // Normalize 10s = 0
      score += (responseScore / 100) * 30;

      // Success rate (20% weight)
      const successRate = token.successCount / ((token.successCount + token.failureCount) || 1);
      score += successRate * 20;

      // Current usage (10% weight) - prefer less used tokens
      const usageScore = 100 - ((token.currentDailyUsage / token.dailyLimit) * 100);
      score += (usageScore / 100) * 10;

      // Randomization (+/- 5%) to prevent thundering herd
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05);

      return { token, score: score * randomFactor };
    });

    // Sort by score and return best
    scores.sort((a, b) => b.score - a.score);
    return scores[0].token;
  }

  private calculateWaitTime(queueLength: number, avgResponseTime: number): number {
    // Base calculation: queue position * average response time
    const baseWait = queueLength * (avgResponseTime || 30000); // Default 30s if unknown
    // Add 20% buffer for safety
    return Math.ceil(baseWait * 1.2);
  }

  private formatTokenResult(token: TokenPool, waitTime: number, quality: number): TokenSelectionResult {
    try {
      // Try to decrypt using TokenManager's method first (for compatibility)
      let decryptedToken: string;
      try {
        // TokenManager uses AES-256-GCM format (JSON with version)
        // TokenPoolService uses AES-256-CBC format (iv:encrypted)
        // Try TokenManager format first, then fallback to our format
        if (token.encryptedToken.startsWith('{')) {
          // It's TokenManager format, use tokenManager to decrypt
          decryptedToken = (this.tokenManager as any).decryptToken?.(token.encryptedToken) || this.decryptToken(token.encryptedToken);
        } else {
          // It's our format
          decryptedToken = this.decryptToken(token.encryptedToken);
        }
      } catch (error) {
        // Fallback to our decryption
        decryptedToken = this.decryptToken(token.encryptedToken);
      }

      return {
        tokenId: token.id,
        token: decryptedToken,
        estimatedWaitTime: waitTime,
        qualityScore: quality,
        tier: token.tier
      };
    } catch (error) {
      console.error('Error decrypting token in formatTokenResult:', error);
      throw new Error('Failed to decrypt token');
    }
  }

  // ========================================
  // Token Health Monitoring
  // ========================================

  async updateTokenHealth(tokenId: string, success: boolean, responseTime: number) {
    // Intentar actualizar en TokenPool primero
    let token = await this.prisma.tokenPool.findUnique({
      where: { id: tokenId }
    });

    // Si no está en TokenPool, podría ser un token de TokenManager (fallback)
    // En ese caso, actualizar a través de TokenManager
    if (!token) {
      // El tokenId podría ser de TokenManager, intentar actualizar allí
      try {
        await this.tokenManager.updateTokenUsage(tokenId, {
          endpoint: '/generate',
          method: 'POST',
          statusCode: success ? 200 : 500,
          responseTime: responseTime,
          timestamp: new Date(),
          error: success ? undefined : 'Generation failed'
        });
      } catch (err) {
        console.warn(`Could not update token health for ${tokenId}:`, err);
      }
      return;
    }

    const newSuccessCount = success ? token.successCount + 1 : token.successCount;
    const newFailureCount = success ? token.failureCount : token.failureCount + 1;
    const totalRequests = newSuccessCount + newFailureCount;

    // Calculate new health score (0-100)
    const successRate = newSuccessCount / (totalRequests || 1);
    // Response time factor: < 2s = 100, 10s = 0
    const responseTimeFactor = Math.max(0, 1 - (responseTime / 10000));

    const healthScore = Math.round((successRate * 0.7 + responseTimeFactor * 0.3) * 100);

    // Update average response time (exponential moving average)
    const alpha = 0.3; // Weight for new value
    const newAvgResponseTime = (alpha * responseTime) + ((1 - alpha) * token.avgResponseTime);

    await this.prisma.tokenPool.update({
      where: { id: tokenId },
      data: {
        successCount: newSuccessCount,
        failureCount: newFailureCount,
        healthScore,
        avgResponseTime: newAvgResponseTime,
        lastUsed: new Date(),
        lastHealthCheck: new Date(),
        isActive: healthScore >= 30 // Auto-deactivate if health too low
      }
    });

    // Alert if token is failing
    if (healthScore < 50) {
      console.warn(`Health Alert: Token ${tokenId} dropped to ${healthScore}% health.`);
    }
  }

  // ========================================
  // Admin / Stats Methods
  // ========================================

  async getPoolHealth(): Promise<any> {
    const total = await this.prisma.tokenPool.count();
    const active = await this.prisma.tokenPool.count({ where: { isActive: true } });
    const healthy = await this.prisma.tokenPool.count({ where: { isActive: true, healthScore: { gte: 70 } } });

    // Calculate queue wait time (mock or from redis)
    const queueLength = await this.getQueueLength();
    const avgWaitTime = queueLength * 30; // 30s estimate per item

    return {
      status: active > 0 ? 'operational' : 'degraded',
      health_score: total > 0 ? Math.round((healthy / total) * 100) : 0,
      active_tokens: active,
      total_tokens: total,
      queue_depth: queueLength,
      avg_wait_time: avgWaitTime,
      last_updated: new Date()
    };
  }

  async getPoolStatistics(): Promise<any> {
    const total = await this.prisma.tokenPool.count();
    const active = await this.prisma.tokenPool.count({ where: { isActive: true } });

    // Group by tier
    const tiers = await this.prisma.tokenPool.groupBy({
      by: ['tier'],
      _count: {
        id: true
      }
    });

    return {
      overview: {
        total_tokens: total,
        active_tokens: active,
        utilization_rate: active > 0 ? Math.round((active / total) * 100) : 0
      },
      tiers: tiers.map(t => ({ name: t.tier, count: t._count.id })),
      performance: await this.calculateRealPerformance()
    };
  }

  // ========================================
  // Real Performance Calculation
  // ========================================

  private async calculateRealPerformance(): Promise<{ success_rate: number; avg_generation_time: number }> {
    try {
      // Get recent token usage from last 24 hours
      const recentUsage = await this.prisma.tokenUsage.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 1000
      });

      if (recentUsage.length === 0) {
        return { success_rate: 100, avg_generation_time: 0 };
      }

      // Calculate success rate
      const successful = recentUsage.filter(u => u.statusCode >= 200 && u.statusCode < 300).length;
      const success_rate = (successful / recentUsage.length) * 100;

      // Calculate average generation time
      const avg_generation_time = recentUsage.reduce((sum, u) => sum + u.responseTime, 0) / recentUsage.length;

      return {
        success_rate: Math.round(success_rate * 100) / 100,
        avg_generation_time: Math.round(avg_generation_time)
      };
    } catch (error) {
      console.error('Error calculating real performance:', error);
      return { success_rate: 0, avg_generation_time: 0 };
    }
  }

  // ========================================
  // Queue Management (Basic)
  // ========================================

  async getQueueLength(tier?: string): Promise<number> {
    const cacheKey = tier ? `queue:length:${tier}` : 'queue:length:global';
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return parseInt(cached);
    }

    const where: any = {
      status: { in: ['queued', 'processing'] }
    };

    // If we had tier filtering in DB relations, we'd add it here
    // For now returning global or mock filtering

    const length = await this.prisma.generationQueue.count({
      where
    });

    if (this.redis) {
      await this.redis.setex(cacheKey, 5, length.toString());
    }
    return length;
  }

  // ========================================
  // Utilities & Encryption
  // ========================================

  public encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  public decryptToken(encryptedToken: string): string {
    try {
      const textParts = encryptedToken.split(':');
      if (textParts.length < 2) {
        throw new Error('Invalid encrypted token format');
      }
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error(`Failed to decrypt token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
