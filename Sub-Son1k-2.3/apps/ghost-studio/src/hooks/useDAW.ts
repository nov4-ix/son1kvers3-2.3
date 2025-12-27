// apps/ghost-studio/src/hooks/useDAW.ts
import * as Tone from 'tone';

export function useDAW() {
  const start = async () => Tone.start();
  return { start };
}
