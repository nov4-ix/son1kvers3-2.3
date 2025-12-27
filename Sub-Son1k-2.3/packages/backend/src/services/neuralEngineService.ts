/**
 * Music Generation Service
 * Handles integration with AI music generation API
 */

import { TokenManager } from './tokenManager';
import axios, { AxiosInstance } from 'axios';
import { env } from '../lib/config';

export interface GenerationRequest {
  prompt: string;
  style: string;
  duration: number;
  quality: string;
  userId: string; // Required - all generations must be associated with a user
  generationId: string;
}

export interface GenerationResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generationTaskId?: string;
  audioUrl?: string;
  metadata?: any;
  estimatedTime?: number;
  error?: string;
}

export class MusicGenerationService {
  private axiosInstances: Map<string, AxiosInstance> = new Map();

  constructor(private tokenManager: TokenManager) {}

  /**
   * Generate music using AI generation API
   */
  async generateMusic(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // Validate userId is provided (required for all generations)
      if (!request.userId) {
        return {
          status: 'failed',
          error: 'userId is required for all generations'
        };
      }

      // Get a healthy token
      const tokenData = await this.tokenManager.getHealthyToken(request.userId);
      
      if (!tokenData) {
        return {
          status: 'failed',
          error: 'No available tokens'
        };
      }

      // Create axios instance for this request
      const axiosInstance = this.createAxiosInstance(tokenData.token);

      // Prepare generation request (formato correcto para ai.imgkits.com)
      const generationData = {
        prompt: request.prompt,
        lyrics: '',
        title: '',
        style: request.style,
        customMode: false,
        instrumental: false
      };

      // Make request to AI generation API
      const response = await axiosInstance.post('/generate', generationData, {
        timeout: 30000
      });

      if (response.status === 200 && response.data) {
        // API devuelve taskId o id
        const generationTaskId = response.data.taskId || response.data.id || response.data.task_id;
        
        if (!generationTaskId) {
          return {
            status: 'failed',
            error: 'No taskId in API response'
          };
        }
        
        // Update token usage
        await this.tokenManager.updateTokenUsage(tokenData.tokenId, {
          endpoint: '/generate',
          method: 'POST',
          statusCode: response.status,
          responseTime: response.data.responseTime || 0,
          timestamp: new Date()
        });

        return {
          status: 'pending',
          generationTaskId,
          estimatedTime: this.estimateGenerationTime(request.duration, request.quality)
        };
      } else {
        return {
          status: 'failed',
          error: 'Invalid response from generation API'
        };
      }

    } catch (error) {
      console.error('Music generation error:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check generation status
   */
  async checkGenerationStatus(generationTaskId: string): Promise<GenerationResult> {
    try {
      // Get a healthy token
      const tokenData = await this.tokenManager.getHealthyToken();
      
      if (!tokenData) {
        return {
          status: 'failed',
          error: 'No available tokens'
        };
      }

      // Polling endpoint para verificar estado
      // ✅ VALIDAR VARIABLE DE ENTORNO
      const pollingUrl = env.GENERATION_POLLING_URL || env.SUNO_POLLING_URL || 'https://usa.imgkits.com/node-api/suno';
      
      const response = await axios.get(`${pollingUrl}/get_mj_status/${generationTaskId}`, {
        timeout: 10000,
        headers: {
          'authorization': `Bearer ${tokenData.token}`,
          'Content-Type': 'application/json',
          'channel': 'node-api',
          'origin': 'https://www.livepolls.app',
          'referer': 'https://www.livepolls.app/'
        }
      });

      if (response.status === 200 && response.data) {
        const data = response.data;
        
        // Update token usage
        await this.tokenManager.updateTokenUsage(tokenData.tokenId, {
          endpoint: `/get_mj_status/${generationTaskId}`,
          method: 'GET',
          statusCode: response.status,
          responseTime: data.responseTime || 0,
          timestamp: new Date()
        });

        // API devuelve { running: true/false, audio_url, ... }
        if (data.running === false && data.audio_url) {
          return {
            status: 'completed',
            generationTaskId,
            audioUrl: data.audio_url,
            metadata: {
              duration: data.duration,
              createdAt: new Date()
            }
          };
        } else if (data.running === true) {
          return {
            status: 'processing',
            generationTaskId,
            estimatedTime: 60
          };
        } else {
          return {
            status: 'pending',
            generationTaskId,
            estimatedTime: 60
          };
        }
      } else {
        return {
          status: 'failed',
          error: 'Invalid response from generation API'
        };
      }

    } catch (error) {
      console.error('Status check error:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create axios instance for generation API
   */
  private createAxiosInstance(token: string): AxiosInstance {
    // ✅ VALIDAR VARIABLE DE ENTORNO (prevenir crashes)
    const baseURL = env.GENERATION_API_URL || env.SUNO_API_URL || 'https://ai.imgkits.com/suno';
    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'channel': 'node-api',
        'origin': 'https://www.livepolls.app',
        'referer': 'https://www.livepolls.app/',
        'User-Agent': 'Super-Son1k-2.0/2.0',
        'X-Client-Version': '2.0.0'
      }
    });
  }

  /**
   * Generate tags based on style
   */
  private generateTags(style: string): string[] {
    const styleTags: Record<string, string[]> = {
      'pop': ['pop', 'catchy', 'melodic'],
      'rock': ['rock', 'guitar', 'energetic'],
      'hip-hop': ['hip-hop', 'rap', 'urban'],
      'electronic': ['electronic', 'synth', 'dance'],
      'jazz': ['jazz', 'smooth', 'sophisticated'],
      'classical': ['classical', 'orchestral', 'elegant'],
      'country': ['country', 'folk', 'acoustic'],
      'blues': ['blues', 'soulful', 'emotional'],
      'reggae': ['reggae', 'tropical', 'laid-back'],
      'metal': ['metal', 'heavy', 'aggressive']
    };

    return styleTags[style.toLowerCase()] || ['original', 'unique'];
  }

  /**
   * Estimate generation time based on duration and quality
   */
  private estimateGenerationTime(duration: number, quality: string): number {
    let baseTime = duration * 2; // Base 2x duration
    
    // Adjust based on quality
    switch (quality.toLowerCase()) {
      case 'standard':
        baseTime *= 1;
        break;
      case 'high':
        baseTime *= 1.5;
        break;
      case 'premium':
        baseTime *= 2;
        break;
      case 'enterprise':
        baseTime *= 2.5;
        break;
      default:
        baseTime *= 1;
    }

    // Minimum 30 seconds, maximum 10 minutes
    return Math.max(30, Math.min(600, baseTime));
  }

  /**
   * Health check for generation service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const tokenData = await this.tokenManager.getHealthyToken();
      
      if (!tokenData) {
        return false;
      }

      // Health check usando un endpoint simple
      try {
        const axiosInstance = this.createAxiosInstance(tokenData.token);
        // Intentar una llamada simple para verificar token
        const response = await axiosInstance.get('/generate', {
          timeout: 5000,
          validateStatus: () => true // Aceptar cualquier status para health check
        });
        // Si no es 401 (Unauthorized), el token es válido
        return response.status !== 401;
      } catch (error) {
        return false;
      }
    } catch (error) {
      console.error('Generation service health check failed:', error);
      return false;
    }
  }

  /**
   * Close service and cleanup
   */
  async close() {
    // Close all axios instances
    this.axiosInstances.clear();
  }
}
