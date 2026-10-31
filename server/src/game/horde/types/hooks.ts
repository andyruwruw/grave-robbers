// Types
import type { RaiseTrick, TurnTrick } from '@halloween/shared/gear/types/special-tricks';
import type { BurnTrick, CurseTrick, PinTrick, PoisonTrick, SlowTrick } from '@halloween/shared/gear/types/status-tricks';
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { MonsterDeath } from './death';

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

  /**
   * A bloater burst at (x, y), leaving a puddle of bile.
   */
  spill: (x: number, y: number, by: string) => void;

  /**
   * A monster died, however it happened (after `event`'s monster-death),
   * with who gets the kill and what it was suffering from, for on-kill
   * effects (see `MonsterDeath`).
   */
  died?: (death: MonsterDeath<P>) => void;
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
 * hurting for BLEED_SECONDS, credited to `by`. The infusion fields share
 * `WeaponStats`' names, so a weapon spread into a hit carries them (see
 * `docs/infusions.md`).
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
   * Who the hit (and any wound it opens) is credited to.
   */
  by?: P | null;

  /**
   * The weapon's reach (tiles), for a pin that only takes on the tip.
   */
  reach?: number;

  /**
   * Sets it burning (not a ghost).
   */
  burn?: BurnTrick;

  /**
   * A chance to poison it (not a ghost).
   */
  poison?: PoisonTrick;

  /**
   * A chance to curse it.
   */
  curse?: CurseTrick;

  /**
   * A chance to slow it.
   */
  slowOnHit?: SlowTrick;

  /**
   * Pins it (never a brute).
   */
  pin?: PinTrick;

  /**
   * In place of GHOST_KNOCKBACK on a ghost.
   */
  ghostKnock?: number;

  /**
   * A cursed monster takes the larger of this and `execute` times the
   * damage, at any health.
   */
  executeCursed?: number;

  /**
   * A cursed monster under this share of its health dies outright.
   */
  cursedKillBelow?: number;

  /**
   * A chance it turns on the other monsters, if it was already bleeding.
   */
  turn?: TurnTrick;

  /**
   * It rises on `by`'s side if it dies of the bleed this hit opens.
   */
  raise?: RaiseTrick;

  /**
   * Seconds a stun holds, in place of STUN_SECONDS.
   */
  stunFor?: number;

  /**
   * A stun that rolls on a brute staggers it instead (Earthshaker).
   */
  bruteStagger?: boolean;

  /**
   * Whether it landed on the weapon's tip (past TIP_FROM of its reach),
   * when the caller knows; otherwise worked out from `reach`.
   */
  tipped?: boolean;

  /**
   * A turned or risen monster's blow, the only kind that hurts a risen
   * ally.
   */
  fromMonster?: boolean;
}
