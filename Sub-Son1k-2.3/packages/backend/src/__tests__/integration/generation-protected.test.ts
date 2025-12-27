/**
 * Integration Tests for Protected Generation Routes
 * Tests authenticated generation endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { generationRoutes } from '../../routes/generation';
import { SunoService } from '../../services/sunoService';
import { AnalyticsService } from '../../services/analyticsService';
import { addGenerationJob } from '../../queue';

// Mock dependencies
vi.mock('../../services/sunoService');
vi.mock('../../services/analyticsService');
vi.mock('../../queue');
vi.mock('../../middleware/auth', () => ({
  authMiddleware: vi.fn((req, res, next) => {
    (req as any).user = {
      id: 'user-123',
      email: 'test@example.com',
      tier: 'FREE'
    };
    return next();
  }),
  quotaMiddleware: vi.fn((req, res, next) => {
    (req as any).quotaInfo = {
      remainingGenerations: 5,
      usedThisMonth: 0,
      monthlyLimit: 5
    };
    return next();
  })
}));
vi.mock('../../lib/validation', () => ({
  validateRequest: vi.fn((schema, data) => data),
  generationRequestSchema: {}
}));

describe('Protected Generation Routes', () => {
  let app: FastifyInstance;
  let mockSunoService: any;
  let mockAnalyticsService: any;
  let mockPrisma: any;

  beforeEach(async () => {
    // Mock Prisma
    mockPrisma = {
      generation: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      userTier: {
        findUnique: vi.fn()
      }
    };

    // Mock SunoService
    mockSunoService = {
      generateMusic: vi.fn(),
      checkGenerationStatus: vi.fn()
    };

    // Mock AnalyticsService
    mockAnalyticsService = {
      trackGeneration: vi.fn()
    };

    // Create Fastify app
    app = (await import('fastify')).default({
      logger: false
    }) as FastifyInstance;

    // Decorate with Prisma
    app.decorate('prisma', mockPrisma);

    // Register routes
    await app.register(
      generationRoutes(mockSunoService as SunoService, mockAnalyticsService as AnalyticsService),
      {
        prefix: '/api/generation'
      }
    );

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  describe('POST /api/generation/create', () => {
    it('should create a generation with authenticated user', async () => {
      const mockGeneration = {
        id: 'gen-123',
        userId: 'user-123',
        prompt: 'Happy pop song',
        style: 'pop',
        duration: 60,
        quality: 'standard',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.generation.create.mockResolvedValue(mockGeneration);
      vi.mocked(addGenerationJob).mockResolvedValue({} as any);
      mockAnalyticsService.trackGeneration.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'POST',
        url: '/api/generation/create',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          prompt: 'Happy pop song',
          style: 'pop',
          duration: 60,
          quality: 'standard'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.generationId).toBe('gen-123');
      expect(body.data.status).toBe('pending');

      // Verify Prisma was called with userId
      expect(mockPrisma.generation.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          prompt: 'Happy pop song',
          style: 'pop',
          duration: 60,
          quality: 'standard',
          status: 'pending'
        }
      });

      // Verify analytics was tracked
      expect(mockAnalyticsService.trackGeneration).toHaveBeenCalled();
    });

    it('should return 403 when quota is exceeded', async () => {
      // Mock quota middleware to return no remaining generations
      const { quotaMiddleware } = await import('../../middleware/auth');
      vi.mocked(quotaMiddleware).mockImplementation((req, res, next) => {
        (req as any).quotaInfo = {
          remainingGenerations: 0,
          usedThisMonth: 5,
          monthlyLimit: 5
        };
        return next();
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/generation/create',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          prompt: 'Happy pop song',
          style: 'pop',
          duration: 60,
          quality: 'standard'
        }
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('QUOTA_EXCEEDED');
    });

    it('should return 400 for invalid request data', async () => {
      const { validateRequest } = await import('../../lib/validation');
      vi.mocked(validateRequest).mockImplementation(() => {
        const error = new Error('Validation failed');
        (error as any).name = 'ValidationError';
        (error as any).message = 'Invalid prompt';
        throw error;
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/generation/create',
        headers: {
          authorization: 'Bearer test-token'
        },
        payload: {
          prompt: '' // Invalid: empty prompt
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

