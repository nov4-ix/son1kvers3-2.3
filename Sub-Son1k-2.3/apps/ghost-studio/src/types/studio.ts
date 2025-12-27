export interface AnalysisResult {
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  instruments: string[];
  mood: string;
  energy: number;
  tempo: string;
  confidence?: number;
  density?: number;
  styleTags?: string[];
  genreDescription?: string;
  probableInstruments?: string[];
  instrumentDescription?: string;
  notes?: string;
}

export interface StudioState {
  audioBuffer: AudioBuffer | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

