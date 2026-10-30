// Packages
import React, { useEffect, useRef, useState } from 'react';

// Local Imports
import { rebind } from '../helpers/play-settings';
import { KeyboardMouse } from '../input/keyboard-mouse';
import { PlayInputLoop } from '../input/play-input-loop';

// Types
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { SpatialNav } from '../nav/spatial-nav';
import type { Predictor } from '../prediction/predictor';
import type { LiveState } from '../types/play';

/**
 * The page's parts the input reads.
 */
export interface PlayInputParts {
  /**
   * The pad being played (the rumble reads it).
   */
  padIndex: React.RefObject<number | null>;

  /**
   * The menu selection.
   */
  nav: SpatialNav;

  /**
   * The world renderer.
   */
  rendererRef: React.RefObject<WorldRenderer | null>;

  /**
   * The local prediction of this player.
   */
  predictor: Predictor;

  /**
   * The players as last sent.
   */
  cache: WorldCache;

  /**
   * The open menu's element.
   */
  menuRef: React.RefObject<HTMLDivElement | null>;

  /**
   * The join screen's element.
   */
  joinRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * What `usePlayInput` gives the page.
 */
export interface PlayInput {
  /**
   * The device used last, for the hints.
   */
  device: 'pad' | 'keys';

  /**
   * The pad being played, if any.
   */
  padName: string | null;
}

/**
 * The /play input: keyboard and mouse listeners (`KeyboardMouse`, which
 * also take a key for a waiting binding) and a loop every frame
 * (`PlayInputLoop`), both reading the page's latest `state`.
 *
 * @param state - The page's state this render.
 * @param parts - The page's parts the input reads.
 * @returns The device used last and the pad's name.
 */
export function usePlayInput(state: LiveState, parts: PlayInputParts): PlayInput {
  const [padName, setPadName] = useState<string | null>(null);
  const [device, setDevice] = useState<'pad' | 'keys'>('keys');
  const live = useRef(state);
  live.current = state;
  const keyboard = useRef(new KeyboardMouse());

  useEffect(() => {
    const k = keyboard.current;
    k.attach({
      bindKey: (code: string): boolean => {
        const s = live.current;
        if (s.capturing?.device !== 'keys') {
          return false;
        }
        if (code !== 'Escape') {
          s.changeSettings({ ...s.settings, keys: rebind(s.settings.keys, s.capturing.action, code) });
        }
        s.setCapturing(null);
        return true;
      },
      onDevice: (): void => setDevice('keys'),
      isJoined: (): boolean => live.current.joined,
      boundKeys: (): string[] => Object.values(live.current.settings.keys),
    });
    return () => k.detach();
  }, []);

  useEffect(() => {
    const loop = new PlayInputLoop({ live, keyboard: keyboard.current, setDevice, setPadName, ...parts });
    loop.start();
    return () => loop.stop();
  }, []);

  return { device, padName };
}
