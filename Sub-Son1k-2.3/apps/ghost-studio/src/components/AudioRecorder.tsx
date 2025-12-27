'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Headphones, Volume2 } from 'lucide-react';
import Waveform from './Waveform';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio context para análisis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob);
        chunksRef.current = [];
        setDuration(0);
      };

      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsMonitoring(true);
      
      // Start analyzing audio levels
      analyzeAudio();

      // Update duration
      const interval = setInterval(() => {
        if (isRecording) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        } else {
          clearInterval(interval);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al acceder al micrófono. Por favor, permite el acceso.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsMonitoring(false);
      setAudioLevel(0);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-mint">Grabación Directa</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`btn-ghost px-3 py-1.5 rounded-lg text-sm ${isMonitoring ? 'border-mint text-mint' : ''}`}
          >
            <Headphones className="w-4 h-4 mr-1 inline" /> Monitor
          </button>
          <div className="text-sm font-mono text-lavender">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Audio Level Meter */}
      <div className="relative h-2 bg-bg-card rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-mint via-blue to-purple transition-all duration-75"
          style={{ width: `${isRecording ? audioLevel * 100 : 0}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-gray-500 font-mono">
            {Math.round(audioLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center">
        {!isRecording ? (
          <button onClick={startRecording} className="btn-neon mint px-6 py-3 rounded-lg">
            <Mic className="w-5 h-5 mr-2 inline" /> Iniciar Grabación
          </button>
        ) : (
          <button onClick={stopRecording} className="btn-neon purple px-6 py-3 rounded-lg">
            <Square className="w-5 h-5 mr-2 inline" /> Detener
          </button>
        )}
      </div>

      {/* Waveform Preview */}
      {audioURL && <Waveform url={audioURL} />}
    </div>
  );
}


