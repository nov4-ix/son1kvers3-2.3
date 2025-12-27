// apps/ghost-studio/src/components/daw/MiniDAW.tsx
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDAW } from '@/hooks/useDAW';
import type { AudioFile } from '@/types/audio';

interface Props {
  onRecordingComplete: (file: AudioFile) => void;
}

interface LoopTrack {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
}

export function MiniDAW({ onRecordingComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [loops, setLoops] = useState<LoopTrack[]>([]);
  const [currentLoop, setCurrentLoop] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { start: startTone } = useDAW();

  const startRecording = async () => {
    try {
      await startTone();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        // Create AudioFile object
        const audioFile: AudioFile = {
          id: Math.random().toString(36).substr(2, 9),
          file: new File([blob], 'recording.wav', { type: 'audio/wav' }),
          url,
          duration: 0, // Will be set after loading
          format: 'wav',
          size: blob.size,
          metadata: {
            duration: 0,
          sampleRate: 44100,
          channels: 1
          }
        };

        // Load audio to get duration
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          audioFile.duration = audio.duration;
          onRecordingComplete(audioFile);
        };
        audio.src = url;
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current && recordedUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        stopLooping();
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const addToLooper = () => {
    if (recordedUrl && chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const newLoop: LoopTrack = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Loop ${loops.length + 1}`,
        blob,
        url,
        duration: 0 // Will be calculated
      };

      // Calculate duration
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        newLoop.duration = audio.duration;
        setLoops(prev => [...prev, newLoop]);
      };
      audio.src = url;
    }
  };

  const playLoop = (index: number) => {
    if (currentLoop === index) {
      stopLooping();
    } else {
      setCurrentLoop(index);
      setIsLooping(true);
      const loop = loops[index];
      
      if (audioRef.current) {
        audioRef.current.src = loop.url;
        audioRef.current.loop = true;
        audioRef.current.play();
        
        // Auto-stop after 30 seconds for demo
        loopIntervalRef.current = setTimeout(() => {
          stopLooping();
        }, 30000);
      }
    }
  };

  const stopLooping = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsLooping(false);
    setCurrentLoop(null);
    if (loopIntervalRef.current) {
      clearTimeout(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  const clearLoops = () => {
    loops.forEach(loop => URL.revokeObjectURL(loop.url));
    setLoops([]);
    stopLooping();
  };

  const exportLoops = () => {
    if (loops.length === 0) return;
    
    // Create a simple mix of all loops (for demo, just use the first loop)
    const firstLoop = loops[0];
    const audioFile: AudioFile = {
      id: Math.random().toString(36).substr(2, 9),
      file: new File([firstLoop.blob], 'looper-mix.wav', { type: 'audio/wav' }),
      url: firstLoop.url,
      duration: firstLoop.duration,
      format: 'wav',
      size: firstLoop.blob.size,
      metadata: {
        duration: firstLoop.duration,
      sampleRate: 44100,
      channels: 1
      }
    };
    
    onRecordingComplete(audioFile);
  };

  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearTimeout(loopIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card
      header={
        <div className="flex items-center">
          <Mic className="w-5 h-5 mr-2 text-magenta" />
          <h2 className="text-lg font-semibold text-white">Mini DAW & Looper</h2>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <Button
              variant="primary"
              size="lg"
              icon={<Mic className="w-5 h-5" />}
              onClick={startRecording}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              icon={<Square className="w-5 h-5" />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}

        {/* Playback Controls */}
        {recordedUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={recordedUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                onClick={playRecording}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                icon={<Layers className="w-4 h-4" />}
                onClick={addToLooper}
              >
                Add to Looper
              </Button>
            </div>
          </div>
        )}

        {/* Looper Section */}
        {loops.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-white">Looper Tracks</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={clearLoops}
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={exportLoops}
                >
                  Export Mix
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {loops.map((loop, index) => (
                <div
                  key={loop.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    currentLoop === index
                      ? 'border-cyan bg-cyan/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{loop.name}</span>
                    <span className="text-xs text-gray-400">{loop.duration.toFixed(1)}s</span>
                  </div>
                  
                  <Button
                    variant={currentLoop === index ? "primary" : "secondary"}
                    size="sm"
                    icon={currentLoop === index ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    onClick={() => playLoop(index)}
                  >
                    {currentLoop === index ? 'Stop' : 'Loop'}
                  </Button>
                </div>
              ))}
            </div>

            {isLooping && (
              <div className="flex items-center justify-center space-x-2 text-cyan">
                <div className="w-3 h-3 bg-cyan rounded-full animate-pulse" />
                <span className="text-sm font-medium">Looping...</span>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-400 space-y-1">
          <div>1. Record your audio</div>
          <div>2. Add tracks to the looper</div>
          <div>3. Layer loops to create beats</div>
          <div>4. Export your mix for Ghost Studio</div>
        </div>
      </div>
    </Card>
  );
}