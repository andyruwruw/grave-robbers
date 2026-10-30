// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { moveWithCollision } from '@halloween/shared/world/collision';

// Local Imports
import { FLEE_FAN, FLEE_HASTE, FLEE_PROBE_STEP, FLEE_PROBE_STEPS, FLEE_RETHINK } from '../config/ai';
import { distance } from '../helpers/geometry';
import { monsterBlocked } from '../helpers/terrain';
import { Shambler } from './shambler';

// Types
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';

/**
 * A shambler that shoots from a distance: in range it backs away from
 * anyone closer than its `keep`, else takes its shot.
 */
export abstract class Kiter<P extends Target> extends Shambler<P> {
  /**
   * The way it's backing off from its prey (null: not backing off).
   */
  fleeHeading: number | null = null;

  /**
   * When it next reconsiders the way it's backing off.
   */
  fleeCheckAt = 0;

  /**
   * In range of a player: backs off when they're too close, else shoots.
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected engage(p: P, dt: number, world: World): boolean {
    const def = this.def;
    if (def.range !== undefined && distance(this, p) <= def.range) {
      const d = distance(this, p);
      if (def.keep !== undefined && d < def.keep && this.backOff(p, def.speed * FLEE_HASTE * this.pace * dt, world)) {
        this.setHunting(true);
        this.facing = Math.atan2(p.y - this.y, p.x - this.x);
        return true;
      }
      this.fleeHeading = null;
      if (world.time >= this.nextAttackAt || def.keep !== undefined) {
        this.setHunting(true);
        this.attack(p, world);
        return true;
      }
    }
    return false;
  }

  /**
   * Backs away from `p` without getting cornered: it keeps its heading
   * while that still gets it somewhere, and otherwise (stuck, or every
   * FLEE_RETHINK seconds) probes a fan of directions a couple of tiles out
   * and takes the one that ends furthest from its prey with the most room.
   * @param p The player.
   * @param step How far (tiles).
   * @param world The world.
   * @returns False when every way is blocked, so it fights.
   */
  private backOff(p: P, step: number, world: World): boolean {
    const blocked = monsterBlocked(world, this, true);
    if (this.fleeHeading === null || world.time >= this.fleeCheckAt) {
      const away = Math.atan2(this.y - p.y, this.x - p.x);
      let best: number | null = null;
      let bestScore = -Infinity;
      for (const off of FLEE_FAN) {
        const heading = away + off;
        let x = this.x;
        let y = this.y;
        for (let i = 0; i < FLEE_PROBE_STEPS; i++) {
          ({ x, y } = moveWithCollision(blocked, x, y, Math.cos(heading) * FLEE_PROBE_STEP, Math.sin(heading) * FLEE_PROBE_STEP, MONSTER_RADIUS));
        }
        const room = Math.hypot(x - this.x, y - this.y);
        const score = Math.hypot(x - p.x, y - p.y) + room - (heading === this.fleeHeading ? 0 : 0.2);
        if (room >= FLEE_PROBE_STEP && score > bestScore) {
          best = heading;
          bestScore = score;
        }
      }
      this.fleeHeading = best;
      this.fleeCheckAt = world.time + FLEE_RETHINK;
      if (best === null) {
        return false;
      }
    }
    const heading = this.fleeHeading!;
    const fromX = this.x;
    const fromY = this.y;
    this.moveToward(this.x + Math.cos(heading), this.y + Math.sin(heading), step, world, true);
    if (Math.hypot(this.x - fromX, this.y - fromY) < step * 0.3) {
      this.fleeCheckAt = 0;
    }
    return true;
  }
}
