'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader } from 'lucide-react';
import { useAudioPlayerStore, useAudioPlayerCleanup, type AudioTrack } from '../store/audioPlayerStore';

interface AudioPlayerProps {
  track: AudioTrack;
  className?: string;
}

export default function AudioPlayer({ track, className }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    duration,
    currentTime,
    error,
    volume,
    playTrack,
    pauseTrack,
    stopTrack,
    seekTo,
    setVolume,
    clearError
  } = useAudioPlayerStore();

  // Cleanup on unmount
  useAudioPlayerCleanup();

  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  const handlePlayClick = async () => {
    if (isThisTrackPlaying) {
      pauseTrack();
    } else {
      if (currentTrack?.id !== track.id) {
        await playTrack(track);
      } else {
        await playTrack(track);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`glass-panel rounded-xl p-4 space-y-3 ${className || ''}`}>
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-red-400 text-sm flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Track Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayClick}
          disabled={isLoading}
          className="btn-neon mint p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isThisTrackPlaying ? `Pause ${track.trackName}` : `Play ${track.trackName}`}
          aria-pressed={isThisTrackPlaying}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : isThisTrackPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-mint truncate">
            {track.trackName}
          </h4>
          {track.authorName && (
            <p className="text-xs text-lavender/70 truncate">
              {track.authorName}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full slider"
            aria-label="Seek audio"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          />
          <div className="flex justify-between text-xs text-lavender/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-mint"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-lavender" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 slider"
          aria-label="Volume control"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(volume * 100)}
        />
        <span className="text-xs text-lavender/60 w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}

