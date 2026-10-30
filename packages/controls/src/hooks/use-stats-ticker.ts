// Packages
import React, { useEffect, useRef, useState } from 'react';

// Local Imports
import { EMPTY_STATS } from '../config/stats';

// Types
import type { StatsSnapshot } from '../types/stats';

/**
 * What `useStatsTicker` gives the page.
 */
export interface StatsTicker {
  /**
   * The stats shown, refreshed once a second.
   */
  stats: StatsSnapshot;

  /**
   * The latest snapshot's stats, written from the socket without a render.
   */
  latestStats: React.RefObject<StatsSnapshot>;
}

/**
 * The Overview tab's stats: once a second, while `active`, the latest
 * snapshot's stats with this page's frame rate and ping on top.
 *
 * @param {() => Pick<StatsSnapshot, 'fps' | 'ping'>} sample - Reads this page's frame rate and ping.
 * @param {boolean} active - Whether to refresh (the TV only while its Overview shows).
 * @param {boolean} immediate - Whether to refresh as soon as it turns on, not only after a second.
 * @returns {StatsTicker} The stats, and the ref the socket writes.
 */
export function useStatsTicker(sample: () => Pick<StatsSnapshot, 'fps' | 'ping'>, active = true, immediate = false): StatsTicker {
  const [stats, setStats] = useState<StatsSnapshot>(EMPTY_STATS);
  const latestStats = useRef(stats);

  useEffect(() => {
    if (!active) {
      return;
    }
    /**
     * Merges a fresh fps and ping sample into the latest stats and shows them.
     */
    const refresh = (): void => setStats({ ...latestStats.current, ...sample() });
    if (immediate) {
      refresh();
    }
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [active]);

  return { stats, latestStats };
}
