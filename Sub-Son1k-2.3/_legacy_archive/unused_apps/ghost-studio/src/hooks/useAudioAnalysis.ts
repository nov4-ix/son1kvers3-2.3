// apps/ghost-studio/src/hooks/useAudioAnalysis.ts
import { useState } from 'react';
import type { AudioAnalysis } from '../types/audio';

export function useAudioAnalysis() {
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  return { analysis, setAnalysis };
}
