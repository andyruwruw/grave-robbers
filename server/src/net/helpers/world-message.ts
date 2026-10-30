// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { Game } from '../../game/game';
import type { MapPreset } from '../../game/storage/types/save';

/**
 * The whole map, for a display that just connected or after the map
 * changed.
 * @param game The game.
 * @returns The `world` message.
 */
export function worldMessage(game: Game): DisplayMessage {
  return { t: 'world', seed: game.world.seed, width: game.world.map.width, tiles: game.world.map.encode(), levels: game.world.map.encodeLevels(), ramps: game.world.map.encodeRamps(), blends: game.world.editor.blendAreas(), view: game.world.view };
}

/**
 * The current map as a preset to save.
 * @param game The game.
 * @param name The preset's name.
 * @returns The preset.
 */
export function presetOf(game: Game, name: string): MapPreset {
  const map = game.world.map;
  return { name, seed: game.world.seed, width: map.width, tiles: map.encode(), levels: map.encodeLevels(), ramps: map.encodeRamps(), blends: game.world.editor.blendAreas(), view: game.world.view };
}
