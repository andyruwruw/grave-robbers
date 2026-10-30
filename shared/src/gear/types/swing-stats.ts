// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * How a weapon swings: damage, seconds between swings, reach (tiles; range
 * for ranged weapons), the arc it covers (cos of the half-angle: 0 is the
 * whole front half-circle, closer to 1 is narrower), knockback distance,
 * units gathered and structure damage multiplier per hit, and the monster
 * it kills in one hit, if any. `hpCost` is health a swing takes from
 * whoever swings it (never their last), and `feast` is health a kill gives
 * back, slowly (see FEAST_HEAL_PER_SECOND). `holy` multiplies its damage to
 * vampires; blood weapons (blood ammo or a health cost) barely hurt them
 * (VAMPIRE_BLOOD_RESIST).
 */
export interface SwingStats {
  /**
   * Damage per hit (or shot).
   */
  damage: number;

  /**
   * Seconds between swings.
   */
  cooldown: number;

  /**
   * Reach in tiles (range for ranged weapons).
   */
  reach: number;

  /**
   * The arc it covers: the cos of the half-angle (0 is the whole front
   * half-circle, closer to 1 is narrower).
   */
  arcCos: number;

  /**
   * Tiles its hits throw a monster.
   */
  knockback: number;

  /**
   * Units gathered and structure damage multiplier per hit.
   */
  chop?: number;

  /**
   * The monster it kills in one hit, if any.
   */
  slays?: MonsterKind;

  /**
   * Health a swing takes from whoever swings it (never their last).
   */
  hpCost?: number;

  /**
   * Health a kill gives back, slowly (see FEAST_HEAL_PER_SECOND).
   */
  feast?: number;

  /**
   * Multiplies its damage to vampires.
   */
  holy?: number;

  /**
   * Needs both hands (no shield alongside it).
   */
  hands?: 2;

  /**
   * Seconds from pressing Action to the blow landing, for slow, heavy
   * weapons (STRIKE_DELAY otherwise); the wielder moves at HEAVY_SWING_SLOW
   * meanwhile.
   */
  windup?: number;

  /**
   * Blessed (the morning star): vampires and witches take this many times
   * the damage, and ghosts take it in full instead of a quarter.
   */
  blessed?: number;
}
