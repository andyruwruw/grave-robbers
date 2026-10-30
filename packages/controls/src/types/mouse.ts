// Types
import type React from 'react';

/**
 * Pointer handlers for the TV's map.
 */
export interface TvMouseHandlers {
  /**
   * A button goes down over the map.
   */
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * The pointer moves over the map.
   */
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * A button comes up.
   */
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * The browser cancels the pointer.
   */
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * The right button would open the context menu.
   */
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * The wheel turns over the map (only where the mode uses it).
   */
  onWheel?: (e: React.WheelEvent<HTMLDivElement>) => void;
}
