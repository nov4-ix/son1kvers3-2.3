/**
 * API Response Types
 * Strict TypeScript types for API responses
 */

// Generation status types
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Generation response
export interface GenerateResponse {
  success: boolean;
  data: {
    generationId: string;
    taskId?: string;
    generationTaskId?: string;
    status: GenerationStatus;
    audioUrl?: string;
    estimatedTime?: number;
    message?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Cover generation response
export interface CoverGenerateResponse {
  success: boolean;
  data: {
    generationId: string;
    taskId: string;
    status: GenerationStatus;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Cover status response
export interface CoverStatusResponse {
  success: boolean;
  data: {
    id: string;
    taskId: string;
    status: GenerationStatus;
    audioUrl?: string;
    prompt?: string;
    style?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// History response
export interface HistoryResponse {
  success: boolean;
  data: Array<{
    id: string;
    generationTaskId?: string;
    prompt: string;
    style: string;
    duration: number;
    status: GenerationStatus;
    audioUrl?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: {
    code: string;
    message: string;
  };
}

// API Error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

