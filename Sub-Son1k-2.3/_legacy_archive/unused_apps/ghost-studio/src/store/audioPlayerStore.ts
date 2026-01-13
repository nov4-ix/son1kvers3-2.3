import { create } from 'zustand';
import { useEffect } from 'react';

// Audio cache for performance
const audioCache = new Map<string, HTMLAudioElement>();

// Types for better TypeScript strictness
export interface AudioPlayerState {
  // Current track
  currentTrack: AudioTrack | null;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // 0-100 for progress bar
  duration: number;
  currentTime: number;
  
  // Error state
  error: string | null;
  
  // Volume
  volume: number;
  
  // Player instance
  player: HTMLAudioElement | null;
}

export interface AudioTrack {
  id: string;
  trackSrc: string;
  trackName: string;
  authorName?: string;
  duration?: number;
}

interface AudioPlayerActions {
  // Track management
  playTrack: (track: AudioTrack) => Promise<void>;
  pauseTrack: () => void;
  stopTrack: () => void;
  seekTo: (time: number) => void;
  
  // Volume
  setVolume: (volume: number) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Cleanup
  cleanup: () => void;
}

type AudioPlayerStore = AudioPlayerState & AudioPlayerActions;

export const useAudioPlayerStore = create<AudioPlayerStore>((set, get) => ({
  // Initial state
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  currentTime: 0,
  error: null,
  volume: 1,
  player: null,

  // Play track with caching and error handling
  playTrack: async (track: AudioTrack) => {
    try {
      const { player: currentPlayer, currentTrack: current } = get();
      
      // Stop current track if playing
      if (currentPlayer && current) {
        currentPlayer.pause();
        currentPlayer.currentTime = 0;
      }

      // Check cache first
      let player = audioCache.get(track.id);
      
      if (!player) {
        // Create new player
        player = new Audio(track.trackSrc);
        
        // Error handling
        player.onerror = (error) => {
          console.error('Error loading audio:', error);
          set({ 
            isLoading: false, 
            error: 'Failed to load audio. Please try again.' 
          });
        };

        // Load event
        player.onloadedmetadata = () => {
          set({ 
            duration: player?.duration || 0,
            isLoading: false 
          });
        };

        // Progress tracking
        player.ontimeupdate = () => {
          if (player) {
            const progress = player.duration > 0 
              ? (player.currentTime / player.duration) * 100 
              : 0;
            set({ 
              currentTime: player.currentTime,
              progress 
            });
          }
        };

        // End of track
        player.onended = () => {
          set({ 
            isPlaying: false, 
            currentTime: 0, 
            progress: 0 
          });
        };

        // Loading state
        player.onloadstart = () => {
          set({ isLoading: true, error: null });
        };

        // Cache the player
        audioCache.set(track.id, player);
      }

      // Set volume
      player.volume = get().volume;

      // Play
      await player.play();
      
      set({ 
        currentTrack: track,
        player,
        isPlaying: true,
        isLoading: false,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to play track';
      
      console.error('Error playing track:', error);
      set({ 
        isLoading: false, 
        error: errorMessage,
        isPlaying: false 
      });
    }
  },

  // Pause track
  pauseTrack: () => {
    const { player } = get();
    if (player) {
      player.pause();
      set({ isPlaying: false });
    }
  },

  // Stop track
  stopTrack: () => {
    const { player } = get();
    if (player) {
      player.pause();
      player.currentTime = 0;
      set({ 
        isPlaying: false, 
        currentTime: 0, 
        progress: 0 
      });
    }
  },

  // Seek to time
  seekTo: (time: number) => {
    const { player, duration } = get();
    if (player && duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      player.currentTime = clampedTime;
      set({ 
        currentTime: clampedTime,
        progress: (clampedTime / duration) * 100 
      });
    }
  },

  // Set volume
  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const { player } = get();
    
    if (player) {
      player.volume = clampedVolume;
    }
    
    set({ volume: clampedVolume });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Cleanup - dispose of players and clear cache
  cleanup: () => {
    const { player, currentTrack } = get();
    
    // Stop and dispose current player
    if (player && currentTrack) {
      player.pause();
      player.src = '';
      player.load();
    }
    
    // Clear cache
    audioCache.forEach((cachedPlayer) => {
      cachedPlayer.pause();
      cachedPlayer.src = '';
      cachedPlayer.load();
    });
    audioCache.clear();
    
    // Reset state
    set({
      currentTrack: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
      duration: 0,
      currentTime: 0,
      error: null,
      player: null
    });
  }
}));

// Hook for cleanup on unmount
export const useAudioPlayerCleanup = () => {
  useEffect(() => {
    return () => {
      const { cleanup } = useAudioPlayerStore.getState();
      cleanup();
    };
  }, []);
};

