/**
 * Admin Routes
 * Dashboard and administrative endpoints
 */

import { FastifyInstance } from 'fastify';
import { adminMiddleware } from '../middleware/auth';
import { TokenManager } from '../services/tokenManager';
import { TokenPoolService } from '../services/tokenPoolService';
import { AnalyticsService } from '../services/analyticsService';
import { getAlertService } from '../services/alertService';
import { getAbuseDetectionService } from '../middleware/abuseDetection';

export function adminRoutes(
  tokenManager: TokenManager,
  tokenPoolService: TokenPoolService,
  analyticsService: AnalyticsService
) {
  return async function (fastify: FastifyInstance) {
    // Admin dashboard endpoint
    fastify.get('/dashboard', {
      preHandler: [adminMiddleware],
    }, async (request, reply) => {
      try {
        // Get token pool statistics
        const poolStats = await tokenManager.getPoolStats();
        const poolHealth = await tokenPoolService.getPoolHealth();
        const poolMetrics = await tokenPoolService.getPoolStatistics();

        // Get analytics
        const activeUsers = await analyticsService.getActiveUserCount();
        const recentGenerations = await analyticsService.getRecentGenerations(24); // Last 24 hours

        // Calculate generation stats
        const generationsLast24h = recentGenerations.length;
        const successRate = recentGenerations.length > 0
          ? (recentGenerations.filter((g: any) => g.status === 'COMPLETED').length / recentGenerations.length) * 100
          : 100;

        // Get alerts
        const alertService = getAlertService();
        const activeAlerts = alertService.getActiveAlerts();
        const alertStats = alertService.getAlertStats();

        // Get abuse detection stats
        const abuseService = getAbuseDetectionService();
        const abuseStats = await abuseService.getAbuseStats();

        // Get system metrics
        const systemMetrics = {
          uptime: process.uptime(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
          },
          nodeVersion: process.version,
        };

        // Get user tier distribution
        const tierDistribution = await fastify.prisma.user.groupBy({
          by: ['tier'],
          _count: {
            tier: true,
          },
        });

        // Get recent generations by status
        const generationsByStatus = await fastify.prisma.generation.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        return {
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            tokenPool: {
              total: poolStats.totalTokens,
              active: poolStats.activeTokens,
              healthy: poolStats.healthyTokens,
              healthPercentage: poolHealth.healthPercentage,
              averageResponseTime: poolStats.averageResponseTime,
              successRate: poolStats.successRate,
              totalRequests: poolStats.totalRequests,
              issues: poolHealth.issues,
            },
            usage: {
              activeUsers,
              generationsLast24h,
              successRate: Math.round(successRate * 100) / 100,
              generationsByStatus: generationsByStatus.map((g: any) => ({
                status: g.status,
                count: g._count.status,
              })),
            },
            users: {
              tierDistribution: tierDistribution.map((t: any) => ({
                tier: t.tier,
                count: t._count.tier,
              })),
            },
            alerts: {
              active: activeAlerts.length,
              critical: activeAlerts.filter((a) => a.level === 'critical').length,
              warning: activeAlerts.filter((a) => a.level === 'warning').length,
              stats: alertStats,
              recent: activeAlerts.slice(0, 10).map((a) => ({
                id: a.id,
                level: a.level,
                category: a.category,
                message: a.message,
                timestamp: a.timestamp,
                details: a.details,
              })),
            },
            security: {
              blockedEntities: abuseStats.blockedEntities,
              abusePatternsLast24h: abuseStats.patternsLast24h,
            },
            system: systemMetrics,
          },
        };
      } catch (error) {
        console.error('Admin dashboard error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'DASHBOARD_ERROR',
            message: 'Failed to fetch dashboard data',
          },
        });
      }
    });

    // Get token pool details
    fastify.get('/tokens', {
      preHandler: [adminMiddleware],
    }, async (request, reply) => {
      try {
        const { page = 1, limit = 50 } = request.query as any;
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
                  tier: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          fastify.prisma.token.count(),
        ]);

        return {
          success: true,
          data: {
            tokens: tokens.map((token) => ({
              id: token.id,
              hash: token.hash.substring(0, 16) + '...', // Partial hash for security
              userId: token.userId,
              user: token.user ? {
                email: token.user.email,
                username: token.user.username,
                tier: token.user.tier,
              } : null,
              isActive: token.isActive,
              isValid: token.isValid,
              usageCount: token.usageCount,
              tier: token.tier,
              lastUsed: token.lastUsed,
              createdAt: token.createdAt,
            })),
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          },
        };
      } catch (error) {
        console.error('Admin tokens error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'TOKENS_ERROR',
            message: 'Failed to fetch tokens',
          },
        });
      }
    });

    // Get active alerts
    fastify.get('/alerts', {
      preHandler: [adminMiddleware],
    }, async (request, reply) => {
      try {
        const { level, limit = 50 } = request.query as any;
        const alertService = getAlertService();

        const alerts = level
          ? alertService.getActiveAlerts(level as any)
          : alertService.getActiveAlerts();

        return {
          success: true,
          data: {
            alerts: alerts.slice(0, limit).map((alert) => ({
              id: alert.id,
              level: alert.level,
              category: alert.category,
              message: alert.message,
              details: alert.details,
              timestamp: alert.timestamp,
              resolved: alert.resolved,
              resolvedAt: alert.resolvedAt,
            })),
            stats: alertService.getAlertStats(),
          },
        };
      } catch (error) {
        console.error('Admin alerts error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'ALERTS_ERROR',
            message: 'Failed to fetch alerts',
          },
        });
      }
    });

    // Resolve alert
    fastify.post('/alerts/:alertId/resolve', {
      preHandler: [adminMiddleware],
    }, async (request, reply) => {
      try {
        const { alertId } = request.params as any;
        const alertService = getAlertService();

        const resolved = await alertService.resolveAlert(alertId);

        if (!resolved) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'ALERT_NOT_FOUND',
              message: 'Alert not found',
            },
          });
        }

        return {
          success: true,
          data: {
            message: 'Alert resolved successfully',
          },
        };
      } catch (error) {
        console.error('Resolve alert error:', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'RESOLVE_ALERT_ERROR',
            message: 'Failed to resolve alert',
          },
        });
      }
    });
  };
}

