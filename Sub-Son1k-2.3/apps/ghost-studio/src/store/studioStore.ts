import { create } from 'zustand';
import type { AnalysisResult } from '../types/studio';

interface StudioState {
  audioBuffer: AudioBuffer | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  // New: Loading and error states
  isLoading: boolean;
  error: string | null;
  // New: Audio context for cleanup
  audioContext: AudioContext | null;
  
  setAudioBuffer: (buffer: AudioBuffer | null) => void;
  setAudioUrl: (url: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysis: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAudioContext: (context: AudioContext | null) => void;
  // Cleanup function
  cleanup: () => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  audioBuffer: null,
  audioUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  analysisResult: null,
  isAnalyzing: false,
  isLoading: false,
  error: null,
  audioContext: null,
  
  setAudioBuffer: (buffer: AudioBuffer | null) => set({ audioBuffer: buffer }),
  setAudioUrl: (url: string | null) => {
    // Cleanup previous URL if exists
    const { audioUrl: prevUrl } = get();
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    set({ audioUrl: url });
  },
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setAnalysisResult: (result: AnalysisResult | null) => set({ analysisResult: result }),
  setAnalysis: (result: AnalysisResult | null) => set({ analysisResult: result }),
  setIsAnalyzing: (analyzing: boolean) => set({ isAnalyzing: analyzing }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setAudioContext: (context: AudioContext | null) => set({ audioContext: context }),
  
  // Cleanup function for memory management
  cleanup: () => {
    const { audioUrl, audioContext } = get();
    
    // Revoke object URLs
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Close audio context
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(console.error);
    }
    
    // Reset state
    set({
      audioBuffer: null,
      audioUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      error: null,
      audioContext: null
    });
  }
}));

