// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Point, Rect } from '../types/geometry';

/**
 * The crypt's walls, at the middle of the map.
 */
export const CRYPT: Rect = { x: 24, y: 14, w: 8, h: 6 };

/**
 * The map center (the middle of the crypt).
 */
export const CENTER_X = CRYPT.x + CRYPT.w / 2;

/**
 * The map center's row.
 */
export const CENTER_Y = CRYPT.y + CRYPT.h / 2;

/**
 * Within this distance of the center, main paths are cobbled.
 */
export const COBBLE_RADIUS = 9;

/**
 * Tiles a landmark, plot, or tree may overwrite: open ground only.
 */
export const OPEN: ReadonlySet<Tile> = new Set<Tile>(['grass']);

/**
 * The four straight steps.
 */
export const DIRS: Point[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Pumpkins on a fresh map; the world grows new ones back to this many.
 */
export const PUMPKIN_COUNT = 10;

/**
 * Clumps of trees dotted over the open ground away from the forest edge
 * (centered at least GROVE_INSET tiles in from the fence).
 */
export const GROVES = 16;

/**
 * How far in from the fence a grove's center must be (lone trees also
 * thicken past this distance).
 */
export const GROVE_INSET = 6;

/**
 * Raised terraces (some with a higher core) and sunken hollows over the
 * open ground: their radius range in tiles (how many, how big, and how
 * often a terrace gets a core come from the map settings).
 */
export const TERRACE_RADIUS = [5, 8];

/**
 * A terrace core's radius as a share of its terrace's.
 */
export const TERRACE_CORE_SCALE = 0.55;

/**
 * A sunken hollow's radius range in tiles.
 */
export const HOLLOW_RADIUS = [3.5, 5];

/**
 * With the extra stairs knob at full, the chance each spot where stairs
 * would fit gets them.
 */
export const EXTRA_STAIRS_CHANCE = 0.12;

/**
 * Every raised or sunken tile sits inside a block this wide of tiles at
 * least as high (or low), so level changes are broad shelves, never thin
 * fingers or single-tile bumps.
 */
export const SHELF = 3;

/**
 * The watchtower on the hill: footprint (walls included) and how many
 * floors its spiral stair climbs above the hill top.
 */
export const TOWER_SIZE = 5;

/**
 * Widths (and heights) the round courtyards come in: the chapel and the
 * well plaza each try them in a random order and take the first that fits.
 */
export const COURTYARD_SIZES = [7, 9, 11];

/**
 * Ground stairs may be put on.
 */
export const RAMP_GROUND: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'cobble']);

/**
 * What may be cleared off the foot of stairs to make room.
 */
export const SCENERY: ReadonlySet<Tile> = new Set<Tile>(['tree', 'rock', 'tombstone', 'cross', 'pumpkin', 'hedge', 'lamp']);
