// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';

/**
 * Rough silhouette (width, height, depth) of each structure for the build
 * preview.
 */
export const BUILD_PREVIEW_SHAPES: Record<StructureKind, [number, number, number]> = {
  'wood-wall': [1, 1.1, 0.3],
  'stone-wall': [1, 0.9, 0.9],
  'palisade': [1, 1.35, 0.34],
  'door': [1, 1.1, 0.14],
  'wood-fence': [1, 0.75, 0.12],
  'spikes': [0.84, 0.35, 0.84],
  'iron-spikes': [0.86, 0.45, 0.86],
  'barbed-wire': [1, 0.6, 0.2],
  'ghost-lamp': [0.3, 1.6, 0.3],
  'soul-fire': [0.95, 0.35, 0.95],
  'effigy': [0.7, 1.5, 0.4],
  'obelisk': [0.45, 1.95, 0.45],
  'blood-fountain': [0.85, 1.05, 0.85],
  'soul-cage': [0.7, 1.25, 0.7],
  'mirror': [0.75, 1.45, 0.16],
  'scarecrow': [0.95, 1.6, 0.3],
  'torch': [0.2, 1.05, 0.2],
  'lantern': [0.3, 1.55, 0.3],
  'campfire': [0.9, 0.3, 0.9],
  'platform': [1, 0.75, 1],
  'steps': [1, 0.4, 1],
  'research-table': [0.9, 0.75, 0.6],
  'stash': [0.72, 0.55, 0.5],
  'sawmill': [0.95, 0.7, 0.6],
  'furnace': [0.8, 1.45, 0.75],
  'altar': [0.96, 1.2, 0.86],
  'bloodforge': [0.9, 1.5, 0.84],
  'sifter': [1, 0.7, 0.6],
  'sentry': [0.8, 1.15, 0.8],
  'digger': [0.6, 1.25, 0.6],
  'bone-wall': [1, 1.2, 0.46],
  'coffin': [0.55, 0.32, 0.92],
  'bell': [0.96, 1.45, 0.25],
  'cauldron': [0.8, 0.75, 0.8],
  'anvil': [0.6, 0.7, 0.45],
  'oven': [0.86, 1.3, 0.8],
  'belt': [1, 0.15, 1],
  'seeds': [0.5, 0.1, 0.5],
  'sprout': [0.6, 0.35, 0.6],
  'bolt-turret': [0.7, 0.8, 0.7],
  'swiper': [1, 0.8, 1],
  'flamethrower': [0.7, 0.8, 0.8],
  'ballista': [1, 0.85, 1],
};

/**
 * The build preview: a dim white outline and see-through shape where the
 * structure would go.
 */
export const PLACE_OK = '#ffffff';

/**
 * Light red, for the build preview (and whatever is in the way) when it
 * can't go there.
 */
export const PLACE_BLOCKED = '#ff8a8a';
