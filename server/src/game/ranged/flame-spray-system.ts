// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import { stock } from '@halloween/shared/goods/goods';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';

// Local Imports
import { BOLT_HEIGHT } from '../config/shots';
import { GameSystem } from '../core/game-system';
import { SHOT_STEP, SPRAY_PULSE } from './config/ranged';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Player } from '../players/player';

/**
 * The Hellmouth's flamethrower (the weapon's `spray`): while Action is
 * held it pulses a cone of fire every SPRAY_PULSE instead of shooting.
 * The flame reaches the nearest `targets` monsters in the cone with a
 * clear line, the first at full `rate` and the ones behind it at
 * `falloff`, and sets them burning. Each monster's share goes through
 * `damageTo` a second at a time (so a ghost's at-least-1 counts per
 * second, not per pulse). It drinks one blood every `bloodEvery` seconds
 * of spraying, on its own clock.
 */
export class FlameSpraySystem extends GameSystem {
  /**
   * One pulse of flame, if there's blood to pay for it.
   * @param p The player.
   * @param weapon The weapon's stats.
   */
  pulse(p: Player, weapon: WeaponStats): void {
    const spray = weapon.spray!;
    const time = this.world.time;
    if (time >= p.sprayPaidUntil) {
      if (p.inventory.blood <= 0) {
        p.nextActionAt = time + weapon.cooldown;
        this.outbox.sound(p, 'error');
        return;
      }
      this._game.bag.pay(p, stock({ blood: 1 }));
      p.sprayPaidUntil = time + spray.bloodEvery;
      this.outbox.sound(p, 'shoot');
      this._game.damage.wear(p, 'weapon');
    }
    p.nextActionAt = time + SPRAY_PULSE;
    p.swings++;
    const angle = this._game.aiming.aim(p, spray.range);
    const height = this.world.map.elevationAt(p.x, p.y) + BOLT_HEIGHT;
    const burning = this.horde.targets()
      .map((m) => ({ m, d: Math.hypot(m.x - p.x, m.y - p.y) }))
      .filter(({ m, d }): boolean => {
        const off = Math.atan2(m.y - p.y, m.x - p.x) - angle;
        return d > 0 && d <= spray.range + MONSTER_RADIUS && Math.abs(Math.atan2(Math.sin(off), Math.cos(off))) <= spray.cone && this.clear(p.x, p.y, m.x, m.y, height);
      })
      .sort((a, b): number => a.d - b.d)
      .slice(0, spray.targets);
    this._game.spoils.killer = p;
    burning.forEach(({ m }, i): void => {
      const perSecond = damageTo(m.kind, weapon, spray.rate * (i === 0 ? 1 : spray.falloff));
      this.horde.hit(m.id, perSecond * SPRAY_PULSE, p.x, p.y, this.world, 0, { ...weapon, by: p });
    });
    this._game.spoils.killer = null;
    this.outbox.events.push({ t: 'flame-spray', x: p.x, y: p.y, angle, cone: spray.cone, range: spray.range });
  }

  /**
   * Whether flame gets from (x0, y0) to (x1, y1): no solid tile or ground
   * rising above `height` in between.
   * @param x0 From (tiles across).
   * @param y0 From (tiles down).
   * @param x1 To (tiles across).
   * @param y1 To (tiles down).
   * @param height How high the flame is.
   * @returns True when nothing's in the way.
   */
  private clear(x0: number, y0: number, x1: number, y1: number, height: number): boolean {
    const length = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.ceil(length / SHOT_STEP);
    for (let i = 1; i < steps; i++) {
      if (this._game.shots.blocked(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, height)) {
        return false;
      }
    }
    return true;
  }
}
