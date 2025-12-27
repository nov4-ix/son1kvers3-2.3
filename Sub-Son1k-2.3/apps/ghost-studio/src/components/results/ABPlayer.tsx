// apps/ghost-studio/src/components/results/ABPlayer.tsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AudioFile } from '../../types/audio';
import type { SunoTaskStatus } from '../../types/suno';

interface Props {
  originalAudio: AudioFile | null;
  generatedAudio: SunoTaskStatus;
}

export function ABPlayer({ originalAudio, generatedAudio }: Props) {
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const [volumeA, setVolumeA] = useState(1);
  const [volumeB, setVolumeB] = useState(1);
  const [mutedA, setMutedA] = useState(false);
  const [mutedB, setMutedB] = useState(false);
  
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;

    if (audioA) {
      audioA.volume = mutedA ? 0 : volumeA;
    }
    if (audioB) {
      audioB.volume = mutedB ? 0 : volumeB;
    }
  }, [volumeA, volumeB, mutedA, mutedB]);

  const togglePlayA = () => {
    const audio = audioRefA.current;
    if (!audio) return;

    if (isPlayingA) {
      audio.pause();
      setIsPlayingA(false);
    } else {
      // Pause B if playing
      if (isPlayingB) {
        audioRefB.current?.pause();
        setIsPlayingB(false);
      }
      audio.play();
      setIsPlayingA(true);
    }
  };

  const togglePlayB = () => {
    const audio = audioRefB.current;
    if (!audio) return;

    if (isPlayingB) {
      audio.pause();
      setIsPlayingB(false);
    } else {
      // Pause A if playing
      if (isPlayingA) {
        audioRefA.current?.pause();
        setIsPlayingA(false);
      }
      audio.play();
      setIsPlayingB(true);
    }
  };

  const resetBoth = () => {
    const audioA = audioRefA.current;
    const audioB = audioRefB.current;
    
    if (audioA) {
      audioA.pause();
      audioA.currentTime = 0;
    }
    if (audioB) {
      audioB.pause();
      audioB.currentTime = 0;
    }
    
    setIsPlayingA(false);
    setIsPlayingB(false);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold gradient-text mb-4">A/B Comparison</h2>
        <p className="text-white/70">Compare your original track with the AI-generated cover</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Track (A) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-cyan">Original Track</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={mutedA ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                onClick={() => setMutedA(!mutedA)}
              >
                {mutedA ? 'Unmute' : 'Mute'}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={mutedA ? 0 : volumeA}
                onChange={(e) => {
                  setVolumeA(parseFloat(e.target.value));
                  setMutedA(false);
                }}
                className="w-20"
              />
            </div>
          </div>

          {originalAudio && (
            <>
              <audio
                ref={audioRefA}
                src={originalAudio.url}
                onEnded={() => setIsPlayingA(false)}
                onPlay={() => setIsPlayingA(true)}
                onPause={() => setIsPlayingA(false)}
              />
              
              <div className="space-y-4">
                <div className="bg-carbon/50 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-white/70 mb-2">File Info</div>
                  <div className="text-xs text-white/50 space-y-1">
                    {originalAudio.duration && (
                    <div>Duration: {Math.round(originalAudio.duration)}s</div>
                    )}
                    {originalAudio.format && (
                    <div>Format: {originalAudio.format.toUpperCase()}</div>
                    )}
                    {originalAudio.size && (
                    <div>Size: {(originalAudio.size / 1024 / 1024).toFixed(1)}MB</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={isPlayingA ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    onClick={togglePlayA}
                  >
                    {isPlayingA ? 'Pause' : 'Play'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Generated Track (B) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-magenta">AI Generated</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={mutedB ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                onClick={() => setMutedB(!mutedB)}
              >
                {mutedB ? 'Unmute' : 'Mute'}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={mutedB ? 0 : volumeB}
                onChange={(e) => {
                  setVolumeB(parseFloat(e.target.value));
                  setMutedB(false);
                }}
                className="w-20"
              />
            </div>
          </div>

          {generatedAudio.audioUrl && (
            <>
              <audio
                ref={audioRefB}
                src={generatedAudio.audioUrl}
                onEnded={() => setIsPlayingB(false)}
                onPlay={() => setIsPlayingB(true)}
                onPause={() => setIsPlayingB(false)}
              />
              
              <div className="space-y-4">
                <div className="bg-carbon/50 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-white/70 mb-2">Generation Info</div>
                  <div className="text-xs text-white/50 space-y-1">
                    <div>Status: {generatedAudio.status}</div>
                    {generatedAudio.duration && <div>Duration: {generatedAudio.duration}s</div>}
                    {generatedAudio.createdAt && (
                    <div>Created: {new Date(generatedAudio.createdAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={isPlayingB ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    onClick={togglePlayB}
                  >
                    {isPlayingB ? 'Pause' : 'Play'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Button
          variant="secondary"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={resetBoth}
        >
          Reset Both
        </Button>
      </motion.div>
    </div>
  );
}
