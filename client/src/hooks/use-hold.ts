// Packages
import { useEffect, useRef } from 'react';

// Types
import type React from 'react';

/**
 * What `bind` spreads onto a button.
 */
export type HoldProps = Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onPointerDown' | 'onPointerUp' | 'onPointerLeave' | 'onPointerCancel' | 'onContextMenu'>;

/**
 * Milliseconds a button is held before it counts as a hold.
 */
const HOLD_MS = 400;

/**
 * Pointer handlers for buttons that do one thing on a tap and another when
 * held (like showing details). `bind(key)` goes on each button; `tapped()`
 * tells a click handler whether the press was a plain tap, so a hold
 * doesn't also tap.
 *
 * @param {(key: K) => void} onHold - Called once a button has been held long enough.
 * @returns The binder and the tap check.
 */
export function useHold<K>(onHold: (key: K) => void): {
  bind: (key: K) => HoldProps;
  tapped: () => boolean;
} {
  const hold = useRef<{ timer: number; fired: boolean } | null>(null);
  const onHoldRef = useRef(onHold);
  onHoldRef.current = onHold;

  const release = (): void => {
    if (hold.current) {
      window.clearTimeout(hold.current.timer);
    }
  };

  useEffect(() => release, []);

  return {
    bind: (key: K): HoldProps => ({
      onContextMenu: (e: React.MouseEvent): void => e.preventDefault(),
      onPointerDown: (): void => {
        release();
        const state = { timer: 0, fired: false };
        state.timer = window.setTimeout((): void => {
          state.fired = true;
          onHoldRef.current(key);
        }, HOLD_MS);
        hold.current = state;
      },
      onPointerUp: release,
      onPointerLeave: release,
      onPointerCancel: release,
    }),
    tapped: (): boolean => !hold.current?.fired,
  };
}
