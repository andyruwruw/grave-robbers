// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * Overheal (Heart Devourer, Death's Harvest): health this weapon's kills
 * give back past full becomes extra health.
 */
export interface OverhealTrick {
  /**
   * Most extra health held at once.
   */
  max: number;

  /**
   * Seconds after it was last topped up that it vanishes.
   */
  seconds: number;
}

/**
 * The throw (Soulbound Glaive, Wraith Glaive): the combo's stab step
 * throws the glaive instead, and it flies back to the thrower.
 */
export interface ThrowTrick {
  /**
   * Tiles it flies out before it turns back.
   */
  range: number;

  /**
   * Tiles a second it flies.
   */
  speed: number;

  /**
   * It turns toward the nearest monster ahead when thrown.
   */
  autoAim: boolean;

  /**
   * Tiles it swings out sideways on the way back, to hit more (0 for a
   * straight return).
   */
  arc: number;
}

/**
 * The holy nova (Archangel's Fists): the super uppercut sends out a ring
 * that shoves the listed kinds away.
 */
export interface NovaTrick {
  /**
   * Radius of the ring in tiles.
   */
  radius: number;

  /**
   * Tiles it shoves each monster it reaches.
   */
  knockback: number;

  /**
   * Kinds it shoves.
   */
  kinds: MonsterKind[];
}

/**
 * Turning (Plague Knuckles): a chance per hit on a bleeding monster of
 * the listed kinds that it turns on the other monsters for a while.
 */
export interface TurnTrick {
  /**
   * Chance a hit turns it, 0 to 1.
   */
  chance: number;

  /**
   * Seconds it stays turned.
   */
  seconds: number;

  /**
   * Kinds that can be turned (only while bleeding).
   */
  kinds: MonsterKind[];
}

/**
 * Raising (Grave Fists): monsters of the listed kinds that die bleeding
 * from this player's wounds rise again on their side for a while.
 */
export interface RaiseTrick {
  /**
   * Seconds a risen monster fights on the player's side before it falls
   * for good.
   */
  seconds: number;

  /**
   * Kinds that rise.
   */
  kinds: MonsterKind[];
}

/**
 * The one-shot (Moonsilver Saber): one hit kills a monster of the listed
 * kinds outright, then the blade dims while it recharges.
 */
export interface SlayTrick {
  /**
   * Kinds it kills outright.
   */
  kinds: MonsterKind[];

  /**
   * Seconds it takes to recharge after a kill.
   */
  seconds: number;
}

/**
 * The flamethrower (Hellmouth): holding Action sprays a cone of fire
 * instead of shooting.
 */
export interface SprayTrick {
  /**
   * Half-width of the cone in radians.
   */
  cone: number;

  /**
   * How far it reaches, in tiles.
   */
  range: number;

  /**
   * Damage a second to the nearest monster in the cone.
   */
  rate: number;

  /**
   * Most monsters in the cone it reaches (nearest first; the front ones
   * block the rest).
   */
  targets: number;

  /**
   * What the rate is multiplied by for every monster after the first.
   */
  falloff: number;

  /**
   * Seconds of spraying each blood pays for.
   */
  bloodEvery: number;
}

