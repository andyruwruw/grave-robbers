// Packages
import React, { useEffect, useRef } from 'react';

// Local Imports
import { PAN_KEYS } from '../config/camera';

/**
 * Pans the admin's view while W, A, S, or D is held (not while typing in a
 * field, or while `enabled` is off): every frame it calls `panRef` with the
 * direction held (diagonals normalized), the seconds since the last frame,
 * and whether Shift is down.
 *
 * @param enabled - Whether keys pan right now (off while the map editor is open).
 * @param panRef - What a frame's pan does, with the latest values.
 */
export function useAdminPan(enabled: boolean, panRef: React.RefObject<(dx: number, dy: number, dt: number, fast: boolean) => void>): void {
  const held = useRef(new Set<string>());
  const fast = useRef(false);

  useEffect(() => {
    if (!enabled) {
      held.current.clear();
      return;
    }
    /**
     * Whether a key event comes from somewhere text is typed.
     * @param e The event.
     * @returns True inside a field.
     */
    const typing = (e: KeyboardEvent): boolean => e.target instanceof HTMLElement && !!e.target.closest('input, textarea, select, [contenteditable="true"]');
    /**
     * Starts panning one way.
     * @param e The key event.
     */
    const down = (e: KeyboardEvent): void => {
      fast.current = e.shiftKey;
      const key = e.key.toLowerCase();
      if (!PAN_KEYS[key] || e.ctrlKey || e.metaKey || e.altKey || typing(e)) {
        return;
      }
      held.current.add(key);
      e.preventDefault();
    };
    /**
     * Stops panning one way.
     * @param e The key event.
     */
    const up = (e: KeyboardEvent): void => {
      fast.current = e.shiftKey;
      held.current.delete(e.key.toLowerCase());
    };
    /**
     * Stops panning when the window loses focus (no key-up comes).
     */
    const blur = (): void => held.current.clear();
    let last = performance.now();
    let frame = 0;
    /**
     * One frame: pans the way the held keys point.
     * @param now The frame's time.
     */
    const tick = (now: number): void => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let dx = 0;
      let dy = 0;
      for (const key of held.current) {
        dx += PAN_KEYS[key][0];
        dy += PAN_KEYS[key][1];
      }
      const length = Math.hypot(dx, dy);
      if (length > 0) {
        panRef.current(dx / length, dy / length, dt, fast.current);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [enabled, panRef]);
}
