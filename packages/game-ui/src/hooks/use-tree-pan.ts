// Packages
import React, { useEffect, useRef } from 'react';

// Local Imports
import {
  DRAG_SLOP,
  PAN_KEYS,
  PAN_STEP,
} from '../config/tree';

/**
 * What `useTreePan` hands back: the scroll area's ref and handlers.
 */
export interface TreePan {
  /**
   * The scroll area.
   */
  scrollRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Starts a mouse drag that pans the tree.
   */
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;

  /**
   * Swallows the click that ends a drag.
   */
  onClickCapture: (e: React.MouseEvent) => void;

  /**
   * Scrolls sideways with the wheel when the tree has no height to scroll.
   */
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
}

/**
 * Panning the tree with the mouse and keyboard (`enabled`, /play): WASD,
 * dragging, and the scroll wheel.
 *
 * @param enabled - Whether panning is on (`hoverDetails`).
 * @returns The scroll area's ref and handlers.
 */
export function useTreePan(enabled: boolean): TreePan {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    /**
     * Scrolls the tree a step for a pan key.
     * @param e The key event.
     */
    const pan = (e: KeyboardEvent): void => {
      const step = PAN_KEYS[e.code];
      if (step && !(e.target instanceof HTMLInputElement)) {
        scrollRef.current?.scrollBy({ left: step[0] * PAN_STEP, top: step[1] * PAN_STEP, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', pan);
    return () => window.removeEventListener('keydown', pan);
  }, [enabled]);

  /**
   * Starts a left-button mouse drag that scrolls the area once it passes
   * `DRAG_SLOP`.
   *
   * @param e - The press.
   */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!enabled || e.pointerType !== 'mouse' || e.button !== 0) {
      return;
    }
    const el = e.currentTarget;
    const start = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    dragged.current = false;
    /**
     * Scrolls with the drag once it passes the slop distance.
     * @param m The pointer move event.
     */
    const move = (m: PointerEvent): void => {
      const dx = m.clientX - start.x;
      const dy = m.clientY - start.y;
      if (Math.hypot(dx, dy) > DRAG_SLOP) {
        dragged.current = true;
      }
      if (dragged.current) {
        el.scrollLeft = start.left - dx;
        el.scrollTop = start.top - dy;
      }
    };
    /**
     * Ends the drag and drops its window listeners.
     */
    const up = (): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /**
   * Stops the click that ends a drag from reaching a node.
   *
   * @param e - The click.
   */
  const onClickCapture = (e: React.MouseEvent): void => {
    if (dragged.current) {
      e.stopPropagation();
      dragged.current = false;
    }
  };

  /**
   * Turns the wheel into sideways scrolling when there's nothing to
   * scroll up and down.
   *
   * @param e - The wheel turn.
   */
  const onWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    const el = e.currentTarget;
    if (enabled && !e.shiftKey && el.scrollHeight <= el.clientHeight) {
      el.scrollLeft += e.deltaY;
    }
  };

  return { scrollRef, onPointerDown, onClickCapture, onWheel };
}
