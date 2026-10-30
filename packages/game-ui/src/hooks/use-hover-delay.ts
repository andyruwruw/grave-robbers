// Packages
import { useEffect, useRef, useState } from 'react';

/**
 * What `useHoverDelay` hands back.
 */
interface HoverDelay<T> {
  /**
   * What the mouse has rested on long enough, or null.
   */
  hovered: T | null;

  /**
   * Starts (or restarts) the wait for `id`.
   */
  start: (id: T) => void;

  /**
   * Cancels the wait and clears what's hovered.
   */
  cancel: () => void;
}

/**
 * What the mouse has rested on for `ms`, for details that show on hover.
 *
 * @param ms - How long the mouse has to rest.
 * @returns What's hovered, and ways to start and cancel the wait.
 */
export function useHoverDelay<T>(ms: number): HoverDelay<T> {
  const [hovered, setHovered] = useState<T | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  /**
   * Shows `id` once the mouse has rested on it for `ms`.
   *
   * @param id - What the mouse is on.
   */
  const start = (id: T): void => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout((): void => setHovered(id), ms);
  };

  /**
   * Stops waiting and hides what showed.
   */
  const cancel = (): void => {
    clearTimeout(hoverTimer.current);
    setHovered(null);
  };

  return { hovered, start, cancel };
}
