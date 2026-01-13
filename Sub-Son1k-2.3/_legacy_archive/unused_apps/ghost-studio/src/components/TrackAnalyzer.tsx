'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Music, 
  Gauge, 
  Piano, 
  Radio,
  Power,
  PowerOff,
  Loader
} from 'lucide-react';
import { useAnalyzer } from '../hooks/useAnalyzer';
import type { AnalysisResult } from '../types/studio';

interface TrackAnalyzerProps {
  audioBlob: Blob | null;
  audioURL: string | null;
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export default function TrackAnalyzer({ 
  audioBlob, 
  audioURL,
  onAnalysisComplete,
  enabled = true,
  onToggle 
}: TrackAnalyzerProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const { isLoading, error, result, runAnalysis, clearAnalysis } = useAnalyzer();

  useEffect(() => {
    if (isEnabled && audioBlob && !result && !isLoading) {
      runAnalysis(audioBlob);
    } else if (!isEnabled && result) {
      clearAnalysis();
    }
  }, [isEnabled, audioBlob]);

  useEffect(() => {
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  }, [result, onAnalysisComplete]);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle?.(newState);
    if (!newState) {
      clearAnalysis();
    }
  };

  const formatKey = (key: string) => {
    if (!key) return 'N/A';
    return key.toUpperCase();
  };

  const formatGenre = (genre: string) => {
    if (!genre || genre === 'unknown') return 'No detectado';
    return genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue to-purple rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-mint">Analizador de Pistas</h3>
            <p className="text-xs text-gray-400">BPM, Escala, Género, Instrumentación</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`btn-ghost px-4 py-2 rounded-lg flex items-center gap-2 ${
            isEnabled ? 'border-mint text-mint' : ''
          }`}
        >
          {isEnabled ? (
            <>
              <Power size={16} />
              Activado
            </>
          ) : (
            <>
              <PowerOff size={16} />
              Desactivado
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-blue animate-spin" />
                  <p className="text-sm text-gray-400">Analizando pista...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {result && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* BPM */}
                <div className="bg-bg-card rounded-lg p-4 border border-teal-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-mint" />
                    <span className="text-xs text-gray-400">BPM</span>
                  </div>
                  <p className="text-2xl font-bold text-mint font-mono">{result.bpm || 120}</p>
                </div>

                {/* Key */}
                <div className="bg-bg-card rounded-lg p-4 border border-teal-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Piano className="w-4 h-4 text-purple" />
                    <span className="text-xs text-gray-400">Escala</span>
                  </div>
                  <p className="text-2xl font-bold text-purple font-mono">
                    {formatKey(result.key || 'C')}
                  </p>
                </div>

                {/* Genre */}
                <div className="bg-bg-card rounded-lg p-4 border border-teal-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-blue" />
                    <span className="text-xs text-gray-400">Género</span>
                  </div>
                  <p className="text-lg font-semibold text-blue">
                    {formatGenre(result.genre || 'unknown')}
                  </p>
                </div>

                {/* Instruments */}
                <div className="bg-bg-card rounded-lg p-4 border border-teal-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4 text-lavender" />
                    <span className="text-xs text-gray-400">Instrumentación</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(result.probableInstruments || result.instruments || []).slice(0, 3).map((instrument, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-teal-dark rounded text-lavender"
                      >
                        {instrument}
                      </span>
                    ))}
                    {((result.probableInstruments || result.instruments || []).length > 3) && (
                      <span className="text-xs px-2 py-1 bg-teal-dark rounded text-gray-400">
                        +{((result.probableInstruments || result.instruments || []).length - 3)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {!audioBlob && !isLoading && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Sube o graba un audio para analizar
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

