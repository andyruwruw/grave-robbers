// Packages
import { GATHERABLE } from '@halloween/shared/loot/gathering';
import { GRAVE_TILES } from '@halloween/shared/loot/graves';
import { MELEE_REACH_UP } from '@halloween/shared/players/combat';
import { BUILDABLE_FLOORS } from '@halloween/shared/structures/placement';
import { STRUCTURES, isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { findPath } from '../pathing/find-path';
import {
  BUILD_EVERY,
  BUILDS,
  PICK_TRIES,
  SIDES,
  SWING_TIME,
  WALK_TIME,
  WANDER_RANGE,
} from './config/bot';
import {
  botTile,
  isOpen,
  reachable,
  stepCost,
} from './helpers/bot-terrain';
import { BuildTask } from './tasks/build-task';
import { SwingTask } from './tasks/swing-task';
import { WalkTask } from './tasks/walk-task';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';
import type { Step } from '../pathing/types/path';
import type { BotTask } from './tasks/bot-task';
import type { BotView } from './types/bot';

/**
 * Picks the test player's next task.
 */
export class TaskPicker {
  /**
   * When the test player may next build (game clock seconds).
   */
  private _nextBuildAt = 0;

  /**
   * Builds if it's time and something is affordable, otherwise heads for
   * something worth swinging at anywhere on the map, otherwise walks to a
   * random open tile (or just nearby if boxed in).
   * @param v What the test player knows.
   * @returns The new task.
   */
  choose(v: BotView): BotTask {
    const here = botTile(v);
    if (v.time >= this._nextBuildAt) {
      this._nextBuildAt = v.time + BUILD_EVERY;
      const affordable = BUILDS.filter((k: StructureKind): boolean => v.canBuild(k) && v.canPay(STRUCTURES[k].cost));
      const spot = SIDES.map(([dx, dy]): Step => ({ tx: here.tx + dx, ty: here.ty + dy }))
        .find((s: Step): boolean => BUILDABLE_FLOORS.has(v.map.get(s.tx, s.ty)) && v.map.level(s.tx, s.ty) === v.map.level(here.tx, here.ty) && reachable(v.map, here, s) === reachable(v.map, here) - 1);
      if (affordable.length > 0 && spot) {
        return new BuildTask(spot, affordable[Math.floor(Math.random() * affordable.length)], v.time + 0.3, v.time + 2);
      }
    }
    const wanted = (tile: Tile): boolean => {
      if (tile === 'chest' || GRAVE_TILES.has(tile)) {
        return true;
      }
      const gather = GATHERABLE[tile];
      return !!gather;
    };
    const target = (tx: number, ty: number): Step | null => {
      for (const [dx, dy] of SIDES) {
        const gx = tx + dx;
        const gy = ty + dy;
        if (wanted(v.map.get(gx, gy)) && v.map.base(gx, gy) - v.map.top(tx, ty) <= MELEE_REACH_UP) {
          return { tx: gx, ty: gy };
        }
      }
      return null;
    };
    const cost = stepCost(v.map);
    const open = isOpen(v.map);
    const spots: Step[] = [];
    for (let ty = 0; ty < v.map.height; ty++) {
      for (let tx = 0; tx < v.map.width; tx++) {
        if (open(tx, ty) && target(tx, ty)) {
          spots.push({ tx, ty });
        }
      }
    }
    for (let tries = 0; tries < PICK_TRIES && spots.length > 0; tries++) {
      const to = spots.splice(Math.floor(Math.random() * spots.length), 1)[0];
      const goal = target(to.tx, to.ty)!;
      if (to.tx === here.tx && to.ty === here.ty) {
        return new SwingTask(goal, v.map.get(goal.tx, goal.ty), v.time + SWING_TIME);
      }
      const path = findPath({ width: v.map.width, height: v.map.height, from: here, to, cost, open });
      if (path && path.length > 0) {
        return new WalkTask(path, goal, v.time + WALK_TIME);
      }
    }
    for (let tries = 0; tries < PICK_TRIES; tries++) {
      const to = { tx: 1 + Math.floor(Math.random() * (v.map.width - 2)), ty: 1 + Math.floor(Math.random() * (v.map.height - 2)) };
      const path = open(to.tx, to.ty) ? findPath({ width: v.map.width, height: v.map.height, from: here, to, cost, open }) : null;
      if (path && path.length > 0) {
        return new WalkTask(path, null, v.time + WALK_TIME);
      }
    }
    const way = SIDES.map(([dx, dy]): Step => ({ tx: here.tx + dx, ty: here.ty + dy }))
      .find((s: Step): boolean => !!GATHERABLE[v.map.get(s.tx, s.ty)] || isStructure(v.map.get(s.tx, s.ty)));
    if (way) {
      return new SwingTask(way, v.map.get(way.tx, way.ty), v.time + SWING_TIME);
    }
    const to = {
      tx: Math.min(v.map.width - 2, Math.max(1, here.tx + Math.round((Math.random() * 2 - 1) * WANDER_RANGE))),
      ty: Math.min(v.map.height - 2, Math.max(1, here.ty + Math.round((Math.random() * 2 - 1) * WANDER_RANGE))),
    };
    return new WalkTask(findPath({ width: v.map.width, height: v.map.height, from: here, to, cost, open, score: (tx: number, ty: number): number => Math.hypot(tx - to.tx, ty - to.ty) }) ?? [], null, v.time + WALK_TIME);
  }
}
