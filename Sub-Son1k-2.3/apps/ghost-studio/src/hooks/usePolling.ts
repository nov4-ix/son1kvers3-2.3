// apps/ghost-studio/src/hooks/usePolling.ts
import { useEffect, useRef } from 'react';

export function usePolling<T>(fn: () => Promise<T>, onTick: (r: T) => void, deps: any[] = [], intervalMs = 5000, timeoutMs = 300000) {
  const stopRef = useRef<() => void>();
  useEffect(() => {
    let stopped = false;
    const start = Date.now();
    const loop = async () => {
      if (stopped) return;
      const r = await fn();
      onTick(r);
      if (!stopped && Date.now() - start < timeoutMs) setTimeout(loop, intervalMs);
    };
    loop();
    return () => { stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return stopRef.current;
}
