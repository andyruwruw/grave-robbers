// Packages
import {
  NECRO_BOLT_SPEED,
  NECRO_MINIONS,
  NECRO_NOVA_DAMAGE,
  NECRO_NOVA_EVERY,
  NECRO_NOVA_KNOCKBACK,
  NECRO_NOVA_RADIUS,
  NECRO_NOVA_WINDUP,
  NECRO_RAISE,
  NECRO_RAISE_SPREAD,
  NECRO_WARD_RADIUS,
} from '@halloween/shared/monsters/kinds/necromancer';

// Local Imports
import { monsterBlocked, monsterWalkable } from '../../helpers/terrain';
import { Kiter } from '../kiter';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A necromancer: keeps its distance, wards the monsters around it, and
 * raises skeletons out of the ground (or, with enough of them up, throws
 * a soul bolt). Anyone who gets close is blasted back by its nova.
 */
export class Necromancer<P extends Target> extends Kiter<P> {
  /**
   * The skeletons it raised that are still up.
   */
  private _minions: number[] = [];

  /**
   * When its winding nova goes off, or null when none is winding up.
   */
  private _novaAt: number | null = null;

  /**
   * When it can start its next nova.
   */
  private _nextNova = 0;

  /**
   * Wards the monsters around it, then hunts like any shooter.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected act(dt: number, world: World, present: P[], prey: P[]): void {
    for (const m of this._ctx.roster.values()) {
      if (m !== this && m.hasBody && Math.hypot(m.x - this.x, m.y - this.y) <= NECRO_WARD_RADIUS) {
        m.warded = true;
      }
    }
    if (this.nova(world, prey)) {
      return;
    }
    super.act(dt, world, present, prey);
  }

  /**
   * Its close-range nova: starts glowing once a player is within
   * NECRO_NOVA_RADIUS, holds still while it winds up, then hurts and
   * throws back everyone that close.
   * @param world The world.
   * @param prey Players monsters may go after.
   * @returns Whether the nova took this tick.
   */
  private nova(world: World, prey: P[]): boolean {
    const near = (p: P): boolean => Math.hypot(p.x - this.x, p.y - this.y) <= NECRO_NOVA_RADIUS;
    if (this._novaAt === null) {
      if (world.time < this._nextNova || !prey.some(near)) {
        return false;
      }
      this._novaAt = world.time + NECRO_NOVA_WINDUP;
      this._nextNova = this._novaAt + NECRO_NOVA_EVERY;
      this.swipes++;
      this._ctx.hooks.event({ t: 'raise', x: this.x, y: this.y });
    }
    this.moving = false;
    if (world.time >= this._novaAt) {
      this._novaAt = null;
      this._ctx.hooks.event({ t: 'raise', x: this.x, y: this.y });
      for (const p of prey.filter(near)) {
        this.thorns(this._ctx.hooks.hurt(p, NECRO_NOVA_DAMAGE * this.power, this.def.label, this.x, this.y, NECRO_NOVA_KNOCKBACK), p, world);
      }
    }
    return true;
  }

  /**
   * A stun or stagger also stops a winding nova.
   */
  protected cancelStrike(): void {
    super.cancelStrike();
    this._novaAt = null;
  }

  /**
   * Its cast: skeletons come up around it while it has room for more,
   * else a soul bolt flies along its aim.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    this._minions = this._minions.filter((id: number): boolean => this._ctx.roster.has(id));
    const room = Math.min(NECRO_RAISE, NECRO_MINIONS - this._minions.length);
    if (room <= 0) {
      const def = this.def;
      this._ctx.hooks.shoot(this.x, this.y, this.facing, { kind: 'ecto', damage: this.blow(), speed: NECRO_BOLT_SPEED, reach: def.range! + 1, by: def.label });
      return;
    }
    const walkable = monsterWalkable(world);
    for (let tries = 0, raised = 0; tries < 16 && raised < room; tries++) {
      const angle = Math.random() * Math.PI * 2;
      const d = 1 + Math.random() * (NECRO_RAISE_SPREAD - 1);
      const x = this.x + Math.cos(angle) * d;
      const y = this.y + Math.sin(angle) * d;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (!world.map.inBounds(tx, ty) || !walkable(tx, ty) || monsterBlocked(world, this)(tx, ty)) {
        continue;
      }
      const id = this._ctx.raise('skeleton', x, y);
      if (id !== null) {
        this._ctx.hooks.event({ t: 'raise', x, y });
        this._minions.push(id);
        raised++;
      }
    }
  }
}
