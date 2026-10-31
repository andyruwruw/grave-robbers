// Local Imports
import { SwooshTrail } from '../shared/swoosh-trail';
import { TRAIL_LIFE, TRAIL_POOL, TRAIL_STEPS } from './config/monster-motion';

// Types
import type { Group } from 'three';
import type { TrailStyle } from './types/trail-style';

/**
 * The streak a monster's attack leaves, for kinds that have one.
 */
export class MonsterSwoosh {
  /**
   * The streak, or null for a kind without one.
   */
  private _trail: SwooshTrail | null = null;

  /**
   * Builds the streak from its kind's style.
   * @param group Where its bits go (the avatar's trail group).
   * @param style Where it comes from and how it looks, or null for none.
   */
  build(group: Group, style: TrailStyle | null): void {
    if (!style) {
      return;
    }
    const trail = new SwooshTrail(group, { poolPerSource: TRAIL_POOL, life: TRAIL_LIFE, steps: TRAIL_STEPS, size: style.size, opacity: style.opacity, color: style.color });
    for (const [parent, at] of style.points) {
      trail.addPoint(parent, at);
    }
    this._trail = trail;
  }

  /**
   * Leaves the streak while the attack swings, and fades it.
   * @param dt Seconds since the last frame.
   * @param swinging Whether the attack is drawing its streak.
   * @param body The avatar's group.
   */
  update(dt: number, swinging: boolean, body: Group): void {
    this._trail?.update(dt, swinging, body);
  }

  /**
   * Disposes the streak's materials.
   */
  dispose(): void {
    this._trail?.dispose();
  }
}
