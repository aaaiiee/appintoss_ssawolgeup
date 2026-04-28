import { useState, useRef, useCallback, useEffect } from 'react';
import { TIMER_MAX_SECONDS } from '@/lib/constants';

type TimerState = 'idle' | 'running' | 'done';

export function useTimer() {
  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    setState('running');
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (elapsed >= TIMER_MAX_SECONDS) {
        setState('done');
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    setState('done');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setElapsedSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, elapsedSeconds, start, stop, reset };
}
