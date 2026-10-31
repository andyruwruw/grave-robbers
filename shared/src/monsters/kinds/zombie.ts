// Types
import type { GearKind } from '../../gear/types/gear-def';

/**
 * Damage a zombie does to a structure in its way, per bite (one bite per
 * `cooldown`).
 */
export const ZOMBIE_WALL_DAMAGE = 2;

/**
 * Extra damage a zombie's bites do while it carries junk (the chance it
 * does is `armedChance` in `difficulty/horde-scaling.ts`; it drops it
 * when it dies).
 */
export const ZOMBIE_ARMED_DAMAGE = 1;

/**
 * Extra damage a zombie's bites do while it carries a real weapon instead
 * of junk.
 */
export const ZOMBIE_WEAPON_DAMAGE = 2;

/**
 * Craftable weapons an armed zombie may carry instead of junk, each tier
 * from a world level on (the share that do is `craftedShare` in
 * `difficulty/horde-scaling.ts`). It drops it, partly worn, when it dies.
 */
export const ZOMBIE_WEAPON_TIERS: { from: number; weapons: GearKind[] }[] = [
  { from: 8, weapons: ['spear', 'stake', 'quarterstaff'] },
  { from: 12, weapons: ['short-sword', 'battle-axe', 'scythe', 'spiked-gauntlet'] },
  { from: 16, weapons: ['flail', 'warhammer', 'glaive', 'ritual-knife'] },
  { from: 20, weapons: ['greatsword', 'morning-star'] },
];
