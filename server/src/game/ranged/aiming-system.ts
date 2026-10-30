// Packages
import { AIM_ASSIST } from '@halloween/shared/gear/ranged-rules';

// Local Imports
import { GameSystem } from '../core/game-system';
import { LOCK_CONE } from './config/ranged';

// Types
import type { Player } from '../players/player';

/**
 * Pointing ranged weapons at monsters: a crossbow's lock-on and the aim
 * assist every shot gets.
 */
export class AimingSystem extends GameSystem {
  /**
   * The monster a crossbow locks onto: the nearest within `reach` inside
   * LOCK_CONE of where the player points, else the nearest within `reach`
   * at all. Null when there's none.
   * @param p The player.
   * @param reach How far it looks (tiles).
   * @returns The monster's id, or null.
   */
  lockOn(p: Player, reach: number): number | null {
    let ahead: { id: number; d: number } | null = null;
    let any: { id: number; d: number } | null = null;
    for (const m of this.horde.targets()) {
      const d = Math.hypot(m.x - p.x, m.y - p.y);
      if (d > reach) {
        continue;
      }
      const angle = Math.atan2(m.y - p.y, m.x - p.x);
      const off = Math.abs(Math.atan2(Math.sin(angle - p.facing), Math.cos(angle - p.facing)));
      if (off <= LOCK_CONE && (!ahead || d < ahead.d)) {
        ahead = { id: m.id, d };
      }
      if (!any || d < any.d) {
        any = { id: m.id, d };
      }
    }
    return (ahead ?? any)?.id ?? null;
  }

  /**
   * A crossbow taking aim: it keeps turning to its target (locking on to
   * another if that one's gone) and fires once the aim time is up.
   * @param p The player.
   */
  takeAim(p: Player): void {
    const weapon = p.weapon();
    if (!weapon.sight || p.dead || p.blocking) {
      p.aimUntil = null;
      p.aimTarget = null;
      return;
    }
    let target = this.horde.targets().find((m): boolean => m.id === p.aimTarget);
    if (!target) {
      p.aimTarget = this.lockOn(p, weapon.reach);
      target = this.horde.targets().find((m): boolean => m.id === p.aimTarget);
    }
    if (target) {
      p.facing = Math.atan2(target.y - p.y, target.x - p.x);
    }
    if (this.world.time < p.aimUntil!) {
      return;
    }
    p.aimUntil = null;
    p.aimTarget = null;
    p.nextActionAt = this.world.time + weapon.cooldown;
    p.swings++;
    this._game.ranged.shoot(p, weapon, weapon.damage, target ? p.facing : undefined);
    this._game.ranged.spend(p, weapon);
  }

  /**
   * Bends a shot toward the monster closest to straight ahead within
   * AIM_ASSIST and `reach`, if any.
   * @param p The player.
   * @param reach How far it looks (tiles).
   * @returns The angle to fire at (radians).
   */
  aim(p: Player, reach: number): number {
    let best = p.facing;
    let bestOff = AIM_ASSIST;
    for (const m of this.horde.targets()) {
      const d = Math.hypot(m.x - p.x, m.y - p.y);
      if (d > reach || d < 0.3) {
        continue;
      }
      const angle = Math.atan2(m.y - p.y, m.x - p.x);
      const off = Math.abs(Math.atan2(Math.sin(angle - p.facing), Math.cos(angle - p.facing)));
      if (off < bestOff) {
        best = angle;
        bestOff = off;
      }
    }
    return best;
  }
}
