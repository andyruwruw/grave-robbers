// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * Burning (Enflamed): damage a second for a while, on anything but
 * ghosts. It refreshes, never stacks.
 */
export interface BurnTrick {
  /**
   * Damage a second while it burns.
   */
  rate: number;

  /**
   * Seconds a hit keeps it burning (refreshed by each hit).
   */
  seconds: number;

  /**
   * Radius (tiles) of the light a monster burning this way gives off
   * (Hell's Edge), if any.
   */
  light?: number;
}

/**
 * Poison (Ghoul Poker): a chance per hit of damage a second for a while.
 * It refreshes, never stacks.
 */
export interface PoisonTrick {
  /**
   * Chance a hit poisons, 0 to 1.
   */
  chance: number;

  /**
   * Damage a second while poisoned.
   */
  rate: number;

  /**
   * Seconds a poisoning lasts (refreshed by each poisoning hit).
   */
  seconds: number;
}

/**
 * The hex curse (Hexed): a chance per hit to curse a monster for a while.
 * While cursed it takes damage a second, moves slower, and takes more
 * damage from everyone. It refreshes, never stacks.
 */
export interface CurseTrick {
  /**
   * Chance a hit curses, 0 to 1 (already worked out from the weapon's
   * cycle; see `curseChance`).
   */
  chance: number;

  /**
   * Seconds a curse lasts (refreshed by each cursing hit).
   */
  seconds: number;

  /**
   * Damage a second while cursed.
   */
  rate: number;

  /**
   * What damage from anyone is multiplied by while cursed.
   */
  taken: number;

  /**
   * What a cursed monster's speed is multiplied by.
   */
  slow: number;
}

/**
 * A chance per hit to slow what it hits (Phantom Edge, Spirit Bow).
 */
export interface SlowTrick {
  /**
   * Chance a hit slows, 0 to 1.
   */
  chance: number;

  /**
   * What the monster's speed is multiplied by while slowed.
   */
  factor: number;

  /**
   * Seconds the slow lasts (refreshed by each slowing hit).
   */
  seconds: number;
}

/**
 * Pinning (The Impaler, Hunter's Arbalest): a hit holds the monster in
 * place, cancelling a leap, dash, or pounce in progress. Brutes are never
 * pinned.
 */
export interface PinTrick {
  /**
   * Seconds the monster is held.
   */
  seconds: number;

  /**
   * What damage from other players is multiplied by while it's held (1
   * for none).
   */
  bonus: number;

  /**
   * Only a hit past TIP_FROM of the weapon's reach pins (the spear's tip).
   */
  tip?: boolean;

  /**
   * Only these kinds are pinned (every kind but brutes when left out).
   */
  kinds?: MonsterKind[];
}

/**
 * Chain lightning (Dawn's Scourge, The Seraphic Chain): each monster a
 * hit lands on sends a bolt jumping on to the nearest others.
 */
export interface ChainTrick {
  /**
   * How many more monsters it jumps to, each from the last one hit.
   */
  targets: number;

  /**
   * Damage each jump does (before `damageTo`, so Blessed still counts).
   */
  damage: number;

  /**
   * Tiles each jump reaches from the monster it jumps from.
   */
  radius: number;

  /**
   * Chance each jump stuns for STUN_SECONDS (not brutes).
   */
  stun: number;
}

