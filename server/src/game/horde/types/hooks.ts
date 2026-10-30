// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';

/**
 * What the horde needs to know about a player.
 */
export interface Target {
  /**
   * Where they stand (tiles).
   */
  x: number;

  /**
   * Where they stand (tiles).
   */
  y: number;

  /**
   * Which way they face (demons step out of the shadows behind them).
   */
  facing: number;

  /**
   * Down, waiting to respawn.
   */
  dead: boolean;

  /**
   * Still has a phone attached.
   */
  connected: boolean;

  /**
   * Monsters leave them alone (just joined or respawned).
   */
  protected: boolean;

  /**
   * Radius of a carried light bright enough to keep vampires off (a hand
   * torch), or 0.
   */
  light: number;
}

/**
 * How the horde reaches back into the game.
 */
export interface HordeHooks<P extends Target> {
  /**
   * A monster hit a player from (fromX, fromY).
   */
  hurt: (p: P, amount: number, by: string, fromX: number, fromY: number, knockback?: number, slow?: number) => number;

  /**
   * Something happened; for a monster's death, `killer` is who it goes to
   * when the killing blow wasn't a hit landing right now (a bleed).
   */
  event: (e: GameEvent, killer?: P) => void;

  /**
   * A monster loosed something hostile from (x, y) along `angle`: a ghost's
   * ectoplasm, a skeleton's arrow, or a witch's potion (which bursts after
   * `land` tiles).
   */
  shoot: (x: number, y: number, angle: number, shot: HostileShot) => void;
}

/**
 * Something a monster fires at players: what it is, its damage, speed and
 * range (tiles), who it's from for the kill feed, and for a potion, where
 * it lands.
 */
export interface HostileShot {
  /**
   * What flies.
   */
  kind: 'ecto' | 'arrow' | 'potion';

  /**
   * Damage on a hit.
   */
  damage: number;

  /**
   * Tiles a second.
   */
  speed: number;

  /**
   * How far it flies (tiles).
   */
  reach: number;

  /**
   * Who it's from, for the kill feed.
   */
  by: string;

  /**
   * For a potion, how far off it bursts (tiles).
   */
  land?: number;
}

/**
 * What a hit does besides damage (see `WeaponStats`): `crush` ignores
 * armor, `stagger` is the chance it breaks off a windup, `bruteBane`
 * multiplies damage to brutes and lets knockback move them, `execute`
 * multiplies damage to anything under half health, and `bleed` keeps
 * hurting for BLEED_SECONDS, credited to `by`.
 */
export interface HitEffects<P> {
  /**
   * Ignores armor.
   */
  crush?: boolean;

  /**
   * Chance it stuns.
   */
  stun?: number;

  /**
   * Chance it breaks off a windup.
   */
  stagger?: number;

  /**
   * Damage multiplier against brutes (and lets knockback move them).
   */
  bruteBane?: number;

  /**
   * Damage multiplier against anything under half health.
   */
  execute?: number;

  /**
   * Bleed damage a second.
   */
  bleed?: number;

  /**
   * Who the bleed is credited to.
   */
  by?: P | null;
}
