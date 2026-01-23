import { FastifyInstance } from 'fastify'
import { WebSocket } from 'ws'
import { logger } from '../config/logger'
import { EventEmitter } from 'events'

// Event emitter global para generaciones
export const generationEvents = new EventEmitter()

interface Client {
  ws: WebSocket
  userId: string
  generationIds: Set<string>
}

const clients = new Map<string, Client>()

export async function setupWebSocket(app: FastifyInstance) {
  await app.register(require('@fastify/websocket'))

  app.get('/ws/generation', { websocket: true }, (connection, req) => {
    const ws = connection.socket
    const clientId = req.id
    const userId = (req as any).user?.id || 'anonymous'

    logger.info({ clientId, userId }, 'WebSocket client connected')

    const client: Client = {
      ws,
      userId,
      generationIds: new Set()
    }
    clients.set(clientId, client)

    // Mensaje de bienvenida
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      userId,
      timestamp: new Date().toISOString()
    }))

    // Manejar mensajes del cliente
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        logger.debug({ clientId, messageType: message.type }, 'WebSocket message received')

        switch (message.type) {
          case 'subscribe':
            // Suscribirse a una generación
            const { generationId } = message
            client.generationIds.add(generationId)
            logger.info({ clientId, generationId }, 'Client subscribed to generation')

            ws.send(JSON.stringify({
              type: 'subscribed',
              generationId,
              timestamp: new Date().toISOString()
            }))
            break

          case 'unsubscribe':
            client.generationIds.delete(message.generationId)
            logger.info({ clientId, generationId: message.generationId }, 'Client unsubscribed from generation')
            break

          case 'ping':
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }))
            break

          default:
            logger.warn({ clientId, messageType: message.type }, 'Unknown WebSocket message type')
        }
      } catch (error) {
        logger.error({ error, clientId }, 'Invalid WebSocket message')
      }
    })

    // Manejar desconexión
    ws.on('close', () => {
      clients.delete(clientId)
      logger.info({ clientId, userId }, 'WebSocket client disconnected')
    })

    ws.on('error', (error) => {
      logger.error({ error, clientId }, 'WebSocket error')
      clients.delete(clientId)
    })
  })

  // Escuchar eventos de generación y broadcast a clientes suscritos
  generationEvents.on('generation:update', (data: any) => {
    const { generationId, status, progress, tracks, audioUrl, error } = data

    logger.debug({ generationId, status }, 'Broadcasting generation update via WebSocket')

    // Enviar a todos los clientes suscritos
    for (const [clientId, client] of clients) {
      if (client.generationIds.has(generationId)) {
        try {
          client.ws.send(JSON.stringify({
            type: 'generation_update',
            generationId,
            status,
            progress,
            tracks,
            audioUrl,
            error,
            timestamp: new Date().toISOString()
          }))
        } catch (error) {
          logger.error({ error, clientId }, 'Failed to send WebSocket update')
          clients.delete(clientId)
        }
      }
    }
  })

  logger.info('WebSocket server configured for generation updates')
}

// Función para emitir actualizaciones
export function emitGenerationUpdate(
  generationId: string,
  status: string,
  progress?: number,
  tracks?: any[],
  audioUrl?: string,
  error?: string
) {
  generationEvents.emit('generation:update', {
    generationId,
    status,
    progress,
    tracks,
    audioUrl,
    error
  })
}