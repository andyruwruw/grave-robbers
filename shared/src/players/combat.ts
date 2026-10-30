/**
 * Seconds from pressing Action to the swing landing, matching the moment
 * the axe comes down on the TV.
 */
export const STRIKE_DELAY = 0.22;

/**
 * Height in combat. A swing (or a monster's bite) reaches down as far as
 * MELEE_REACH_DOWN but up only MELEE_REACH_UP, so whoever stands a level
 * higher can hit without being hit back. It also does HIGH_GROUND_BONUS more
 * damage to a target at least HIGH_GROUND lower. Crossbow bolts fly
 * BOLT_RANGE_PER_LEVEL tiles further for each level the shooter stands
 * above the ground. Being knocked off a drop of at least FALL_MIN hurts
 * FALL_DAMAGE per level fallen.
 */
export const MELEE_REACH_DOWN = 1.8;

/**
 * How far up (world units) a swing or bite reaches.
 */
export const MELEE_REACH_UP = 0.6;

/**
 * Least height (world units) above a target that counts as high ground.
 */
export const HIGH_GROUND = 0.5;

/**
 * Damage a hit from high ground adds.
 */
export const HIGH_GROUND_BONUS = 1;

/**
 * Tiles further bolts fly per level the shooter stands above the ground.
 */
export const BOLT_RANGE_PER_LEVEL = 2;

/**
 * Distance (tiles) a hit shoves its target, and over how long.
 */
export const KNOCKBACK_DISTANCE = 1;

/**
 * Seconds a knockback shove takes.
 */
export const KNOCKBACK_TIME = 0.2;

/**
 * Share of its damage a player's hit or shot does to another player.
 */
export const PVP_DAMAGE = 0.25;
