// apps/ghost-studio/src/components/analysis/AudioAnalyzer.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { audioAnalyzer } from '../../lib/audio/analyzer';
import type { AudioFile } from '../../types/audio';
import type { AudioAnalysis } from '../../types/audio';

interface Props {
  audioFile: AudioFile;
  onComplete: (analysis: AudioAnalysis) => void;
}

export function AudioAnalyzer({ audioFile, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeAudio();
  }, [audioFile]);

  const analyzeAudio = async () => {
    try {
      setError(null);
      setProgress(0);
      
      // Step 1: Load audio buffer
      setCurrentStep('Loading audio...');
      setProgress(10);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(audioFile.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setProgress(30);
      
      // Step 2: Analyze audio
      setCurrentStep('Analyzing audio features...');
      setProgress(50);
      
      const result = await audioAnalyzer.analyze(audioBuffer);
      
      setProgress(80);
      setCurrentStep('Finalizing analysis...');
      
      // Audio buffer loaded successfully
      
      setProgress(100);
      setCurrentStep('Analysis complete!');
      
      setTimeout(() => {
        setAnalysis(result);
        onComplete(result);
      }, 500);
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const steps = [
    { name: 'Load Audio', progress: 10 },
    { name: 'Extract Features', progress: 30 },
    { name: 'Detect BPM', progress: 50 },
    { name: 'Analyze Key', progress: 70 },
    { name: 'Classify Genre', progress: 90 },
    { name: 'Complete', progress: 100 }
  ];

  return (
    <Card
      header={
        <div className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan" />
          <h2 className="text-lg font-semibold text-white">Audio Analysis</h2>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{currentStep}</span>
            <span className="text-cyan font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan to-magenta h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                progress >= step.progress 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-gray-700/50'
              }`}
            >
              {progress >= step.progress ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
              )}
              <span className={`text-sm ${
                progress >= step.progress ? 'text-green-400' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Analysis Results Preview */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-carbon/50 rounded-lg p-4 border border-white/10"
          >
            <h3 className="text-sm font-medium text-white/90 mb-3">Analysis Results</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-white/70">BPM:</span>
                <span className="text-cyan ml-2 font-mono">{analysis.bpm}</span>
              </div>
              <div>
                <span className="text-white/70">Key:</span>
                <span className="text-magenta ml-2 font-mono">{analysis.key} {analysis.scale}</span>
              </div>
              <div>
                <span className="text-white/70">Genre:</span>
                <span className="text-accent ml-2">{analysis.genre}</span>
              </div>
              <div>
                <span className="text-white/70">Energy:</span>
                <span className="text-yellow-400 ml-2 font-mono">{(analysis.energy ? (analysis.energy * 100).toFixed(0) : 0)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}