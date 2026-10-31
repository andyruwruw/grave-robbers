// Local Imports
import { HordePart } from './horde-part';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { World } from '../world/world';
import type { DeathCause } from './types/death';
import type { HitEffects, Target } from './types/hooks';

/**
 * What the game lays on monsters besides hits (`Horde.afflictions`):
 * statuses from patches of ground, plain damage over time, turning
 * monsters on each other and raising allies, and the incense ghosts keep
 * out of (see `docs/infusions.md`).
 */
export class Afflictions<P extends Target> extends HordePart<P> {
  /**
   * Lays a hit's statuses on a monster with no damage, knockback, stun or
   * flinch (a burn from scorched ground or a fire trail). Chances still
   * roll; a pin's tip rule can't be judged, so tip-only pins don't take.
   * @param id Its id.
   * @param effects What to afflict it with (`burn`, `curse`, `slowOnHit`, ..., and `by`).
   * @param world The world.
   */
  afflict(id: number, effects: HitEffects<P>, world: World): void {
    const m = this.roster.get(id);
    if (m && !m.turned.ally) {
      m.afflict(effects, world.time);
    }
  }

  /**
   * Plain damage with no hit behind it (incense on a demon): no
   * knockback, and it only flinches each whole point. A kill goes to `by`.
   * @param id Its id.
   * @param amount The damage.
   * @param by Who gets the kill.
   * @param cause What a death from it counts as.
   * @returns Whether it killed it.
   */
  drain(id: number, amount: number, by: P | null, cause: DeathCause = 'drain'): boolean {
    const m = this.roster.get(id);
    return !!m && !m.turned.ally && m.drain(amount, by, cause);
  }

  /**
   * Turns a monster on the others for `seconds`, fighting for `by` (its
   * kills go to them). Only fighters can be turned.
   * @param id Its id.
   * @param seconds How long.
   * @param by Who it fights for.
   * @param world The world.
   * @returns False if it's gone or can't be turned.
   */
  turn(id: number, seconds: number, by: P | null, world: World): boolean {
    return this.roster.get(id)?.turnOn(seconds, by, false, world.time) ?? false;
  }

  /**
   * Raises a monster at (x, y) on a player's side for `seconds`; then it
   * falls for good, leaving nothing. Only other monsters can hurt it.
   * @param kind What rises.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param seconds How long it fights.
   * @param by Who it fights for.
   * @returns Its id, or null if it couldn't rise.
   */
  raiseAlly(kind: MonsterKind, x: number, y: number, seconds: number, by: P | null): number | null {
    return this._horde.raiseAlly(kind, x, y, seconds, by);
  }

  /**
   * Sets this tick's incense clouds, which ghosts won't enter (pushed out
   * to the edge like a bell does).
   * @param clouds Each cloud's center and radius (tiles).
   */
  setIncense(clouds: { x: number; y: number; radius: number }[]): void {
    this._horde.incense = clouds;
  }

  /**
   * What's afflicting a monster right now.
   * @param id Its id.
   * @returns Its STATUS_ bits (`shared/src/monsters/monster-status.ts`), 0 if it's gone.
   */
  status(id: number): number {
    return this.roster.get(id)?.status() ?? 0;
  }

  /**
   * Whether a monster is a risen ally on the players' side, which
   * players' hits, turrets and blasts should pass over.
   * @param id Its id.
   * @returns True for a risen ally.
   */
  isAlly(id: number): boolean {
    return this.roster.get(id)?.turned.ally ?? false;
  }
}
