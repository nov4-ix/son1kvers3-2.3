/**
 * Public Generation Routes
 * Permite crear generaciones sin autenticación utilizando la cola BullMQ
 */

import { FastifyInstance } from 'fastify';
import { SunoService } from '../services/sunoService';
import { addGenerationJob, getJobStatus } from '../queue';
import { generationRequestSchema, generationStatusSchema, validateRequest } from '../lib/validation';

export function publicGenerationRoutes(sunoService: SunoService) {
  return async function (fastify: FastifyInstance) {
    // Crear generación sin autenticación (ej. Ghost Studio)
    fastify.post('/create', async (request, reply) => {
      try {
        const validated = validateRequest(generationRequestSchema, request.body);
        const { prompt, style, duration, quality } = validated;

        const generation = await fastify.prisma.generation.create({
          data: {
            userId: null,
            prompt,
            style: style || 'pop',
            duration: duration || 60,
            quality: quality || 'standard',
            status: 'pending'
          }
        });

        await addGenerationJob({
          generationId: generation.id,
          userId: null,
          prompt,
          style,
          duration,
          quality,
          tier: 'PUBLIC'
        });

        return {
          success: true,
          data: {
            generationId: generation.id,
            status: 'pending',
            message: 'Generation queued successfully',
            estimatedTime: 60
          }
        };
      } catch (error: any) {
        if (error?.name === 'ValidationError') {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
              details: error.details
            }
          });
        }

        fastify.log.error('Public generation error: %s', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Failed to queue generation'
          }
        });
      }
    });

    // Obtener estado de generación pública
    fastify.get('/:generationId/status', async (request, reply) => {
      try {
        const { generationId } = validateRequest(generationStatusSchema, request.params);

        const generation = await fastify.prisma.generation.findFirst({
          where: {
            id: generationId,
            userId: null
          }
        });

        if (!generation) {
          return reply.code(404).send({
            success: false,
            error: {
              code: 'GENERATION_NOT_FOUND',
              message: 'Generation not found'
            }
          });
        }

        if (generation.status === 'pending' || generation.status === 'processing') {
          const jobStatus = await getJobStatus(generation.id);
          if (jobStatus) {
            if (jobStatus.state === 'completed' && generation.status !== 'COMPLETED') {
              if (!generation.audioUrl) {
                generation.status = 'PROCESSING';
              }
            } else if (jobStatus.state === 'failed') {
              generation.status = 'FAILED';
            } else if (jobStatus.state === 'active' || jobStatus.state === 'waiting') {
              generation.status = 'PROCESSING';
            }
          }

          if (generation.sunoId && (generation.status === 'pending' || generation.status === 'processing')) {
            const status = await sunoService.checkGenerationStatus(generation.sunoId);
            const normalizedStatus = status.status === 'pending' ? 'processing' : status.status;

            if (normalizedStatus !== generation.status || status.audioUrl) {
              await fastify.prisma.generation.update({
                where: { id: generation.id },
                data: {
                  status: normalizedStatus.toUpperCase(),
                  audioUrl: status.audioUrl || generation.audioUrl,
                  metadata: status.metadata ? JSON.stringify(status.metadata) : generation.metadata
                }
              });

              generation.status = normalizedStatus.toUpperCase();
              generation.audioUrl = status.audioUrl || generation.audioUrl;
              if (status.metadata) {
                generation.metadata = JSON.stringify(status.metadata);
              }
            }
          }
        }

        return {
          success: true,
          data: {
            id: generation.id,
            status: generation.status,
            prompt: generation.prompt,
            style: generation.style,
            duration: generation.duration,
            quality: generation.quality,
            audioUrl: generation.audioUrl,
            metadata: generation.metadata,
            createdAt: generation.createdAt,
            updatedAt: generation.updatedAt
          }
        };
      } catch (error: any) {
        if (error?.name === 'ValidationError') {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
              details: error.details
            }
          });
        }

        fastify.log.error('Public generation status error: %s', error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'STATUS_CHECK_FAILED',
            message: 'Failed to check generation status'
          }
        });
      }
    });
  };
}

