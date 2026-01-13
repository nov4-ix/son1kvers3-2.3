// apps/ghost-studio/src/hooks/useAudioUpload.ts
import { useState } from 'react';
import type { AudioFile } from '../types/audio';

export function useAudioUpload() {
  const [file, setFile] = useState<AudioFile | null>(null);
  return { file, setFile };
}
