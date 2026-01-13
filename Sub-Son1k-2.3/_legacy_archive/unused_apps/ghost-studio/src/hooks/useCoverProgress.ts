/**
 * useCoverProgress Hook
 * Manages real-time cover generation progress via WebSocket
 */
import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@super-son1k/shared-hooks';

export interface CoverProgress {
  taskId: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  imageUrl?: string;
  error?: string;
}

export function useCoverProgress(taskId: string | null) {
  const [progress, setProgress] = useState<CoverProgress | null>(null);

  const { 
    isConnected, 
    emit 
  } = useWebSocket(
    {
      autoConnect: true,
      reconnection: true,
    },
    {
      onCoverProgress: (data: any) => {
        if (data.taskId === taskId) {
          setProgress({
            taskId: data.taskId,
            progress: data.progress || 0,
            status: data.status as any,
            message: data.message || undefined,
          });
        }
      },
      onCoverComplete: (data) => {
        if (data.taskId === taskId) {
          setProgress({
            taskId: data.taskId,
            progress: 100,
            status: 'completed',
            imageUrl: data.imageUrl,
            message: 'Cover generado exitosamente',
          });
        }
      },
    }
  );

  // Subscribe to cover updates when taskId changes
  useEffect(() => {
    if (taskId && isConnected) {
      // Emit subscription event (backend should handle this)
      emit('subscribe:cover', { taskId });
    }
  }, [taskId, isConnected, emit]);

  const reset = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    progress,
    isConnected,
    reset,
  };
}

