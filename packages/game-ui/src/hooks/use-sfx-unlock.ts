// Packages
import { useEffect } from 'react';
import { sfx } from '@halloween/ui/audio/sfx/sfx';

/**
 * Unlocks the page's sound on the first press or key, as browsers only let
 * audio start from a gesture.
 */
export function useSfxUnlock(): void {
  useEffect(() => {
    /**
     * Unlocks the sound effects from a user gesture.
     */
    const unlock = (): void => {
      void sfx.unlock();
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);
}
