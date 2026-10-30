// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Tiles tall enough to hide a player. Gravestones, fences, rocks, and
 * lights are low enough to see over.
 */
export const OPAQUE: ReadonlySet<Tile> = new Set<Tile>([
  'crypt', 'mausoleum', 'ruin', 'statue', 'hedge', 'tower', 'wood-wall', 'stone-wall', 'palisade', 'door', 'bone-wall',
]);

/**
 * Structures that throw stone chips when chewed.
 */
export const STONY: ReadonlySet<Tile> = new Set<Tile>(['stone-wall', 'furnace', 'altar', 'bloodforge', 'bone-wall', 'cauldron']);

/**
 * Path cost of walking over spikes, so zombies prefer to go around.
 */
export const SPIKE_COST = 4;
