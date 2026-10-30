/**
 * Seconds a bleeding wound keeps hurting (see `WeaponStats.bleed`).
 */
export const BLEED_SECONDS = 2;

/**
 * Seconds between swings that keep a combo going, and what a charged
 * gauntlet's super uppercut does: damage and knockback times, and how long
 * it stuns (even what a stun can't usually hold, but never a brute).
 */
export const COMBO_WINDOW = 1.2;

/**
 * The combo step that marks a charged gauntlet's super uppercut.
 */
export const SUPER_COMBO = 3;

/**
 * How many times as hard the super uppercut hits.
 */
export const SUPER_DAMAGE = 4;

/**
 * How many times as far the super uppercut throws.
 */
export const SUPER_KNOCKBACK = 2.5;

/**
 * Seconds a stunned monster stays dazed.
 */
export const STUN_SECONDS = 1;

/**
 * Fraction of their speed someone winding up a heavy blow moves at.
 */
export const HEAVY_SWING_SLOW = 0.35;

/**
 * Seconds after a heavy blow lands that the swinger stays slowed.
 */
export const HEAVY_FOLLOW_THROUGH = 0.35;

/**
 * Fraction of a weapon's reach past which its `tip` bonus applies.
 */
export const TIP_FROM = 0.6;
