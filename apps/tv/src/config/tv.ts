// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { Pane } from '../types/panes';

/**
 * Most panes the TV splits a huge world into.
 */
export const MAX_PANES = 4;

/**
 * The single pane of a classic map, or of the map editor.
 */
export const WHOLE_MAP: Pane[] = [{ key: 'map', id: null, name: '' }];

/**
 * The pane watching the spawn while nobody on a huge world is local.
 */
export const SPAWN_PANE: Pane[] = [{ key: 'spawn', id: '', name: '' }];

/**
 * TV keys that flip a Game tab switch.
 */
export const GAME_KEYS: Record<string, keyof Pick<GameSettings, 'allUnlocks' | 'freeCrafting' | 'aggressive' | 'testPlayer' | 'lightsOff' | 'daytime'>> = {
  u: 'allUnlocks',
  f: 'freeCrafting',
  a: 'aggressive',
  t: 'testPlayer',
  l: 'lightsOff',
  d: 'daytime',
};

/**
 * Chromatic aberration (0 to 1) while Incognito shows the music, for a
 * more scenic graveyard behind it (`useScenicLook`).
 */
export const SCENIC_ABERRATION = 0.9;

/**
 * Ground fog thickness while Incognito shows the music: past the 0 to 1
 * the Fog setting allows, for a heavy mist.
 */
export const SCENIC_FOG = 1.7;

/**
 * How much coarser the pixels get while Incognito shows the music (the
 * zoom's own pixel size times this).
 */
export const SCENIC_PIXELATION = 1.8;

/**
 * Milliseconds the scenic look takes to fade in or out (the Incognito
 * screen's own fade).
 */
export const SCENIC_FADE_MS = 1500;
