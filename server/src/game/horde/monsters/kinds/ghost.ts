// Packages
import { GHOST_FORGET, GHOST_KEEP, GHOST_KNOCKBACK, GHOST_SCARE_TIME, GHOST_SHOT_COOLDOWN, GHOST_SHOT_DAMAGE, GHOST_SHOT_RANGE, GHOST_SHOT_REACH, GHOST_SHOT_SPEED, GHOST_SNUFF_TIME } from '@halloween/shared/monsters/kinds/ghost';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { GHOST_HOVER, WANDER_RANGE } from '../../config/ai';
import { distance } from '../../helpers/geometry';
import { Monster } from '../monster';

// Types
import type { World } from '../../../world/world';
import type { ActiveLight } from '../../../world/types/lights';
import type { HordeContext } from '../../horde-context';
import type { HitEffects, Target } from '../../types/hooks';
import type { MonsterInit } from '../../types/monster';

/**
 * A ghost: no body, meanders through walls to snuff burning lights unless
 * a player is standing in them, hangs around players it notices and
 * spits ectoplasm at them, and flees bells.
 */
export class Ghost<P extends Target> extends Monster<P> {
  /**
   * How long it has been draining the light it hovers over.
   */
  drainTime = 0;

  /**
   * Fleeing until then.
   */
  scaredUntil = 0;

  /**
   * What it flees from (tiles).
   */
  scaredFromX = 0;

  /**
   * What it flees from (tiles).
   */
  scaredFromY = 0;

  /**
   * When it picks a new spot to drift to.
   */
  wanderUntil = 0;

  /**
   * The spot it drifts to when idle (tiles).
   */
  wanderX: number;

  /**
   * The spot it drifts to when idle (tiles).
   */
  wanderY: number;

  /**
   * Makes the ghost from its rolls.
   * @param init Everything it's made with.
   * @param ctx What the horde's parts share.
   */
  constructor(init: MonsterInit, ctx: HordeContext<P>) {
    super(init, ctx);
    this.wanderX = init.x;
    this.wanderY = init.y;
  }

  /**
   * Ghosts have no body.
   * @returns False.
   */
  get hasBody(): boolean {
    return false;
  }

  /**
   * Ghosts don't bleed.
   * @returns False.
   */
  protected get bleeds(): boolean {
    return false;
  }

  /**
   * A hit pushes a ghost further, and gets it hunting.
   * @param knockback The knockback (tiles).
   * @param effects What the hit does besides damage.
   * @returns The knockback it takes.
   */
  protected adjustKnockback(knockback: number, effects: HitEffects<P>): number {
    this.hunting = true;
    return knockback * GHOST_KNOCKBACK;
  }

  /**
   * Drifts along a knockback through anything but a fence, kept on the
   * map.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True: a ghost is never lost to a knockback.
   */
  protected stepKnockback(dt: number, world: World): boolean {
    const x = Math.min(world.map.width - 0.5, Math.max(0.5, this.x + this.knock.x * dt));
    const y = Math.min(world.map.height - 0.5, Math.max(0.5, this.y + this.knock.y * dt));
    if (world.map.get(Math.floor(x), Math.floor(y)) === 'fence') {
      this.knock.until = 0;
    } else {
      this.x = x;
      this.y = y;
    }
    return true;
  }

  /**
   * Shoots at a player close by, flees bells and guarded lights, hangs
   * around a player it notices, else heads for the nearest burning light
   * to drain it, or wanders.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected act(dt: number, world: World, present: P[], prey: P[]): void {
    this.draining = false;
    const target = prey.reduce<{ p: P; d: number } | null>((best, p) => {
      const d = distance(this, p);
      return d < GHOST_SHOT_RANGE && (!best || d < best.d) ? { p, d } : best;
    }, null);
    const sight = this.hunting ? GHOST_FORGET : MONSTERS.ghost.sight;
    const quarry = prey.reduce<{ p: P; d: number } | null>((best, p) => {
      const d = distance(this, p);
      return d < sight && (!best || d < best.d) ? { p, d } : best;
    }, null);
    this.hunting = quarry !== null;
    if (target && world.time >= this.nextAttackAt) {
      this.shootAt(target.p, world);
    }
    const bells = world.lights.bells();
    if (this.fleeBells(bells, world)) {
      return;
    }
    if (world.time < this.scaredUntil) {
      const dx = this.x - this.scaredFromX;
      const dy = this.y - this.scaredFromY;
      const d = Math.hypot(dx, dy) || 1;
      this.drift(this.x + (dx / d), this.y + (dy / d), MONSTERS.ghost.speed * 1.5 * dt, world);
      return;
    }
    if (quarry) {
      this.stalk(quarry.p, quarry.d, dt, world);
      return;
    }
    this.haunt(bells, dt, world, present);
  }

  /**
   * Spits ectoplasm at a player.
   * @param p The player.
   * @param world The world.
   */
  private shootAt(p: P, world: World): void {
    this.nextAttackAt = world.time + GHOST_SHOT_COOLDOWN * (0.75 + Math.random() * 0.5);
    this.attacks++;
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    this._ctx.hooks.shoot(this.x, this.y, this.facing, { kind: 'ecto', damage: GHOST_SHOT_DAMAGE, speed: GHOST_SHOT_SPEED, reach: GHOST_SHOT_REACH, by: 'Ghost' });
  }

  /**
   * Inside a ringing bell's reach: it's pushed out to the edge and scared.
   * @param bells Every ringing bell.
   * @param world The world.
   * @returns True when a bell caught it.
   */
  private fleeBells(bells: { x: number; y: number; radius: number }[], world: World): boolean {
    for (const bell of bells) {
      const d = Math.hypot(this.x - bell.x, this.y - bell.y);
      if (d < bell.radius) {
        this.drainTime = 0;
        this.scaredUntil = world.time + GHOST_SCARE_TIME;
        this.scaredFromX = bell.x;
        this.scaredFromY = bell.y;
        if (d > 0) {
          this.x = bell.x + ((this.x - bell.x) / d) * bell.radius;
          this.y = bell.y + ((this.y - bell.y) / d) * bell.radius;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Hangs around a player it noticed, swaying, at GHOST_KEEP tiles.
   * @param p The player.
   * @param d How far off they are (tiles).
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private stalk(p: P, d: number, dt: number, world: World): void {
    this.drainTime = 0;
    const sway = Math.sin(world.time * 1.7 + this.id) * 1.4;
    const hold = d > 0 ? GHOST_KEEP / d : 0;
    const gx = p.x + (this.x - p.x) * hold;
    const gy = p.y + (this.y - p.y) * hold;
    if (Math.abs(d - GHOST_KEEP) > 0.4) {
      this.drift(gx - ((p.y - this.y) / (d || 1)) * sway, gy + ((p.x - this.x) / (d || 1)) * sway, MONSTERS.ghost.speed * (d > GHOST_KEEP ? 1.1 : 0.6) * dt, world);
    }
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
  }

  /**
   * Heads for the nearest burning light no bell guards and drains it
   * (unless a player stands in it), or wanders when there's none.
   * @param bells Every ringing bell.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   */
  private haunt(bells: { x: number; y: number; radius: number }[], dt: number, world: World, present: P[]): void {
    let light: ActiveLight | null = null;
    let best = Infinity;
    for (const l of this._ctx.light.lights) {
      const d = Math.hypot(l.tx + 0.5 - this.x, l.ty + 0.5 - this.y);
      if (l.structure && d < best && !bells.some((b): boolean => Math.hypot(l.tx + 0.5 - b.x, l.ty + 0.5 - b.y) < b.radius)) {
        best = d;
        light = l;
      }
    }
    if (!light) {
      this.wander(dt, world);
      return;
    }
    const lx = light.tx + 0.5;
    const ly = light.ty + 0.5;
    const guarded = present.some((p: P): boolean => Math.hypot(p.x - lx, p.y - ly) <= light.radius);
    if (best <= light.radius && guarded) {
      this.scaredUntil = world.time + GHOST_SCARE_TIME;
      this.scaredFromX = lx;
      this.scaredFromY = ly;
      this.drainTime = 0;
      return;
    }
    if (best > GHOST_HOVER) {
      this.drainTime = 0;
      const sway = best > 2 ? Math.sin(world.time * 1.3 + this.id) * 0.8 : 0;
      this.drift(lx - ((ly - this.y) / best) * sway, ly + ((lx - this.x) / best) * sway, MONSTERS.ghost.speed * dt, world);
      return;
    }
    this.draining = true;
    this.drainTime += dt;
    if (this.drainTime >= GHOST_SNUFF_TIME) {
      this.drainTime = 0;
      world.lights.snuff(light.tx, light.ty);
      this._ctx.hooks.event({ t: 'snuff', tx: light.tx, ty: light.ty });
    }
  }

  /**
   * Drifts toward a random point close by, picking a new one every few
   * seconds or once there.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private wander(dt: number, world: World): void {
    this.drainTime = 0;
    if (world.time >= this.wanderUntil || Math.hypot(this.wanderX - this.x, this.wanderY - this.y) < 0.2) {
      this.wanderUntil = world.time + 4 + Math.random() * 4;
      this.wanderX = Math.min(world.map.width - 1, Math.max(1, this.x + (Math.random() * 2 - 1) * WANDER_RANGE));
      this.wanderY = Math.min(world.map.height - 1, Math.max(1, this.y + (Math.random() * 2 - 1) * WANDER_RANGE));
    }
    const dx = this.wanderX - this.x;
    const dy = this.wanderY - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const sway = Math.sin(world.time * 1.3 + this.id) * 1.2;
    this.drift(this.wanderX - (dy / d) * sway, this.wanderY + (dx / d) * sway, MONSTERS.ghost.speed * 0.5 * dt, world);
  }

  /**
   * Ghost movement: straight through anything, kept on the map (drift only
   * runs inside the horde's step, so the map is the one its grids fit).
   * @param x Where to (tiles).
   * @param y Where to (tiles).
   * @param step How far (tiles).
   * @param world The world.
   */
  private drift(x: number, y: number, step: number, world: World): void {
    const dx = x - this.x;
    const dy = y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-4) {
      return;
    }
    const s = Math.min(step, d);
    this.facing = Math.atan2(dy, dx);
    this.moving = true;
    this.x = Math.min(world.map.width - 0.5, Math.max(0.5, this.x + (dx / d) * s));
    this.y = Math.min(world.map.height - 0.5, Math.max(0.5, this.y + (dy / d) * s));
  }
}
