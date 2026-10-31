// Packages
import { PUDDLE_DAMAGE, PUDDLE_SECONDS, SPLASH_RADIUS } from '@halloween/shared/monsters/kinds/witch';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { PuddleState } from '@halloween/shared/protocol/state/world-state';
import type { Shot } from '../types/shot';
import type { Puddle } from './types/puddle';

/**
 * Witches' potions bursting, and the puddles they and bloaters leave.
 */
export class PuddleSystem extends GameSystem {
  /**
   * Puddles witches' potions left: where, and until when (game clock).
   */
  puddles: Puddle[] = [];

  /**
   * The next puddle id.
   */
  private _nextPuddleId = 1;

  /**
   * A witch's potion bursts: everyone within SPLASH_RADIUS takes its
   * damage, and it leaves a puddle (see `stepPuddles`).
   * @param s The shot.
   */
  splash(s: Shot): void {
    this.outbox.events.push({ t: 'splash', x: s.x, y: s.y });
    this.spill(s.x, s.y, s.by, false);
    for (const p of this.players.values()) {
      if (!p.dead && Math.hypot(p.x - s.x, p.y - s.y) <= SPLASH_RADIUS) {
        this._game.damage.hurt(p, s.damage, s.by, s.x, s.y);
      }
    }
  }

  /**
   * Leaves a puddle (see `stepPuddles`).
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param by Whose it is for the kill feed.
   * @param bile Whether it's a bloater's bile.
   */
  spill(x: number, y: number, by: string, bile: boolean): void {
    this.puddles.push({ id: this._nextPuddleId++, x, y, at: this.world.time, until: this.world.time + PUDDLE_SECONDS, by, bile });
  }

  /**
   * Witches' and bloaters' puddles: anyone standing in one is slowed and takes
   * PUDDLE_DAMAGE a second; they dry up after PUDDLE_SECONDS.
   * @param dt Seconds since the last step.
   */
  stepPuddles(dt: number): void {
    const time = this.world.time;
    this.puddles = this.puddles.filter((puddle): boolean => time < puddle.until);
    for (const p of this.players.values()) {
      const puddle = !p.dead && this.puddles.find((q): boolean => Math.hypot(p.x - q.x, p.y - q.y) <= SPLASH_RADIUS);
      if (puddle) {
        p.slowUntil = Math.max(p.slowUntil, time + 0.25);
        this._game.damage.hurt(p, PUDDLE_DAMAGE * dt, puddle.by);
      }
    }
  }

  /**
   * Every puddle, as broadcast.
   * @returns Each puddle as broadcast.
   */
  puddleStates(): PuddleState[] {
    const time = this.world.time;
    return this.puddles.map(({ id, x, y, at, until, bile }): PuddleState => ({ id, x, y, life: Math.round(((until - time) / (until - at)) * 100) / 100, bile }));
  }
}
