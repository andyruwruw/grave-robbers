// Local Imports
import { BOULDER, CHASM_FLOOR, COBBLE, DIRT, FLAG, GRASS, HEDGE, PINE, STONE } from '../../../graveyard/config/palette/ground';

// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Tiles tall the camera must see before the voxel world gives way to the
 * flat overview map (and small effects stop drawing).
 */
export const OVERVIEW_TALL = 64;

/**
 * Tiles tall the camera must see before monsters and players are drawn as
 * dots on the overview instead of as figures.
 */
export const DOTS_TALL = 150;

/**
 * Seconds between repaints of the overview while it shows (tiles change,
 * dots move).
 */
export const OVERVIEW_REPAINT = 0.25;

/**
 * How much brighter each terrain level up is drawn.
 */
export const OVERVIEW_LEVEL_LIFT = 0.1;

/**
 * Overview colors are the voxel colors lifted this much, since nothing
 * lights the overview.
 */
export const OVERVIEW_BRIGHTEN = 1.5;

/**
 * A monster's dot.
 */
export const OVERVIEW_MONSTER = '#d8361f';

/**
 * A built structure's color, unless OVERVIEW_COLORS names it.
 */
export const OVERVIEW_BUILT = '#b08850';

/**
 * Each tile's color on the overview map.
 */
export const OVERVIEW_COLORS: Partial<Record<Tile, string>> = {
  'grass': GRASS[3],
  'path': DIRT[1],
  'spawn': DIRT[1],
  'mound': DIRT[2],
  'cobble': COBBLE[0],
  'flagstone': FLAG[0],
  'stairs': FLAG[1],
  'tree': PINE[1],
  'stump': '#4a3524',
  'hedge': HEDGE[1],
  'rock': BOULDER[0],
  'chasm': CHASM_FLOOR,
  'tombstone': STONE[2],
  'cross': STONE[2],
  'statue': STONE[0],
  'crypt': '#5b5e66',
  'mausoleum': '#5b5e66',
  'ruin': '#4d5056',
  'well': '#4d5056',
  'tower': '#43464d',
  'lamp': '#e0b03a',
  'fence': '#3a3a3e',
  'pumpkin': '#e8742a',
  'chest': '#8a5a32',
  'stone-wall': STONE[1],
  'bone-wall': '#e6dcc0',
  'platform': '#6b4a2e',
  'steps': '#6b4a2e',
  'belt': '#4a4f58',
  'sorter': '#5a5560',
  'seeds': DIRT[0],
  'sprout': '#3d6e2a',
};
