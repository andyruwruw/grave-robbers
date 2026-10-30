// Packages
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { GRASS } from './palette/ground';

// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Tiles a palisade or fence lines up with.
 */
export const WALLS: ReadonlySet<Tile> = new Set<Tile>(['wood-fence', 'wood-wall', 'stone-wall', 'palisade', 'door', 'bone-wall']);

/**
 * Grass by terrain level, lighter the higher it is, so shelves read at a
 * glance.
 */
export const GRASS_BY_LEVEL: Record<number, string[]> = {
  [-1]: ['#111a12', '#131e14', '#0f1810', '#162117', '#121c12'],
  0: GRASS,
  1: ['#2e4226', '#34492b', '#2a3d22', '#3a4f2e', '#304526'],
  2: ['#445c35', '#4b643a', '#3f5631', '#526b3f', '#475f37'],
  3: ['#445c35', '#4b643a', '#3f5631', '#526b3f', '#475f37'],
};

/**
 * Courses in a retaining wall: about this tall each.
 */
export const WALL_COURSE = 0.28;

/**
 * The watchtower's walls rise this far above the hill (to a parapet over
 * the top floor).
 */
export const TOWER_WALL = LEVEL_HEIGHT * 2 + 1.2;

/**
 * The part of the watchtower painted with the rest of the world stops at
 * this height; everything above is the cutaway model (see `buildTower`).
 */
export const TOWER_COURSE = 0.35;

/**
 * How far below TOWER_WALL a ruined wall column may crumble (more on the
 * side facing the camera).
 */
export const TOWER_CRUMBLE = 1.4;

/**
 * How tall the watchtower's broken pillar stands above its floor.
 */
export const TOWER_PILLAR = LEVEL_HEIGHT * 2 + 0.8;

/**
 * Ground tiles; anything else stands on a floor guessed from its neighbors.
 */
export const GROUND: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'spawn', 'cobble', 'flagstone', 'stairs', 'mound']);

/**
 * The floors a non-ground tile can stand on (see `floorUnder`).
 */
export const FLOORS: Tile[] = ['grass', 'path', 'cobble', 'flagstone'];

/**
 * The four sides of a tile, as (dx, dy) steps.
 */
export const SIDES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * How far down a chasm's floor is (world units): deep enough that the
 * stone walls of the ground around it read as a cliff into the dark.
 */
export const CHASM_DEPTH = -9;
