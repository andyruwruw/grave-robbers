// Local Imports
import { stock } from '../../../goods/goods';

// Types
import type { Bundle, Material } from '../../../goods/goods';
import type { Essence } from '../../types/infusion';

/**
 * Every essence, in the order the Armory lists paths.
 */
export const ESSENCES: Essence[] = ['holy', 'tendons', 'fang', 'ecto', 'hex', 'brimstone', 'silver'];

/**
 * The bag material each essence is spent as (silver is both the essence
 * and the silver every infusion costs).
 */
export const ESSENCE_MATERIAL: Record<Essence, Material> = {
  holy: 'holy-water',
  tendons: 'brute-tendon',
  fang: 'ghoul-fang',
  ecto: 'ectoplasm',
  hex: 'hex-shard',
  brimstone: 'brimstone',
  silver: 'silver',
};

/**
 * The prefix shown under an infused weapon's name.
 */
export const ESSENCE_PREFIX: Record<Essence, string> = {
  holy: 'Blessed',
  tendons: 'Hulking',
  fang: 'Feral',
  ecto: 'Ephemeral',
  hex: 'Hexed',
  brimstone: 'Enflamed',
  silver: 'Silvered',
};

/**
 * What an infusion costs at each level (index 0 is level 1), before the
 * anvil's discount, unless its variant lists its own `cost`. Silver alone
 * infuses only the shield, at one level.
 */
export const ESSENCE_COSTS: Record<Essence, Bundle[]> = {
  holy: [stock({ silver: 4, 'holy-water': 9 }), stock({ silver: 8, 'holy-water': 18 })],
  tendons: [stock({ silver: 4, 'brute-tendon': 4 }), stock({ silver: 8, 'brute-tendon': 9 })],
  fang: [stock({ silver: 4, 'ghoul-fang': 4 }), stock({ silver: 8, 'ghoul-fang': 9 })],
  ecto: [stock({ silver: 4, ectoplasm: 6 }), stock({ silver: 8, ectoplasm: 12 })],
  hex: [stock({ silver: 4, 'hex-shard': 4 }), stock({ silver: 8, 'hex-shard': 9 })],
  brimstone: [stock({ silver: 4, brimstone: 3 }), stock({ silver: 8, brimstone: 6 })],
  silver: [stock({ silver: 8 })],
};

/**
 * Most a weapon's `holy`, `blessed`, and `blessing` multiply damage to one
 * monster by, all together, once it's Blessed.
 */
export const BLESSED_CAP = 4;

/**
 * Most a hex curse's chance per hit can be, however slow the weapon.
 */
export const CURSE_CHANCE_CAP = 0.9;
