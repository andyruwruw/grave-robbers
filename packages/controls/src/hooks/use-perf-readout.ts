// Packages
import { useEffect, useRef, useState } from 'react';

// Local Imports
import { PERF_REFRESH_MS } from '../config/stats';

// Types
import type { PerfSample } from '../types/stats';

/**
 * The overlay's numbers, read from `sample` once a second while `active`,
 * so a snapshot never re-renders it.
 *
 * @param {() => PerfSample} sample - Reads the latest stats and frame rate.
 * @param {boolean} active - Whether anything is shown (it stops refreshing otherwise).
 * @returns {PerfSample | null} The numbers, or null before the first read.
 */
export function usePerfReadout(sample: () => PerfSample, active: boolean): PerfSample | null {
  const [reading, setReading] = useState<PerfSample | null>(null);
  const sampleRef = useRef(sample);
  sampleRef.current = sample;

  useEffect(() => {
    if (!active) {
      return;
    }
    /**
     * Takes a fresh reading.
     */
    const refresh = (): void => setReading(sampleRef.current());
    refresh();
    const timer = setInterval(refresh, PERF_REFRESH_MS);
    return () => clearInterval(timer);
  }, [active]);

  return reading;
}
