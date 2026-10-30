// Packages
import React, { useRef, useState } from 'react';
import { readStorage, writeStorage } from '@halloween/ui/helpers/storage';

// Local Imports
import {
  SIDEBAR_KEY,
  SIDEBAR_MAX_SHARE,
  SIDEBAR_MIN,
  SIDEBAR_WIDTH,
} from '../config/tree';

/**
 * What `useSidebarWidth` hands back.
 */
interface SidebarWidth {
  /**
   * The width to draw the sidebar at, kept inside its limits.
   */
  width: number;

  /**
   * Starts a resize drag.
   */
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * Follows a resize drag.
   */
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * Ends a resize drag and remembers the width.
   */
  onPointerUp: () => void;
}

/**
 * The tree's details sidebar width: remembered across reloads and resized
 * by dragging its edge, between `SIDEBAR_MIN` and a share of the screen.
 *
 * @returns The width to draw and the edge's drag handlers.
 */
export function useSidebarWidth(): SidebarWidth {
  const [width, setWidth] = useState((): number => Number(readStorage(SIDEBAR_KEY)) || SIDEBAR_WIDTH);
  const drag = useRef<{ x: number; width: number } | null>(null);

  /**
   * Keeps a width inside the sidebar's limits.
   *
   * @param w - The width wanted.
   * @returns The width allowed, rounded.
   */
  const clamp = (w: number): number => Math.round(Math.max(SIDEBAR_MIN, Math.min(window.innerWidth * SIDEBAR_MAX_SHARE, w)));

  /**
   * Captures the pointer and notes where the drag started.
   *
   * @param e - The press.
   */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, width };
  };

  /**
   * Widens or narrows the sidebar with the drag.
   *
   * @param e - The move.
   */
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (drag.current) {
      setWidth(clamp(drag.current.width + drag.current.x - e.clientX));
    }
  };

  /**
   * Ends the drag and saves the width.
   */
  const onPointerUp = (): void => {
    drag.current = null;
    writeStorage(SIDEBAR_KEY, String(width));
  };

  return { width: clamp(width), onPointerDown, onPointerMove, onPointerUp };
}
