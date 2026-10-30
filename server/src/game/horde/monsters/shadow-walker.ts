// Packages
import { VAMPIRE_SMASHES } from '@halloween/shared/monsters/kinds/vampire';
import { MONSTER_SEARCH, MONSTER_TREE_SLOW } from '@halloween/shared/monsters/movement';

// Local Imports
import { findPath } from '../../pathing/find-path';
import { PROWL_PACE, VAMPIRE_REPATH } from '../config/ai';
import { tileOf } from '../helpers/geometry';
import { monsterWalkable } from '../helpers/terrain';
import { Fighter } from './fighter';

// Types
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';

/**
 * Vampires and demons: they only move through the dark and wait at the
 * edge of the light, smash through what's in their way there, and
 * otherwise prowl between dark spots.
 */
export abstract class ShadowWalker<P extends Target> extends Fighter<P> {
  /**
   * A kind's own move on a player it sees out of reach.
   * @param p The player.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected ambush(p: P, world: World): boolean {
    return false;
  }

  /**
   * Chases whoever it sees through the dark, else prowls.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected act(dt: number, world: World, present: P[], prey: P[]): void {
    const def = this.def;
    const light = this._ctx.light;
    const here = tileOf(this);
    const inLight = light.isLit(here.tx, here.ty);
    const p = inLight ? null : this._ctx.sight.perceive(this, prey, world);
    if (p && this.inReach(p, world)) {
      this.attack(p, world);
      return;
    }
    if (p && this.ambush(p, world)) {
      return;
    }
    const goal = p ?? (this.remembered(world) ? { x: this.lastSeen.x, y: this.lastSeen.y } : null);
    this.setHunting(inLight || goal !== null);
    if (!inLight && !goal) {
      this.prowl(dt, world);
      return;
    }
    const walkable = monsterWalkable(world);
    const dark = (tx: number, ty: number): boolean => walkable(tx, ty) && !light.isLit(tx, ty);
    const step = (ok: (tx: number, ty: number) => boolean) => (tx: number, ty: number, fx: number, fy: number): number =>
      (ok(tx, ty) && world.map.canStep(fx, fy, tx, ty) ? (world.map.get(tx, ty) === 'tree' ? 1 / MONSTER_TREE_SLOW : 1) : Infinity);
    if (world.time >= this.repathAt) {
      this.repathAt = world.time + VAMPIRE_REPATH;
      const smash = (tx: number, ty: number, fx: number, fy: number): number =>
        (VAMPIRE_SMASHES.has(world.map.get(tx, ty)) && !light.isLit(tx, ty) && world.map.canStep(fx, fy, tx, ty)
          ? 1 + (world.structureQueries.hp(tx, ty) ?? 0) * 0.3
          : step(dark)(tx, ty, fx, fy));
      this.path = inLight || !goal
        ? findPath({ width: world.map.width, height: world.map.height, within: MONSTER_SEARCH, from: here, cost: step(walkable), open: walkable, accept: dark }) ?? []
        : findPath({ width: world.map.width, height: world.map.height, within: MONSTER_SEARCH,
          from: here,
          to: tileOf(goal),
          cost: smash,
          open: dark,
          score: (tx: number, ty: number): number => Math.hypot(tx + 0.5 - goal.x, ty + 0.5 - goal.y),
        }) ?? [];
    }
    this.skipReached();
    const next = this.path[0];
    if (next && VAMPIRE_SMASHES.has(world.map.get(next.tx, next.ty))) {
      this.chew(next, dt, world);
    } else if (next) {
      this.moveToward(next.tx + 0.5, next.ty + 0.5, def.speed * dt, world);
    } else if (p) {
      const pt = tileOf(p);
      if (pt.tx === here.tx && pt.ty === here.ty) {
        this.moveToward(p.x, p.y, def.speed * dt, world);
      }
    } else if (!inLight && Math.hypot(this.lastSeen.x - this.x, this.lastSeen.y - this.y) < 1.2) {
      this.giveUp(world);
    }
  }

  /**
   * Idle: slips from one dark spot to another a few tiles away, pausing
   * in between to look around. Never steps into light.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private prowl(dt: number, world: World): void {
    const time = world.time;
    this.skipReached();
    if (this.path.length === 0 && time >= this.wanderUntil) {
      if (Math.random() < 0.4) {
        this.wanderUntil = time + 1 + Math.random() * 2.5;
        this.facing += (Math.random() - 0.5) * 2;
      } else {
        const walkable = monsterWalkable(world);
        const dark = (tx: number, ty: number): boolean => walkable(tx, ty) && !this._ctx.light.isLit(tx, ty);
        for (let tries = 0; tries < 12 && this.path.length === 0; tries++) {
          const angle = Math.random() * Math.PI * 2;
          const reach = 4 + Math.random() * 5;
          const to = { tx: Math.floor(this.x + Math.cos(angle) * reach), ty: Math.floor(this.y + Math.sin(angle) * reach) };
          if (to.tx > 0 && to.ty > 0 && to.tx < world.map.width - 1 && to.ty < world.map.height - 1 && dark(to.tx, to.ty)) {
            this.path = findPath({ width: world.map.width, height: world.map.height, within: MONSTER_SEARCH,
              from: tileOf(this),
              to,
              cost: (tx: number, ty: number, fx: number, fy: number): number => (dark(tx, ty) && world.map.canStep(fx, fy, tx, ty) ? 1 : Infinity),
              open: dark,
            }) ?? [];
          }
        }
        this.wanderUntil = time + 0.5;
      }
    }
    const next = this.path[0];
    if (next) {
      this.moveToward(next.tx + 0.5, next.ty + 0.5, this.def.speed * PROWL_PACE * dt, world);
    }
  }
}
