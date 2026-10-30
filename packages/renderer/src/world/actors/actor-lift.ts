// Local Imports
import { Dangle } from '../../avatars/shared/dangle';
import { ScenePart } from '../scene-part';
import { LIFT_HEIGHT, LIFT_SPEED } from './config/actors';

// Types
import type { Group } from 'three';

/**
 * Players and monsters the TV's mouse holds up: how high each is right
 * now, and the rag-doll swing of each one hanging there.
 */
export class ActorLift extends ScenePart {
  /**
   * How high each held (or settling) actor is, by `p<id>`/`m<id>`.
   */
  private _liftHeights = new Map<string, number>();

  /**
   * The swing of each held actor, by `p<id>`/`m<id>`.
   */
  private _dangles = new Map<string, Dangle>();

  /**
   * How high something is held up by the TV's mouse right now, easing up
   * while it's lifted and back down once it's dropped.
   * @param key The actor's key.
   * @param lifted Whether it's held up.
   * @param dt Seconds since the last frame.
   * @returns The height.
   */
  height(key: string, lifted: boolean, dt: number): number {
    const before = this._liftHeights.get(key) ?? 0;
    const now = Math.min(LIFT_HEIGHT, Math.max(0, before + (lifted ? 1 : -1) * LIFT_HEIGHT * LIFT_SPEED * dt));
    if (now === 0) {
      this._liftHeights.delete(key);
    } else {
      this._liftHeights.set(key, now);
    }
    return now;
  }

  /**
   * Swings whatever is held up like a rag doll from the top of its head;
   * forgets the swing once it's back on the ground.
   * @param key The actor's key.
   * @param group The actor's group.
   * @param lift How high it's held.
   * @param pivot Height above its feet it hangs from.
   * @param dt Seconds since the last frame.
   * @param time Clock seconds.
   */
  dangle(key: string, group: Group, lift: number, pivot: number, dt: number, time: number): void {
    if (lift <= 0) {
      this._dangles.delete(key);
      return;
    }
    let dangle = this._dangles.get(key);
    if (!dangle) {
      dangle = new Dangle();
      this._dangles.set(key, dangle);
    }
    dangle.update(dt, group.position.x, group.position.z);
    dangle.apply(group, pivot, lift / LIFT_HEIGHT, time);
  }
}
