// Types
import type { StructureKind } from '../structures/types/structures';

/**
 * Every tile kind on the map, including player-built structures.
 *
 * - Ground: `grass`, `path` (dirt), `cobble`, `flagstone` (chapel floor),
 *   `spawn` (looks like path), `stairs` (stone steps up to the next level),
 *   `mound` (a dug-up grave; a new gravestone rises from it in time).
 * - Landmarks: `crypt`, `mausoleum`, `ruin` (broken chapel wall), `well`,
 *   `statue`, `lamp` (permanent light), `tower` (the watchtower's walls).
 *
 * How high each tile sits is kept apart from its kind: see `WorldMap.level`.
 * - Nature and graves: `tree`, `stump` (rots away), `rock`, `hedge`,
 *   `tombstone`, `cross`, `pumpkin`, and the outer `fence`.
 * - `chest`: turns up now and then, full of loot.
 * - `chasm`: a drop into the dark at the lowest level, bordering and
 *   breaking up huge worlds. Nobody walks in, but a knockback can carry
 *   someone over the edge, and they die.
 */
export type Tile =
  | 'fence' | 'tombstone' | 'cross' | 'tree' | 'stump' | 'rock' | 'pumpkin' | 'chest' | 'crypt'
  | 'grass' | 'path' | 'spawn' | 'cobble' | 'flagstone' | 'stairs' | 'mound'
  | 'mausoleum' | 'ruin' | 'well' | 'statue' | 'lamp' | 'tower' | 'hedge'
  | 'chasm'
  | StructureKind;

/**
 * Tiles players can't walk through. Doors and spikes are open to players;
 * monsters get their own rules.
 */
const SOLID: ReadonlySet<Tile> = new Set<Tile>([
  'fence', 'tombstone', 'cross', 'tree', 'rock', 'pumpkin', 'chest', 'crypt',
  'mausoleum', 'ruin', 'well', 'statue', 'lamp', 'tower', 'hedge', 'chasm',
  'wood-wall', 'stone-wall', 'torch', 'campfire', 'wood-fence', 'lantern', 'scarecrow', 'ghost-lamp', 'soul-fire', 'effigy', 'obelisk', 'soul-cage', 'mirror',
  'palisade', 'research-table', 'sawmill', 'furnace', 'stash',
  'altar', 'bloodforge', 'sifter', 'sentry', 'digger', 'bone-wall', 'coffin', 'bell', 'cauldron',
  'anvil', 'oven', 'bolt-turret', 'swiper', 'flamethrower', 'ballista',
]);

/**
 * Whether a tile kind blocks players.
 *
 * @param tile The tile.
 * @returns True when it's in SOLID.
 */
export function isSolidTile(tile: Tile): boolean {
  return SOLID.has(tile);
}

/**
 * Solid tiles walkers can push through anyway (slowly): trees.
 */
export const PASSABLE: ReadonlySet<Tile> = new Set<Tile>(['tree']);

/**
 * A changed tile, as sent to displays.
 */
export interface TileChange {
  /**
   * Row-major tile index (ty * width + tx).
   */
  i: number;

  /**
   * The new tile.
   */
  tile: Tile;

  /**
   * Its turn (`TileGrid.turnOf`), for a tile that keeps one.
   */
  turn?: number;
}
