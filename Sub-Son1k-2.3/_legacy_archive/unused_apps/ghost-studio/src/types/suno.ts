export interface SunoCoverRequest {
  audioUrl: string;
  prompt?: string;
  style?: string;
}

export interface SunoCoverResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  error?: string;
}

export interface KnobSettings {
  expressivity: number;
  rareza: number;
  garage: number;
  trash: number;
}

export interface SunoTaskStatus {
  id: string;
  taskId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  error?: string;
  progress?: number;
  duration?: number;
  createdAt?: string;
}

