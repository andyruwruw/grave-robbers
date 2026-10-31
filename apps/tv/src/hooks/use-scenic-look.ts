// Packages
import { useEffect, useRef } from 'react';

// Local Imports
import { SCENIC_ABERRATION, SCENIC_FADE_MS, SCENIC_FOG } from '../config/tv';

// Types
import type React from 'react';
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * Fades the TV into a more scenic look while Incognito shows the music:
 * chromatic aberration and ground fog ease up to SCENIC_ABERRATION and
 * SCENIC_FOG over SCENIC_FADE_MS, and back down to the TV's own settings
 * when it hides.
 *
 * @param on - Whether the music screen is showing.
 * @param base - The TV's display settings.
 * @param all - Runs a function on every pane's renderer.
 * @returns The settings in effect right now, for panes made later.
 */
export function useScenicLook(on: boolean, base: DisplaySettings, all: (f: (renderer: WorldRenderer) => void) => void): React.RefObject<DisplaySettings> {
  const level = useRef(0);
  const look = useRef<DisplaySettings>(base);
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    /**
     * Moves the look one frame toward its target and applies it.
     *
     * @param now - The frame's time in ms.
     */
    const step = (now: number): void => {
      const target = on ? 1 : 0;
      const move = (now - last) / SCENIC_FADE_MS;
      last = now;
      level.current = target > level.current ? Math.min(target, level.current + move) : Math.max(target, level.current - move);
      const k = level.current * level.current * (3 - 2 * level.current);
      look.current = { ...base, aberration: base.aberration + (SCENIC_ABERRATION - base.aberration) * k, fog: base.fog + (SCENIC_FOG - base.fog) * k };
      all((renderer: WorldRenderer): void => renderer.setDisplaySettings(look.current));
      if (level.current !== target) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, base]);
  return look;
}
