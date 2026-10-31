// Packages
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import {
  REACH_CACHE,
  REACH_FLOOD_MS,
  REACH_FLOODS_PER_TICK,
  REACH_RADIUS_MAX,
  REACH_RADIUS_MIN,
  REACH_TTL,
  REACH_TUNE_RATE,
} from '../config/ai';
import { monsterWalkable } from '../helpers/terrain';

// Types
import type { Step } from '../../pathing/types/path';
import type { World } from '../../world/world';

/**
 * The four steps a flood takes from a tile.
 */
const SIDES: readonly (readonly [number, number])[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * One flood backwards from a goal.
 */
interface Flood {
  /**
   * The goal it spread from.
   */
  start: Step;

  /**
   * When it was made (game clock).
   */
  at: number;

  /**
   * How far it spread from the start (tiles each way).
   */
  radius: number;

  /**
   * This flood's mark.
   */
  stamp: number;

  /**
   * One mark per tile: `stamp` where `start` can be walked to from.
   */
  marks: Uint32Array;
}

/**
 * Which tiles a monster could walk to a goal from, so a chase toward a
 * goal that can't be reached (a player up a cliff, across a chasm) skips
 * the path search that would look at every tile in range before giving up.
 *
 * A flood runs backwards from a goal under a zombie's rules (the most
 * forgiving: they chew through any structure), out to a radius that tunes
 * itself so a flood takes about REACH_FLOOD_MS, and is kept for REACH_TTL seconds. It answers for any other goal it marked (one
 * that can walk to its start), so a player moving about the same ground
 * reuses one flood: a monster that can't reach the start can't reach that
 * goal either, or it could go on from the goal to the start. At most
 * REACH_FLOODS_PER_TICK new floods a tick; with no answer, the monster is
 * assumed able to get there, so nothing is wrongly left behind.
 */
export class ReachMap {
  /**
   * The kept floods, oldest first.
   */
  private _floods: Flood[] = [];

  /**
   * The next flood's stamp.
   */
  private _stamp = 0;

  /**
   * The tick floods were last counted in.
   */
  private _tickAt = -1;

  /**
   * How many floods that tick made.
   */
  private _made = 0;

  /**
   * How far the next flood spreads, tuned by how long floods take.
   */
  private _radius: number = REACH_RADIUS_MAX;

  /**
   * Whether a monster on `from` could walk to `goal`.
   * @param goal Where it's heading.
   * @param from Where it stands.
   * @param world The world.
   * @returns False only when it surely can't get there.
   */
  reaches(goal: Step, from: Step, world: World): boolean {
    if (Math.abs(goal.tx - from.tx) > this._radius || Math.abs(goal.ty - from.ty) > this._radius) {
      return true;
    }
    const width = world.map.width;
    const g = goal.ty * width + goal.tx;
    const f = from.ty * width + from.tx;
    this._floods = this._floods.filter((fl: Flood): boolean => world.time - fl.at < REACH_TTL && fl.marks.length === world.map.size);
    for (const fl of this._floods) {
      if (fl.marks[g] === fl.stamp && Math.abs(from.tx - fl.start.tx) <= fl.radius && Math.abs(from.ty - fl.start.ty) <= fl.radius) {
        return fl.marks[f] === fl.stamp;
      }
    }
    const made = this.make(goal, world);
    return made ? made.marks[f] === made.stamp : true;
  }

  /**
   * A new flood from a goal, if the tick has floods to spare.
   * @param goal The goal.
   * @param world The world.
   * @returns The flood, or null when the tick's floods are used up.
   */
  private make(goal: Step, world: World): Flood | null {
    if (this._tickAt !== world.time) {
      this._tickAt = world.time;
      this._made = 0;
    }
    if (this._made >= REACH_FLOODS_PER_TICK) {
      return null;
    }
    this._made++;
    const spare = this._floods.length >= REACH_CACHE ? this._floods.shift()! : null;
    const marks = spare && spare.marks.length === world.map.size ? spare.marks : new Uint32Array(world.map.size);
    const flood: Flood = { start: goal, at: world.time, radius: Math.round(this._radius), stamp: ++this._stamp, marks };
    const began = performance.now();
    this.flood(flood, world);
    this.tune(flood.radius, performance.now() - began);
    this._floods.push(flood);
    return flood;
  }

  /**
   * Moves the radius toward the one that would make a flood take
   * REACH_FLOOD_MS: a flood's cost grows with its area, so that's this
   * one's radius times the square root of how far off its time was.
   * @param radius The radius it spread to.
   * @param ms How long it took.
   */
  private tune(radius: number, ms: number): void {
    const ideal = radius * Math.sqrt(REACH_FLOOD_MS / Math.max(ms, 0.01));
    const next = this._radius + (ideal - this._radius) * REACH_TUNE_RATE;
    this._radius = Math.min(REACH_RADIUS_MAX, Math.max(REACH_RADIUS_MIN, next));
  }

  /**
   * Floods backwards from the goal: a tile joins when a zombie could step
   * from it onto a tile already in (walking or dropping down), or the tile
   * already in is a structure (stepped onto or chewed through, as the
   * zombie's own path costs allow).
   * @param flood The flood to fill.
   * @param world The world.
   */
  private flood(flood: Flood, world: World): void {
    const { start: goal, radius, stamp, marks } = flood;
    const map = world.map;
    const width = map.width;
    const open = monsterWalkable(world);
    const minX = Math.max(0, goal.tx - radius);
    const minY = Math.max(0, goal.ty - radius);
    const maxX = Math.min(width - 1, goal.tx + radius);
    const maxY = Math.min(map.height - 1, goal.ty + radius);
    const queue = [goal.ty * width + goal.tx];
    marks[queue[0]] = stamp;
    for (let head = 0; head < queue.length; head++) {
      const n = queue[head];
      const nx = n % width;
      const ny = (n - nx) / width;
      const built = isStructure(map.get(nx, ny));
      if (!built && !open(nx, ny)) {
        continue;
      }
      for (const [dx, dy] of SIDES) {
        const tx = nx + dx;
        const ty = ny + dy;
        if (tx < minX || ty < minY || tx > maxX || ty > maxY) {
          continue;
        }
        const t = ty * width + tx;
        if (marks[t] !== stamp && (built || map.canStep(tx, ty, nx, ny))) {
          marks[t] = stamp;
          queue.push(t);
        }
      }
    }
  }
}
