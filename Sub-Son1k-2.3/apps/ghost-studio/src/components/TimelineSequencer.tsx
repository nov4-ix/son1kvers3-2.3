'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';

interface TimelineSequencerProps {
  duration?: number;
  onTimeChange?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function TimelineSequencer({ 
  duration = 120, 
  onTimeChange,
  onPlay,
  onPause 
}: TimelineSequencerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            onPause?.();
            return duration;
          }
          onTimeChange?.(newTime);
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration, onTimeChange, onPause]);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onTimeChange?.(0);
    onPause?.();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    onTimeChange?.(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const beats = Math.ceil(duration / 4); // 4 beats per measure
  const gridSize = 4; // seconds per grid unit

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-mint">Timeline</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono text-lavender">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="btn-ghost px-2 py-1 rounded text-xs"
            >
              −
            </button>
            <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="btn-ghost px-2 py-1 rounded text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
          className="btn-ghost p-2 rounded-lg"
        >
          <SkipBack size={18} />
        </button>
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="btn-neon mint p-3 rounded-lg"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={handleStop}
          className="btn-ghost p-2 rounded-lg"
        >
          <Square size={18} />
        </button>
        <button
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
          className="btn-ghost p-2 rounded-lg"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Timeline Grid */}
      <div
        ref={timelineRef}
        onClick={handleSeek}
        className="relative h-24 bg-bg-card rounded-lg overflow-hidden cursor-pointer border border-teal-dark"
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(duration / gridSize) + 1 }, (_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-teal-dark/30 flex items-center justify-center"
              style={{ minWidth: `${gridSize * zoom * 10}px` }}
            >
              <div className="text-xs text-gray-500 font-mono">
                {i * gridSize}s
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-mint z-10 pointer-events-none shadow-neon"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-mint" />
        </div>

        {/* Time Indicator */}
        <div
          className="absolute top-1 left-0 transform -translate-x-1/2 z-20 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="bg-bg-card border border-mint rounded px-2 py-1 text-xs font-mono text-mint">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </div>
  );
}


