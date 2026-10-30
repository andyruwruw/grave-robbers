// Packages
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { Bleeding } from './state/bleeding';
import { Knockback } from './state/knockback';
import { LastSeen } from './state/last-seen';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { MonsterArmor } from '@halloween/shared/monsters/armor';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { MonsterDef } from '@halloween/shared/monsters/monster-stats';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { HordeContext } from '../horde-context';
import type { Target } from '../types/hooks';
import type { MonsterInit } from '../types/monster';

/**
 * What every monster is: identity, the counters the display watches,
 * health, gear, timers, and how it goes out on the wire. Behavior is in
 * `Monster`.
 */
export abstract class MonsterCore<P extends Target> {
  /**
   * Its id.
   */
  readonly id: number;

  /**
   * What it is.
   */
  readonly kind: MonsterKind;

  /**
   * Where it stands (tiles).
   */
  x: number;

  /**
   * Where it stands (tiles).
   */
  y: number;

  /**
   * Which way it faces (radians).
   */
  facing: number;

  /**
   * Whether it moved this tick.
   */
  moving = false;

  /**
   * Counts up each time it's hurt.
   */
  hurts = 0;

  /**
   * Counts up each time it attacks.
   */
  attacks = 0;

  /**
   * Counts up each time it stumbles or is stunned.
   */
  stumbles = 0;

  /**
   * A ghost draining a light this tick.
   */
  draining = false;

  /**
   * Counts up each time a demon steps through the shadows.
   */
  blinks = 0;

  /**
   * Counts up each time a witch swipes her broom.
   */
  swipes = 0;

  /**
   * The junk weapon it carries, or null.
   */
  readonly held: GearKind | null;

  /**
   * The armor it wears, or null.
   */
  readonly armor: MonsterArmor | null;

  /**
   * Health left.
   */
  hp: number;

  /**
   * Full health, set by the world level when it appeared.
   */
  readonly maxHp: number;

  /**
   * How hard it hits, set by the world level when it appeared.
   */
  readonly power: number;

  /**
   * Dazed until then: frozen, doing nothing.
   */
  stunUntil = 0;

  /**
   * When it may attack next.
   */
  nextAttackAt = 0;

  /**
   * Whether it's after someone.
   */
  hunting = false;

  /**
   * Being shoved along.
   */
  readonly knock = new Knockback();

  /**
   * A bleeding wound.
   */
  readonly bleeding = new Bleeding<P>();

  /**
   * Where it last saw (or was hit by) someone.
   */
  readonly lastSeen: LastSeen;

  /**
   * Makes the monster from its rolls.
   * @param init Everything it's made with.
   * @param _ctx What the horde's parts share.
   */
  constructor(init: MonsterInit, protected readonly _ctx: HordeContext<P>) {
    this.id = init.id;
    this.kind = init.kind;
    this.x = init.x;
    this.y = init.y;
    this.facing = init.traits.facing;
    this.held = init.traits.held;
    this.armor = init.traits.armor;
    this.hp = init.hp;
    this.maxHp = init.hp;
    this.power = init.power;
    this.lastSeen = new LastSeen(init.x, init.y);
  }

  /**
   * Its kind's stats.
   * @returns The stats.
   */
  get def(): MonsterDef {
    return MONSTERS[this.kind];
  }

  /**
   * Whether it has a body: stands on plates, crowds players, gets pushed
   * around, bleeds onto traps (not ghosts).
   * @returns True for walkers.
   */
  get hasBody(): boolean {
    return true;
  }

  /**
   * It as the server broadcasts it.
   * @param liftedId The monster the TV's mouse is holding, if any.
   * @returns Its public state.
   */
  toState(liftedId: number | null): MonsterState {
    return {
      id: this.id,
      kind: this.kind,
      x: Math.round(this.x * 1000) / 1000,
      y: Math.round(this.y * 1000) / 1000,
      facing: Math.round(this.facing * 1000) / 1000,
      moving: this.moving,
      lifted: this.id === liftedId,
      held: this.held,
      hurts: this.hurts,
      armor: this.armor,
      health: Math.round(Math.max(0, this.hp / this.maxHp) * 100) / 100,
      attacks: this.attacks,
      stumbles: this.stumbles,
      hunting: this.hunting,
      draining: this.draining,
      blinks: this.blinks,
      swipes: this.swipes,
    };
  }
}
