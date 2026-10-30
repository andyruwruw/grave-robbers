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
