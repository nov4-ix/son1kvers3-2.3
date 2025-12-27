'use client';

import WaveSurfer from 'wavesurfer.js';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface WaveformProps {
  url?: string;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

export default function Waveform({ url, onPlay, onPause, isPlaying = false }: WaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!waveformRef.current || !url) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#15333B',
      progressColor: '#40FDAE',
      cursorColor: '#B858FF',
      barWidth: 3,
      barRadius: 3,
      cursorWidth: 2,
      height: 100,
      barGap: 2,
      normalize: true,
    } as any); // Type assertion to avoid responsive option error

    ws.load(url);

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    ws.on('timeupdate', (time) => {
      setCurrentTime(time);
    });

    ws.on('play', () => {
      onPlay?.();
    });

    ws.on('pause', () => {
      onPause?.();
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [url, onPlay, onPause]);

  useEffect(() => {
    if (!wavesurfer) return;
    
    if (isPlaying) {
      wavesurfer.play();
      } else {
      wavesurfer.pause();
    }
  }, [isPlaying, wavesurfer]);

  const togglePlayback = () => {
    if (!wavesurfer) return;
    wavesurfer.playPause();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-mint">Waveform</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm font-mono text-lavender">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          {wavesurfer && (
            <button
              onClick={togglePlayback}
              className="btn-neon mint p-2 rounded-lg"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          )}
        </div>
      </div>

      <div ref={waveformRef} className="w-full" />

      {!url && (
        <div className="flex items-center justify-center h-24">
          <p className="text-gray-500 text-sm">Sin audio para mostrar</p>
          </div>
        )}
      </div>
  );
}
