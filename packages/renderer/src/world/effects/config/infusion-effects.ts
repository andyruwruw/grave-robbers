// Types
import type { Essence } from '@halloween/shared/gear/types/infusion';

/**
 * Sparks thrown where chain lightning lands.
 */
export const CHAIN_SPARK = '#fff2a8';

/**
 * Height above the ground chain lightning jumps at.
 */
export const CHAIN_HEIGHT = 0.5;

/**
 * A death blast's fireball sparks, ring, and smoke.
 */
export const BLAST_COLORS = { spark: '#ffb347', ring: '#ff6a1a', smoke: '#3a2a24', ember: '#ff4a1a' };

/**
 * A Wailing Sickle's shockwave: a pale ghostly ring and its sparks.
 */
export const WAIL_COLORS = { ring: '#9affc8', spark: '#d8fff0' };

/**
 * A ground slam's dusty ring.
 */
export const SLAM_RING = '#8a7a62';

/**
 * An Archangel's Fists nova: a golden ring and its sparks.
 */
export const NOVA_COLORS = { ring: '#ffe9a0', spark: '#fff6d0' };

/**
 * A Mirror Shield's reflect: a cold silver glint.
 */
export const REFLECT_SPARK = '#e8f4ff';

/**
 * The gold that sparkles off the anvil as a weapon is infused.
 */
export const INFUSE_GOLD = '#f5d76e';

/**
 * Each essence's sparkle at the anvil and its flash of light.
 */
export const ESSENCE_GLOW: Record<Essence, string> = {
  ecto: '#7dffb0',
  holy: '#ffe9a0',
  brimstone: '#ff6a1a',
  hex: '#b04aff',
  fang: '#e8e0c8',
  tendons: '#d0604a',
  silver: '#dfe6ee',
};

/**
 * Fire chips in each pulse of a Hellmouth's spray.
 */
export const SPRAY_CHIPS = 12;

/**
 * Height above the ground a shockwave ring spreads at.
 */
export const RING_LIFT = 0.08;

/**
 * Seconds a short burst of light lasts (blasts, novas, infusing).
 */
export const FLASH_LIFE = 0.35;

/**
 * Light a death blast gives off, as a share of its radius, and how bright.
 */
export const BLAST_FLASH = { reach: 1.8, intensity: 1.4 };

/**
 * Light a nova gives off, as a share of its radius, and how bright.
 */
export const NOVA_FLASH = { reach: 1.3, intensity: 1.2 };

/**
 * Light the anvil gives off as a weapon is infused.
 */
export const INFUSE_FLASH = { radius: 2.6, intensity: 1.3, life: 0.9 };

/**
 * Screen shake (as a share of a full shake) for a slam, and for the
 * heavier fissures, blasts, and novas.
 */
export const INFUSION_SHAKE = { slam: 0.5, heavy: 1 };

/**
 * The dust a Flesh-Sprung Maul kicks up along its swing: puffs spread
 * across the arc (half-width in radians), how far out (a share of its
 * reach), and chips per puff.
 */
export const MAUL_DUST = { puffs: 5, halfArc: 1.75, reach: 0.75, chips: 6 };
