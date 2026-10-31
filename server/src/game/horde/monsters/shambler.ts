// Packages
import { MONSTER_SEARCH, MONSTER_TREE_SLOW } from '@halloween/shared/monsters/movement';
import { SCARECROW_RANGE } from '@halloween/shared/monsters/sight';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { isTrap } from '@halloween/shared/structures/traps';
import { isSolidTile } from '@halloween/shared/world/tiles';

// Local Imports
import { findPath } from '../../pathing/find-path';
import {
  BUMP_GIVE_UP,
  RAID_DISTRACT,
  RAID_REPICK,
  SCENT_RADIUS,
  SCENT_SECONDS,
  SHAMBLE_PACE,
  SHAMBLE_REACH,
  SHAMBLE_WEAVE,
  STUMBLE_RATE,
  STUMBLE_SPEED,
  STUMBLE_TIME,
  ZOMBIE_REPATH,
} from '../config/ai';
import { LURE_CHANCE, LURE_REACH, LURE_TRIES } from '../config/heat';
import { SPIKE_COST } from '../config/tiles';
import { tileOf } from '../helpers/geometry';
import { raidTarget } from '../helpers/raid-target';
import { monsterBlocked, monsterWalkable } from '../helpers/terrain';
import { Fighter } from './fighter';

// Types
import type { Step } from '../../pathing/types/path';
import type { World } from '../../world/world';
import type { HordeContext } from '../horde-context';
import type { Target } from '../types/hooks';
import type { Lure, MonsterInit } from '../types/monster';

/**
 * Zombie-family monsters: path to whoever they see (or a scarecrow they
 * spot), head for where they last saw someone for a while, chew through
 * what's built in the way, and otherwise shamble around with pauses,
 * drawn toward their lure.
 */
export abstract class Shambler<P extends Target> extends Fighter<P> {
  /**
   * Its own speed multiplier, so a crowd doesn't move in step.
   */
  readonly pace: number;

  /**
   * What it's drawn toward when it picks where to shamble, if anything.
   */
  readonly lure: Lure;

  /**
   * How long it has been making no headway.
   */
  bumping = 0;

  /**
   * The player it last saw, whose scent it follows for a while after.
   */
  scentOf: P | null = null;

  /**
   * When it loses their scent.
   */
  scentUntil = 0;

  /**
   * The base structure it's raiding in a blood moon, or null.
   */
  raidAt: Step | null = null;

  /**
   * When it next picks what to raid.
   */
  raidPickAt = 0;

  /**
   * Makes the monster from its rolls.
   * @param init Everything it's made with.
   * @param ctx What the horde's parts share.
   */
  constructor(init: MonsterInit, ctx: HordeContext<P>) {
    super(init, ctx);
    this.pace = init.traits.pace;
    this.lure = init.traits.lure;
  }

  /**
   * A kind's own move on a player it sees, before the usual chase.
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected engage(p: P, dt: number, world: World): boolean {
    return false;
  }

  /**
   * Chases whoever it sees (or a scarecrow, or where it last saw someone),
   * chewing through what's built in the way, else shambles.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected act(dt: number, world: World, present: P[], prey: P[]): void {
    const def = this.def;
    const p = this._ctx.sight.perceive(this, prey, world);
    if (p && this.engage(p, dt, world)) {
      return;
    }
    if (p && this.inReach(p, world)) {
      this.attack(p, world);
      return;
    }
    if (p) {
      this.scentOf = p;
      this.scentUntil = world.time + SCENT_SECONDS;
    }
    const scarecrow = this.nearestScarecrow(world);
    const raid = this.raid(world, p);
    const goal = scarecrow ?? raid ?? (p ? tileOf(p) : this.scent(world, prey) ?? this.remembered(world));
    this.setHunting(goal !== null);
    if (!goal) {
      this.shamble(dt, world);
      return;
    }
    if (world.time >= this.repathAt) {
      this.repathAt = world.time + ZOMBIE_REPATH * (0.8 + Math.random() * 0.4);
      const open = monsterWalkable(world);
      this.path = findPath({ width: world.map.width, height: world.map.height, within: MONSTER_SEARCH, budget: this.chaseBudget(goal, world),
        from: tileOf(this),
        to: goal,
        cost: (tx: number, ty: number, fx: number, fy: number): number => {
          const tile = world.map.get(tx, ty);
          if (isStructure(tile) && (isSolidTile(tile) || tile === 'door' || !world.map.canStep(fx, fy, tx, ty))) {
            return 1 + (world.structureQueries.hp(tx, ty) ?? 0) * 0.3;
          }
          if (!open(tx, ty) || !world.map.canStep(fx, fy, tx, ty)) {
            return Infinity;
          }
          return isTrap(tile) ? SPIKE_COST : tile === 'tree' ? 1 / MONSTER_TREE_SLOW : 1;
        },
        open,
        score: (tx: number, ty: number): number => Math.hypot(tx - goal.tx, ty - goal.ty),
      }) ?? [];
      this.backOffIfShort(goal, world);
    }
    this.skipReached();
    const next = this.path[0];
    if (!next && raid) {
      this.chew(raid, dt, world);
      return;
    }
    if (!next) {
      if (p) {
        this.moveToward(p.x, p.y, def.speed * this.pace * dt, world);
      } else if (!scarecrow && Math.hypot(this.lastSeen.x - this.x, this.lastSeen.y - this.y) < 1.2) {
        this.giveUp(world);
      }
      return;
    }
    if (monsterBlocked(world, this)(next.tx, next.ty)) {
      this.chew(next, dt, world);
      return;
    }
    this.moveToward(next.tx + 0.5, next.ty + 0.5, def.speed * this.pace * dt, world);
  }

  /**
   * Where the player it lost sight of really is, while it still has their
   * scent (SCENT_SECONDS since it last saw them, and within SCENT_RADIUS):
   * so it follows them home and chews through the door after them.
   * @param world The world.
   * @param prey Players monsters may go after.
   * @returns Their tile, or null.
   */
  private scent(world: World, prey: P[]): Step | null {
    const p = this.scentOf;
    if (!p || p.dead || world.time >= this.scentUntil || !prey.includes(p) || Math.hypot(p.x - this.x, p.y - this.y) > SCENT_RADIUS) {
      return null;
    }
    return tileOf(p);
  }

  /**
   * In a blood moon's raid, the base structure it goes for (`raidTarget`,
   * repicked every RAID_REPICK seconds or once it's gone), unless it isn't
   * one of the raiders (`EventModifiers.raid` of them, by id) or a player
   * is within RAID_DISTRACT.
   * @param world The world.
   * @param p The player it sees, if any.
   * @returns The tile to raid, or null.
   */
  private raid(world: World, p: P | null): Step | null {
    const share = this._ctx.mods.raid;
    if (share <= 0 || (this.id * 0.618) % 1 >= share || (p && Math.hypot(p.x - this.x, p.y - this.y) <= RAID_DISTRACT)) {
      this.raidAt = null;
      return null;
    }
    if (world.time >= this.raidPickAt || (this.raidAt && !world.structures.get(this.raidAt.ty * world.map.width + this.raidAt.tx))) {
      this.raidPickAt = world.time + RAID_REPICK;
      this.raidAt = raidTarget(world, this.x, this.y);
    }
    return this.raidAt;
  }

  /**
   * The closest scarecrow it can see in range.
   * @param world The world.
   * @returns Its tile, or undefined.
   */
  private nearestScarecrow(world: World): Step | undefined {
    return world.structureQueries.structuresOf('scarecrow')
      .map((s: Step): { s: Step; d: number } => ({ s, d: Math.hypot(s.tx + 0.5 - this.x, s.ty + 0.5 - this.y) }))
      .filter(({ s, d }): boolean => d <= SCARECROW_RANGE && this._ctx.sight.canSee(world, this.x, this.y, s.tx + 0.5, s.ty + 0.5))
      .sort((a, b): number => a.d - b.d)[0]?.s;
  }

  /**
   * Idle: picks a tile a few steps off (or, if it's lured, a hot spot for
   * players or graves) and shambles there along a path at its own pace,
   * weaving a little, stops to sway in place for a few seconds once there,
   * trips and recovers now and then, and picks somewhere else if it gets
   * stuck.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private shamble(dt: number, world: World): void {
    const time = world.time;
    this.skipReached();
    if (!this.wanderIdle && this.path.length === 0) {
      this.wanderIdle = true;
      this.wanderUntil = time + 1.5 + Math.random() * 3;
      this.facing += (Math.random() - 0.5) * 1.5;
    }
    if (this.wanderIdle) {
      if (time < this.wanderUntil) {
        return;
      }
      this.path = this.wanderPath(world);
      this.bumping = 0;
      this.wanderIdle = this.path.length === 0;
      this.wanderUntil = time + 1;
      return;
    }
    if (Math.random() < STUMBLE_RATE * dt) {
      const angle = this.facing + (Math.random() - 0.5) * 1.4;
      this.stumbles++;
      this.knock.x = Math.cos(angle) * STUMBLE_SPEED;
      this.knock.y = Math.sin(angle) * STUMBLE_SPEED;
      this.knock.until = time + STUMBLE_TIME;
      this.wanderUntil = time + 0.8 + Math.random() * 1.2;
      this.wanderIdle = true;
      return;
    }
    const next = this.path[0];
    const heading = Math.atan2(next.ty + 0.5 - this.y, next.tx + 0.5 - this.x);
    const weave = heading + Math.sin(time * 2.6 + this.id) * SHAMBLE_WEAVE;
    const step = this.def.speed * SHAMBLE_PACE * this.pace * dt;
    const fromX = this.x;
    const fromY = this.y;
    this.moveToward(this.x + Math.cos(weave), this.y + Math.sin(weave), step, world);
    this.facing = heading;
    this.bumping = Math.hypot(this.x - fromX, this.y - fromY) < step * 0.3 ? this.bumping + dt : 0;
    if (this.bumping > BUMP_GIVE_UP) {
      this.path = [];
    }
  }

  /**
   * Where it heads next when idle: a path to a random open tile a few
   * steps away, or when lured (most of the time) to the hottest of a
   * handful of spots for its lure.
   * @param world The world.
   * @returns The path, empty if nothing could be found.
   */
  private wanderPath(world: World): Step[] {
    const open = monsterWalkable(world);
    const here = tileOf(this);
    const lured = this.lure !== null && Math.random() < LURE_CHANCE;
    const heat = this._ctx.heat.heatFor(this.lure);
    let goal: Step | null = null;
    let best = -Infinity;
    for (let tries = 0; tries < (lured ? LURE_TRIES : 6); tries++) {
      const angle = Math.random() * Math.PI * 2;
      const reach = lured ? 2 + Math.random() * (LURE_REACH - 2) : SHAMBLE_REACH[0] + Math.random() * (SHAMBLE_REACH[1] - SHAMBLE_REACH[0]);
      const to = { tx: Math.floor(this.x + Math.cos(angle) * reach), ty: Math.floor(this.y + Math.sin(angle) * reach) };
      if (to.tx <= 0 || to.ty <= 0 || to.tx >= world.map.width - 1 || to.ty >= world.map.height - 1 || !open(to.tx, to.ty) || isTrap(world.map.get(to.tx, to.ty))) {
        continue;
      }
      const score = lured ? heat[to.ty * world.map.width + to.tx] + Math.random() * 1e-3 : 0;
      if (score > best) {
        best = score;
        goal = to;
        if (!lured) {
          break;
        }
      }
    }
    if (!goal || (goal.tx === here.tx && goal.ty === here.ty)) {
      return [];
    }
    const target = goal;
    return findPath({ width: world.map.width, height: world.map.height, within: MONSTER_SEARCH,
      from: here,
      to: target,
      cost: (tx: number, ty: number, fx: number, fy: number): number => {
        const tile = world.map.get(tx, ty);
        if (!open(tx, ty) || isTrap(tile) || !world.map.canStep(fx, fy, tx, ty)) {
          return Infinity;
        }
        return tile === 'tree' ? 1 / MONSTER_TREE_SLOW : 1;
      },
      open,
      score: (tx: number, ty: number): number => Math.hypot(tx - target.tx, ty - target.ty),
    }) ?? [];
  }
}
