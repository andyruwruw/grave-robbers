// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * Burning ground (the Hellfire Hammer): each monster a hit lands on
 * leaves a patch of scorched ground that keeps the listed kinds burning.
 */
export interface ScorchTrick {
  /**
   * Seconds a patch lasts.
   */
  seconds: number;

  /**
   * Radius of a patch in tiles.
   */
  radius: number;

  /**
   * Kinds that keep burning (with the weapon's `burn`) while they stand
   * in it.
   */
  kinds: MonsterKind[];
}

/**
 * A trail of fire on the ground behind each arrow in flight (the Pyre
 * Bow): any monster but a ghost that walks through it catches the
 * weapon's `burn`.
 */
export interface FireTrailTrick {
  /**
   * Seconds each bit of trail lasts.
   */
  seconds: number;

  /**
   * Radius in tiles of each bit of trail (one left every tile flown).
   */
  radius: number;
}

/**
 * Incense (Censer Flail, Thurible of Judgment): each swing leaves a cloud
 * where it lands that ghosts won't enter and demons take damage in.
 */
export interface IncenseTrick {
  /**
   * Seconds a cloud lasts.
   */
  seconds: number;

  /**
   * Radius of a cloud in tiles.
   */
  radius: number;

  /**
   * Damage a second to a demon inside.
   */
  rate: number;

  /**
   * Health a second it gives back to players inside (0 for none).
   */
  heal: number;

  /**
   * Most clouds one player keeps at once (the oldest goes first).
   */
  max: number;
}

/**
 * The wail (Wailing Sickle): every few kills, the next sweep is a
 * shockwave all the way around instead.
 */
export interface WailTrick {
  /**
   * Kills that charge the next sweep.
   */
  kills: number;

  /**
   * Radius of the shockwave in tiles (all the way around).
   */
  radius: number;

  /**
   * What the sweep's damage is multiplied by for everything in it.
   */
  mult: number;

  /**
   * Tiles it throws what it hits.
   */
  knockback: number;
}

/**
 * The ground slam (Titan's Maul): every strike also shakes everything
 * near the wielder that the blow itself didn't hit.
 */
export interface SlamTrick {
  /**
   * What the blow's damage is multiplied by for each monster it shakes.
   */
  mult: number;

  /**
   * Radius in tiles around the wielder.
   */
  radius: number;

  /**
   * Tiles it shoves each monster away from the wielder.
   */
  knockback: number;
}

/**
 * The fissure (Earthshaker): every few landed hits crack the ground
 * ahead, hitting everything along it.
 */
export interface FissureTrick {
  /**
   * Landed hits per fissure (the last of them cracks it).
   */
  every: number;

  /**
   * How far ahead it runs, in tiles.
   */
  length: number;

  /**
   * Tiles either side of its line it reaches.
   */
  width: number;

  /**
   * What the blow's damage is multiplied by for each monster on it.
   */
  mult: number;

  /**
   * Seconds it stuns each monster on it (brutes are only staggered).
   */
  stun: number;

  /**
   * Tiles it throws each monster on it.
   */
  knockback: number;
}

/**
 * Death blasts (Requiem Lash, Requiem Pyre, Infernal Mandate): monsters
 * this player kills (hits and burns alike) burst, hurting the monsters
 * around them.
 */
export interface DeathBlastTrick {
  /**
   * Damage to each monster in the blast (before `damageTo`).
   */
  damage: number;

  /**
   * Radius of the blast in tiles.
   */
  radius: number;

  /**
   * Most blasts a second one player sets off (the rest are skipped).
   */
  perSecond: number;

  /**
   * Only monsters that were burning when they died burst.
   */
  burningOnly?: boolean;

  /**
   * The blast sets what it hits burning with the weapon's `burn`.
   */
  ignite?: boolean;
}

