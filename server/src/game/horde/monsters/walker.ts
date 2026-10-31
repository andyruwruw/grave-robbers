// Packages
import { MONSTER_RADIUS, MONSTER_TREE_SLOW } from '@halloween/shared/monsters/movement';
import { ZOMBIE_WALL_DAMAGE } from '@halloween/shared/monsters/kinds/zombie';
import { FALL_DAMAGE, FALL_MIN } from '@halloween/shared/players/health';
import { PALISADE_THORNS } from '@halloween/shared/structures/traps';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';
import { moveWithCollision } from '@halloween/shared/world/collision';
import { inTrunk } from '@halloween/shared/world/trees';

// Local Imports
import { CHASE_BUDGET, FAILED_REPATH, LOST_BUDGET, WAYPOINT_REACHED } from '../config/ai';
import { STONY } from '../config/tiles';
import { tileOf } from '../helpers/geometry';
import { monsterBlocked } from '../helpers/terrain';
import { Monster } from './monster';

// Types
import type { Step } from '../../pathing/types/path';
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';

/**
 * A monster with a body that walks: it follows paths, collides with
 * walls, chews through structures in its way, and remembers where it last
 * saw someone.
 */
export abstract class Walker<P extends Target> extends Monster<P> {
  /**
   * The path it's following, next tile first.
   */
  path: Step[] = [];

  /**
   * When it may search for a new path.
   */
  repathAt = 0;

  /**
   * When its current pause or wander leg ends.
   */
  wanderUntil = 0;

  /**
   * Pausing between wander legs.
   */
  wanderIdle = false;

  /**
   * Whether a knockback drop down a level hurts it.
   * @returns False unless it's a vampire.
   */
  protected get takesFallDamage(): boolean {
    return false;
  }

  /**
   * How hard it bites a structure.
   * @returns The damage per bite.
   */
  protected get wallDamage(): number {
    return ZOMBIE_WALL_DAMAGE;
  }

  /**
   * Moves it along a knockback with wall collision; a knockback can carry
   * it into a chasm (it's gone) or down a level.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns False if it's gone.
   */
  protected stepKnockback(dt: number, world: World): boolean {
    const before = world.map.elevationAt(this.x, this.y);
    Object.assign(this, moveWithCollision(monsterBlocked(world, this, false, true), this.x, this.y, this.knock.x * dt, this.knock.y * dt, MONSTER_RADIUS));
    if (world.map.get(Math.floor(this.x), Math.floor(this.y)) === 'chasm') {
      this._ctx.roster.delete(this.id);
      return false;
    }
    const drop = before - world.map.elevationAt(this.x, this.y);
    if (this.takesFallDamage && drop >= FALL_MIN) {
      this.hp -= FALL_DAMAGE * Math.round(drop / LEVEL_HEIGHT) * this._ctx.dealt;
      this.hurts++;
      if (this.hp <= 0) {
        this._ctx.kill(this, Math.atan2(this.knock.y, this.knock.x));
        return false;
      }
    }
    return true;
  }

  /**
   * A stun took hold: it drops its attack and its path.
   */
  protected onStunned(): void {
    super.onStunned();
    this.path = [];
  }

  /**
   * Puts it somewhere by hand, forgetting its path.
   * @param x Where (tiles).
   * @param y Where (tiles).
   */
  teleport(x: number, y: number): void {
    super.teleport(x, y);
    this.path = [];
    this.repathAt = 0;
  }

  /**
   * Moves it by (dx, dy) with wall collision, when a player bumps it.
   * @param dx How far across (tiles).
   * @param dy How far down (tiles).
   * @param world The world.
   */
  shove(dx: number, dy: number, world: World): void {
    Object.assign(this, moveWithCollision(monsterBlocked(world, this), this.x, this.y, dx, dy, MONSTER_RADIUS));
  }

  /**
   * Walks toward (x, y) by up to `step`, slowed in trees, on barbed wire
   * and near effigies, scaled by world events.
   * @param x Where to (tiles).
   * @param y Where to (tiles).
   * @param step How far (tiles).
   * @param world The world.
   * @param noDrop Never step down somewhere it couldn't climb back from.
   */
  protected moveToward(x: number, y: number, step: number, world: World, noDrop = false): void {
    const dx = x - this.x;
    const dy = y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-4) {
      return;
    }
    const s = Math.min(step * this._ctx.mods.monsterSpeed * (inTrunk(world.map, this.x, this.y) ? MONSTER_TREE_SLOW : 1) * this._ctx.wards.drag(this, world) * this.slowFactor(world.time), d);
    this.facing = Math.atan2(dy, dx);
    this.moving = true;
    Object.assign(this, moveWithCollision(monsterBlocked(world, this, noDrop), this.x, this.y, (dx / d) * s, (dy / d) * s, MONSTER_RADIUS));
  }

  /**
   * Drops path tiles it has already reached.
   */
  protected skipReached(): void {
    while (this.path.length > 0 && Math.hypot(this.path[0].tx + 0.5 - this.x, this.path[0].ty + 0.5 - this.y) < WAYPOINT_REACHED) {
      this.path.shift();
    }
  }

  /**
   * Bites the structure on `tile`, or shuffles up to it first.
   * @param tile The structure's tile.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  protected chew(tile: Step, dt: number, world: World): void {
    const cx = tile.tx + 0.5;
    const cy = tile.ty + 0.5;
    this.facing = Math.atan2(cy - this.y, cx - this.x);
    if (Math.hypot(cx - this.x, cy - this.y) > 1.25) {
      this.moveToward(cx, cy, this.def.speed * dt, world);
      return;
    }
    if (world.time < this.nextAttackAt || world.structureQueries.hp(tile.tx, tile.ty) === null) {
      return;
    }
    const tileKind = world.map.get(tile.tx, tile.ty);
    world.structureDamage.damage(tile.tx, tile.ty, this.wallDamage);
    this.attacks++;
    this.nextAttackAt = world.time + this.def.cooldown;
    this._ctx.hooks.event({ t: 'chips', tx: tile.tx, ty: tile.ty, chip: STONY.has(tileKind) ? 'stone' : 'wood', health: world.resources.health(tile.tx, tile.ty) });
    if (tileKind === 'palisade') {
      this.hp -= PALISADE_THORNS * this._ctx.dealt;
      this.hurts++;
      if (this.hp <= 0) {
        this._ctx.kill(this, this.facing + Math.PI);
        return;
      }
    }
    if (world.structureQueries.hp(tile.tx, tile.ty) === null) {
      this.repathAt = 0;
    }
  }

  /**
   * Switching between hunting and wandering drops the old path.
   * @param hunting Whether it's after someone now.
   */
  protected setHunting(hunting: boolean): void {
    if (this.hunting !== hunting) {
      this.hunting = hunting;
      this.path = [];
      this.repathAt = 0;
      this.wanderUntil = 0;
    }
  }

  /**
   * Where it last saw (or was hit by) someone, while it still remembers.
   * @param world The world.
   * @returns That tile, or null once forgotten.
   */
  protected remembered(world: World): Step | null {
    return world.time - this.lastSeen.at <= this.def.memory ? tileOf({ x: this.lastSeen.x, y: this.lastSeen.y }) : null;
  }

  /**
   * Reached the last place it saw someone and found nobody: forgets them
   * and looks around for a moment before wandering off.
   * @param world The world.
   */
  protected giveUp(world: World): void {
    this.lastSeen.at = -Infinity;
    this.wanderIdle = true;
    this.wanderUntil = world.time + 1.5 + Math.random() * 2;
    this.facing += (Math.random() - 0.5) * 2.5;
  }

  /**
   * How many tiles a chase's path search may look at: plenty when the
   * goal can be reached from here, barely any when it surely can't (see
   * `ReachMap`), just enough to head toward it.
   * @param goal Where it's chasing.
   * @param world The world.
   * @returns The search budget.
   */
  protected chaseBudget(goal: Step, world: World): number {
    return this._ctx.reach.reaches(goal, tileOf(this), world) ? CHASE_BUDGET : LOST_BUDGET;
  }

  /**
   * After a chase's search: when the path stops short of a goal that
   * can't be reached from here at all (see `ReachMap`), waits FAILED_REPATH
   * seconds before searching again instead of the usual moment, since
   * nothing will have changed. A path cut short for any other reason (a
   * vampire stopping at the light's edge) re-plans as usual.
   * @param goal Where it's chasing.
   * @param world The world.
   */
  protected backOffIfShort(goal: Step, world: World): void {
    const end = this.path.at(-1) ?? tileOf(this);
    if ((end.tx !== goal.tx || end.ty !== goal.ty) && !this._ctx.reach.reaches(goal, tileOf(this), world)) {
      this.repathAt = world.time + FAILED_REPATH * (0.8 + Math.random() * 0.4);
    }
  }
}
