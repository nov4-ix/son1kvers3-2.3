/**
 * Token Routes
 * Handles token management operations
 */

import { FastifyInstance } from 'fastify';
import { TokenManager } from '../services/tokenManager';
import { TokenPoolService } from '../services/tokenPoolService';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export function tokenRoutes(tokenManager: TokenManager, tokenPoolService: TokenPoolService) {
  return async function(fastify: FastifyInstance) {
    // PUBLIC: Add token to pool (for extension integration) - MUST BE FIRST
    fastify.post('/add-public', async (request, reply) => {
      const { token, label, email, source = 'extension' } = request.body as any;

      try {
        if (!token) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'TOKEN_REQUIRED',
              message: 'Token is required'
            }
          });
        }

        // Validate token with generation API first
        const isValid = await tokenManager.validateTokenWithGenerationAPI(token);
        if (!isValid) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token validation failed with generation API'
            }
          });
        }

        // Add token without userId (system token for pool)
        const tokenId = await tokenManager.addToken(
          token,
          undefined, // No userId for extension tokens
          email || `extension-${source}`,
          'FREE', // Default tier for extension tokens
          {
            source,
            label: label || 'extension-auto',
            addedVia: 'extension',
            timestamp: new Date().toISOString()
          }
        );

        return {
          success: true,
          data: {
            tokenId,
            message: 'Token added successfully to backend pool',
            isValid
          }
        };

      } catch (error: any) {
        console.error('Add public token error:', error);
        
        // If token already exists, that's OK
        if (error.message?.includes('already exists') || error.message?.includes('Token already exists')) {
          return {
            success: true,
            data: {
              message: 'Token already exists in pool',
              duplicate: true
            }
          };
        }

        return reply.code(400).send({
          success: false,
          error: {
            code: 'TOKEN_ADD_FAILED',
            message: error.message || 'Failed to add token'
          }
        });
      }
    });

    // Get token pool status (PUBLIC for metrics)
    fastify.get('/pool/status', async (request, reply) => {
      try {
        const stats = await tokenManager.getPoolStats();

        return {
          success: true,
          data: stats
        };

      } catch (error) {
        console.error('Pool status error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'POOL_STATUS_FAILED',
            message: 'Failed to fetch token pool status'
          }
        });
      }
    });

    // Get user's tokens
    fastify.get('/user', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const user = (request as any).user;

      try {
        const tokens = await fastify.prisma.token.findMany({
          where: { userId: user.id },
          select: {
            id: true,
            hash: true,
            isActive: true,
            isValid: true,
            usageCount: true,
            tier: true,
            createdAt: true,
            lastUsed: true,
            expiresAt: true
          },
          orderBy: { createdAt: 'desc' }
        });

        return {
          success: true,
          data: tokens
        };

      } catch (error) {
        console.error('User tokens error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'USER_TOKENS_FAILED',
            message: 'Failed to fetch user tokens'
          }
        });
      }
    });

    // PROTECTED: Add token to pool (for authenticated users)
    fastify.post('/add', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const user = (request as any).user;
      const { token, email } = request.body as any;

      try {
        if (!token) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'TOKEN_REQUIRED',
              message: 'Token is required'
            }
          });
        }

        const tokenId = await tokenManager.addToken(
          token,
          user.id,
          email || user.email,
          user.tier as 'FREE' | 'PREMIUM' | 'ENTERPRISE'
        );

        return {
          success: true,
          data: {
            tokenId,
            message: 'Token added successfully'
          }
        };

      } catch (error) {
        console.error('Add token error:', error);
        return reply.code(400).send({
          success: false,
          error: {
            code: 'TOKEN_ADD_FAILED',
            message: 'Failed to add token'
          }
        });
      }
    });

    // PROTECTED: Acquire a token for generation (locks it)
    fastify.post('/acquire', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const user = (request as any).user;
      const { tier } = request.body as any; // Optional tier preference

      try {
        // Use user's tier if not specified, or upgrade if user has access
        const requestedTier = tier || user.tier;
        
        const result = await tokenManager.acquireToken(user.id, requestedTier);

        if (!result) {
          return reply.code(503).send({
            success: false,
            error: {
              code: 'NO_TOKENS_AVAILABLE',
              message: 'No healthy tokens available at the moment. Please try again later.'
            }
          });
        }

        return {
          success: true,
          data: {
            token: result.token,
            tokenId: result.tokenId,
            message: 'Token acquired successfully'
          }
        };

      } catch (error) {
        console.error('Acquire token error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKEN_ACQUIRE_FAILED',
            message: 'Failed to acquire token'
          }
        });
      }
    });

    // PROTECTED: Release a token lock (after generation)
    fastify.post('/release', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const { tokenId } = request.body as any;

      try {
        if (!tokenId) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'TOKEN_ID_REQUIRED',
              message: 'Token ID is required'
            }
          });
        }

        await tokenManager.releaseToken(tokenId);

        return {
          success: true,
          data: {
            message: 'Token released successfully'
          }
        };

      } catch (error) {
        console.error('Release token error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKEN_RELEASE_FAILED',
            message: 'Failed to release token'
          }
        });
      }
    });

    // Remove token from pool
    fastify.delete('/:tokenId', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const user = (request as any).user;
      const { tokenId } = request.params as any;

      try {
        const token = await fastify.prisma.token.findFirst({
          where: {
            id: tokenId,
            userId: user.id
          }
        });

        if (!token) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'TOKEN_NOT_FOUND',
              message: 'Token not found'
            }
          });
        }

        const success = await tokenManager.removeToken(tokenId);

        if (!success) {
          return reply.code(500).send({
            success: false,
            error: {
              code: 'TOKEN_REMOVE_FAILED',
              message: 'Failed to remove token'
            }
          });
        }

        return {
          success: true,
          data: {
            message: 'Token removed successfully'
          }
        };

      } catch (error) {
        console.error('Remove token error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKEN_REMOVE_FAILED',
            message: 'Failed to remove token'
          }
        });
      }
    });

    // Validate token
    fastify.post('/validate', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const { token } = request.body as any;

      try {
        if (!token) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'TOKEN_REQUIRED',
              message: 'Token is required'
            }
          });
        }

        // Check if token exists in pool
        const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
        const existingToken = await fastify.prisma.token.findUnique({
          where: { hash: tokenHash }
        });

        if (existingToken) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'TOKEN_EXISTS',
              message: 'Token already exists in pool'
            }
          });
        }

        // Validate with generation API
        const isValid = await tokenManager.validateTokenWithGenerationAPI(token);

        return {
          success: true,
          data: {
            isValid,
            message: isValid ? 'Token is valid' : 'Token is invalid'
          }
        };

      } catch (error) {
        console.error('Token validation error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKEN_VALIDATION_FAILED',
            message: 'Failed to validate token'
          }
        });
      }
    });

    // Get token usage statistics
    fastify.get('/usage', {
      preHandler: [authMiddleware]
    }, async (request, reply) => {
      const user = (request as any).user;
      const { period = '30d' } = request.query as any;

      try {
        const startDate = new Date();
        if (period === '7d') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (period === '30d') {
          startDate.setDate(startDate.getDate() - 30);
        } else if (period === '90d') {
          startDate.setDate(startDate.getDate() - 90);
        }

        const usage = await fastify.prisma.tokenUsage.findMany({
          where: {
            token: {
              userId: user.id
            },
            timestamp: {
              gte: startDate
            }
          },
          include: {
            token: {
              select: {
                id: true,
                tier: true
              }
            }
          },
          orderBy: { timestamp: 'desc' }
        });

        const stats = {
          totalRequests: usage.length,
          successfulRequests: usage.filter(u => u.statusCode >= 200 && u.statusCode < 300).length,
          averageResponseTime: usage.length > 0 
            ? usage.reduce((sum, u) => sum + u.responseTime, 0) / usage.length 
            : 0,
          requestsByTier: usage.reduce((acc, u) => {
            const tier = u.token.tier;
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentUsage: usage.slice(0, 10)
        };

        return {
          success: true,
          data: stats
        };

      } catch (error) {
        console.error('Token usage error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKEN_USAGE_FAILED',
            message: 'Failed to fetch token usage statistics'
          }
        });
      }
    });

    // Admin: Get all tokens
    fastify.get('/admin/all', {
      preHandler: [adminMiddleware]
    }, async (request, reply) => {
      const { page = 1, limit = 50 } = request.query as any;

      try {
        const skip = (page - 1) * limit;

        const [tokens, total] = await Promise.all([
          fastify.prisma.token.findMany({
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  tier: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          fastify.prisma.token.count()
        ]);

        return {
          success: true,
          data: {
            tokens,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit)
            }
          }
        };

      } catch (error) {
        console.error('Admin tokens error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'ADMIN_TOKENS_FAILED',
            message: 'Failed to fetch all tokens'
          }
        });
      }
    });

    // Admin: Force token health check
    fastify.post('/admin/health-check', {
      preHandler: [adminMiddleware]
    }, async (request, reply) => {
      try {
        const isHealthy = await tokenManager.performHealthCheck();

        return {
          success: true,
          data: {
            isHealthy,
            message: isHealthy ? 'Token pool is healthy' : 'Token pool has issues'
          }
        };

      } catch (error) {
        console.error('Health check error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'HEALTH_CHECK_FAILED',
            message: 'Failed to perform health check'
          }
        });
      }
    });

    // Admin: Cleanup expired tokens
    fastify.post('/admin/cleanup', {
      preHandler: [adminMiddleware]
    }, async (request, reply) => {
      try {
        const expiredTokens = await fastify.prisma.token.findMany({
          where: {
            expiresAt: {
              lt: new Date()
            },
            isActive: true
          }
        });

        let cleanedCount = 0;
        for (const token of expiredTokens) {
          const success = await tokenManager.removeToken(token.id);
          if (success) cleanedCount++;
        }

        return {
          success: true,
          data: {
            cleanedCount,
            message: `Cleaned up ${cleanedCount} expired tokens`
          }
        };

      } catch (error) {
        console.error('Cleanup error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'CLEANUP_FAILED',
            message: 'Failed to cleanup expired tokens'
          }
        });
      }
    });
  };
}
