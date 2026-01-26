import { FastifyReply, FastifyRequest } from 'fastify'
import { httpRequestDuration, httpRequestTotal, httpRequestErrors } from '../monitoring/metrics'
import { logger } from '../config/logger'

export async function metricsMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const start = Date.now()
  const route = req.routerPath || req.url

  // Hook para medir después de enviar respuesta
  reply.addHook('onSend', async () => {
    const duration = (Date.now() - start) / 1000
    const statusCode = String(reply.statusCode)

    // Registrar duración
    httpRequestDuration
      .labels(req.method, route, statusCode)
      .observe(duration)

    // Registrar total de requests
    httpRequestTotal
      .labels(req.method, route, statusCode)
      .inc()

    // Registrar errores si status >= 400
    if (reply.statusCode >= 400) {
      const errorType = reply.statusCode >= 500 ? 'server_error' : 'client_error'
      httpRequestErrors
        .labels(req.method, route, errorType)
        .inc()
    }

    // Log detallado para requests lentos (>3s)
    if (duration > 3) {
      logger.warn({
        method: req.method,
        route,
        duration,
        statusCode,
        userId: (req as any).user?.id
      }, 'Slow request detected')
    }
  })
}