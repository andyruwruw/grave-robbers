// Packages
import { useEffect } from 'react';
import NoSleep from 'nosleep.js';

/**
 * Keeps the phone's screen on while `active`. Browsers only allow it from
 * a tap, so it turns on at the next touch (and again after the page was
 * hidden, which lets go of it). Phones reach the game over plain HTTP on
 * the LAN, where the Wake Lock API doesn't exist, so `nosleep.js` falls
 * back to an invisible looping video.
 *
 * @param {boolean} active - Whether the screen should stay on.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const noSleep = new NoSleep();
    /**
     * Turns NoSleep on from a user gesture, if it isn't already.
     */
    const enable = (): void => {
      if (!noSleep.isEnabled) {
        void noSleep.enable().catch((): void => {});
      }
    };
    window.addEventListener('pointerdown', enable, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', enable, { capture: true });
      noSleep.disable();
    };
  }, [active]);
}
