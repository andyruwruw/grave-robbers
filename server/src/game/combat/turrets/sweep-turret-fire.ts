// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';

// Local Imports
import { TurretFire } from './turret-fire';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { TurretDef } from '@halloween/shared/structures/types/structures';
import type { ReadyTurret } from '../../world/types/structures';

/**
 * A swiper: it cuts every monster in its range at once.
 */
export class SweepTurretFire extends TurretFire {
  /**
   * Hits every monster in range that `inReach` lets through.
   * @param turret The turret.
   * @param def Its stats.
   * @param x Its tile's center (tiles across).
   * @param y Its tile's center (tiles down).
   * @param angle Toward its target (radians).
   * @param damage Its damage at its builder's level.
   * @param label Its name, for the kill feed.
   * @param monsters Every monster with a body.
   */
  fire(turret: ReadyTurret, def: TurretDef, x: number, y: number, angle: number, damage: number, label: string, monsters: { id: number; kind: MonsterKind; x: number; y: number }[]): void {
    const stats: WeaponStats = { damage, cooldown: def.cooldown, reach: def.range, arcCos: -1, knockback: def.knockback };
    for (const m of monsters) {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d <= def.range && this.inReach(m, x, y, angle, def)) {
        this.horde.hit(m.id, damageTo(m.kind, stats, damage), x, y, this.world, def.knockback, def.burn ? { bleed: def.burn } : {});
      }
    }
  }

  /**
   * Whether a monster in range gets hit: always, for a swiper.
   * @param m The monster.
   * @param x The turret's tile center (tiles across).
   * @param y The turret's tile center (tiles down).
   * @param angle Toward its target (radians).
   * @param def Its stats.
   * @returns True if it's hit.
   */
  protected inReach(m: { x: number; y: number }, x: number, y: number, angle: number, def: TurretDef): boolean {
    return true;
  }
}
