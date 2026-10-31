// Packages
import { useEffect, useRef } from 'react';

// Local Imports
import { SCENIC_ABERRATION, SCENIC_FADE_MS } from '../config/tv';

// Types
import type React from 'react';
import type { IncognitoLook } from '@halloween/controls/types/incognito-look';
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * Fades the TV into a more scenic look while Incognito shows the music:
 * chromatic aberration eases up to SCENIC_ABERRATION, and brightness,
 * contrast, ground fog, the fog's shade, and pixelation to the Music tab's Incognito look,
 * over SCENIC_FADE_MS, and back down to the TV's own settings when it
 * hides. Moving a slider while it shows applies at once.
 *
 * @param on - Whether the music screen is showing.
 * @param scenic - The Incognito look.
 * @param base - The TV's display settings.
 * @param all - Runs a function on every pane's renderer.
 * @returns The settings in effect right now, for panes made later.
 */
export function useScenicLook(on: boolean, scenic: IncognitoLook, base: DisplaySettings, all: (f: (renderer: WorldRenderer) => void) => void): React.RefObject<DisplaySettings> {
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
      /**
       * Eases one setting from the TV's own value toward the scenic one.
       *
       * @param from - The TV's value.
       * @param to - The scenic value.
       * @returns The value right now.
       */
      const ease = (from: number, to: number): number => from + (to - from) * k;
      look.current = {
        ...base,
        brightness: ease(base.brightness, scenic.brightness),
        contrast: ease(base.contrast, scenic.contrast),
        aberration: ease(base.aberration, SCENIC_ABERRATION),
        fog: ease(base.fog, scenic.fog),
        fogShade: ease(base.fogShade, scenic.fogShade),
      };
      all((renderer: WorldRenderer): void => {
        renderer.setDisplaySettings(look.current);
        renderer.setPixelBoost(ease(1, scenic.pixelation));
      });
      if (level.current !== target) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, scenic, base]);
  return look;
}
