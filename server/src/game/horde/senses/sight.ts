// Packages
import { NEAR_SIGHT, SIGHT_CONE, SIGHT_SEARCH } from '@halloween/shared/monsters/sight';

// Local Imports
import { OPAQUE } from '../config/tiles';
import { angleOff, distance } from '../helpers/geometry';
import { HordePart } from '../horde-part';

// Types
import type { World } from '../../world/world';
import type { Monster } from '../monsters/monster';
import type { Target } from '../types/hooks';

/**
 * Who each monster can see this tick, and lines of sight.
 */
export class Sight<P extends Target> extends HordePart<P> {
  /**
   * This tick's sightings: for each monster, the players it can see.
   */
  private readonly _sightings = new Map<number, P[]>();

  /**
   * Works out who each monster can see this tick, searching around each
   * player: only monsters within SIGHT_SEARCH tiles are checked, and only
   * those close enough (NEAR_SIGHT any way, or their sight in front of
   * them) get a line of sight traced.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  look(world: World, prey: P[]): void {
    this._sightings.clear();
    for (const p of prey) {
      for (const m of this.roster.values()) {
        if (!m.hasBody || Math.abs(m.x - p.x) > SIGHT_SEARCH || Math.abs(m.y - p.y) > SIGHT_SEARCH) {
          continue;
        }
        const d = distance(m, p);
        if (d > SIGHT_SEARCH) {
          continue;
        }
        const angle = Math.atan2(p.y - m.y, p.x - m.x);
        const ahead = angleOff(angle, m.facing) <= SIGHT_CONE;
        if ((d <= NEAR_SIGHT || (ahead && d <= m.def.sight)) && this.canSee(world, m.x, m.y, p.x, p.y)) {
          const seen = this._sightings.get(m.id);
          if (seen) {
            seen.push(p);
          } else {
            this._sightings.set(m.id, [p]);
          }
        }
      }
    }
  }

  /**
   * The closest player the monster can see this tick (see `look`), or
   * while a world event hunts the closest player anywhere, or null. Seeing
   * someone refreshes where the monster last saw them.
   * @param m The monster.
   * @param prey Players monsters may go after.
   * @param world The world.
   * @returns The player, or null.
   */
  perceive(m: Monster<P>, prey: P[], world: World): P | null {
    let best: P | null = null;
    let bestDist = Infinity;
    for (const p of this._horde.mods.hunt ? prey : this._sightings.get(m.id) ?? []) {
      const d = distance(m, p);
      if (d < bestDist && prey.includes(p)) {
        best = p;
        bestDist = d;
      }
    }
    if (best) {
      m.lastSeen.see(best.x, best.y, world.time);
    }
    return best;
  }

  /**
   * Whether nothing tall stands between two points (the tiles at either
   * end don't count, so a scarecrow or a player in a doorway can be seen).
   * @param world The world.
   * @param x0 From (tiles).
   * @param y0 From (tiles).
   * @param x1 To (tiles).
   * @param y1 To (tiles).
   * @returns True when the line is clear.
   */
  canSee(world: World, x0: number, y0: number, x1: number, y1: number): boolean {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25);
    const sx = Math.floor(x0);
    const sy = Math.floor(y0);
    const ex = Math.floor(x1);
    const ey = Math.floor(y1);
    for (let i = 1; i < steps; i++) {
      const tx = Math.floor(x0 + ((x1 - x0) * i) / steps);
      const ty = Math.floor(y0 + ((y1 - y0) * i) / steps);
      if ((tx !== sx || ty !== sy) && (tx !== ex || ty !== ey) && OPAQUE.has(world.map.get(tx, ty))) {
        return false;
      }
    }
    return true;
  }
}
