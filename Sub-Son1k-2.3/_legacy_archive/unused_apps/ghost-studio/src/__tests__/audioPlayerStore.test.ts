/**
 * Audio Player Store Tests
 * Tests for audio player store functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAudioPlayerStore, type AudioTrack } from '../store/audioPlayerStore';

// Mock Audio API
global.Audio = vi.fn().mockImplementation(() => {
  const audio = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    duration: 0,
    volume: 1,
    onerror: null,
    onloadedmetadata: null,
    ontimeupdate: null,
    onended: null,
    onloadstart: null,
  };
  return audio;
});

describe('AudioPlayerStore', () => {
  const mockTrack: AudioTrack = {
    id: 'test-track-1',
    trackSrc: 'https://example.com/audio.mp3',
    trackName: 'Test Track',
    authorName: 'Test Artist',
    duration: 120
  };

  beforeEach(() => {
    // Reset store state
    const { cleanup } = useAudioPlayerStore.getState();
    cleanup();
  });

  it('should have initial state', () => {
    const state = useAudioPlayerStore.getState();
    
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.progress).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.error).toBeNull();
    expect(state.volume).toBe(1);
  });

  it('should play a track', async () => {
    const { playTrack } = useAudioPlayerStore.getState();
    
    await playTrack(mockTrack);
    
    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack).toEqual(mockTrack);
    expect(state.isPlaying).toBe(true);
  });

  it('should pause a track', async () => {
    const { playTrack, pauseTrack } = useAudioPlayerStore.getState();
    
    await playTrack(mockTrack);
    pauseTrack();
    
    const state = useAudioPlayerStore.getState();
    expect(state.isPlaying).toBe(false);
  });

  it('should stop a track', async () => {
    const { playTrack, stopTrack } = useAudioPlayerStore.getState();
    
    await playTrack(mockTrack);
    stopTrack();
    
    const state = useAudioPlayerStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTime).toBe(0);
    expect(state.progress).toBe(0);
  });

  it('should set volume', () => {
    const { setVolume } = useAudioPlayerStore.getState();
    
    setVolume(0.5);
    
    const state = useAudioPlayerStore.getState();
    expect(state.volume).toBe(0.5);
  });

  it('should clamp volume to 0-1', () => {
    const { setVolume } = useAudioPlayerStore.getState();
    
    setVolume(1.5);
    expect(useAudioPlayerStore.getState().volume).toBe(1);
    
    setVolume(-0.5);
    expect(useAudioPlayerStore.getState().volume).toBe(0);
  });

  it('should seek to time', async () => {
    const { playTrack, seekTo } = useAudioPlayerStore.getState();
    
    await playTrack(mockTrack);
    seekTo(30);
    
    const state = useAudioPlayerStore.getState();
    expect(state.currentTime).toBe(30);
  });

  it('should handle errors', async () => {
    // Mock Audio to throw error
    const originalAudio = global.Audio;
    global.Audio = vi.fn().mockImplementation(() => {
      throw new Error('Failed to load audio');
    });

    const { playTrack } = useAudioPlayerStore.getState();
    
    await playTrack(mockTrack);
    
    const state = useAudioPlayerStore.getState();
    expect(state.error).toBeTruthy();
    expect(state.isPlaying).toBe(false);

    // Restore
    global.Audio = originalAudio;
  });

  it('should cleanup on unmount', () => {
    const { cleanup } = useAudioPlayerStore.getState();
    
    cleanup();
    
    const state = useAudioPlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.player).toBeNull();
  });
});

