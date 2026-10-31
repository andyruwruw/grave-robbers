// Packages
import { Color } from 'three';

// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Simulation grid resolution (cells per tile).
 */
export const CELLS_PER_TILE = 3;

/**
 * The biggest map (in tiles) whose fog is simulated; bigger maps get the
 * drifting procedural fog everywhere, as beyond the fence.
 */
export const SIM_MAX_TILES = 80 * 60;

/**
 * Seconds for disturbed fog to settle back into its resting shape, and
 * how strongly neighboring cells blend each step.
 */
export const SETTLE_TIME = 4;

/**
 * How strongly neighboring cells blend each step (see SETTLE_TIME).
 */
export const DIFFUSION = 0.15;

/**
 * Tiles tall enough that fog can't sit in or flow through them; it pools
 * and wraps around them instead. Low things (gravestones, fences, rocks)
 * let it drift over.
 */
export const BLOCKS_FOG: ReadonlySet<Tile> = new Set<Tile>([
  'tree', 'crypt', 'mausoleum', 'ruin', 'statue', 'hedge', 'well', 'tower',
  'wood-wall', 'stone-wall', 'palisade', 'door', 'scarecrow', 'furnace',
  'bloodforge', 'bone-wall',
]);

/**
 * Heights of the fog layers above the ground, and how far each reaches
 * beyond the map so the outskirts are misty too.
 */
export const LAYER_HEIGHTS = [0.12, 0.42, 0.78];

/**
 * How far each fog layer reaches, centered on the view (see LAYER_HEIGHTS).
 */
export const LAYER_SIZE = 220;

/**
 * Peak opacity of one layer, and how many dithered steps its opacity is
 * cut into for the pixel look.
 */
export const LAYER_OPACITY = 0.14;

/**
 * How many dithered steps a layer's opacity is cut into (see LAYER_OPACITY).
 */
export const DITHER_STEPS = 5;

/**
 * Density values are stored divided by this, so thickened fog (ghost
 * trails) has headroom above the resting level.
 */
export const DENSITY_RANGE = 1.6;

/**
 * The fog's color, before the light map lights it.
 */
export const FOG_COLOR = new Color('#4a5470');
