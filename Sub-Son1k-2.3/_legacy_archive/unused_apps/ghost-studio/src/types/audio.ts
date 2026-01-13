export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate?: number;
}

export interface AudioAnalysis {
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  instruments: string[];
  scale?: string;
  energy?: number;
}

export interface AudioFile {
  id?: string;
  file: File;
  url: string;
  metadata: AudioMetadata;
  duration?: number;
  format?: string;
  size?: number;
}

