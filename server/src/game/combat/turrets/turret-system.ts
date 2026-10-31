// Packages
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';
import { turretDamage } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { GameSystem } from '../../core/game-system';
import { FlameTurretFire } from './flame-turret-fire';
import { ShotTurretFire } from './shot-turret-fire';
import { SweepTurretFire } from './sweep-turret-fire';

// Types
import type { TurretDef } from '@halloween/shared/structures/types/structures';
import type { TurretFire } from './turret-fire';

/**
 * Turrets acting on the monsters around them: picking a target, then
 * firing the way their kind does (a `TurretFire`).
 */
export class TurretSystem extends GameSystem {
  /**
   * What each kind of turret does once it fires.
   */
  private readonly _fires: Record<TurretDef['fires'], TurretFire> = {
    shot: new ShotTurretFire(this._game),
    sweep: new SweepTurretFire(this._game),
    flame: new FlameTurretFire(this._game),
  };

  /**
   * Every turret that's ready acts on the monsters in its range (see
   * `TURRETS`): shooters fire at the nearest, swipers cut everything
   * around them, flamethrowers burn everything in a cone toward the
   * nearest. Kills go to the nearest player, like a trap's. Risen allies
   * are left alone.
   */
  fireTurrets(): void {
    const monsters = this.horde.bodies().filter((m): boolean => !this.horde.afflictions.isAlly(m.id));
    for (const turret of this.world.turretAmmo.readyTurrets()) {
      const def = TURRETS[turret.kind]!;
      const x = turret.tx + 0.5;
      const y = turret.ty + 0.5;
      let target: { x: number; y: number } | null = null;
      let best = def.range;
      for (const m of monsters) {
        const d = Math.hypot(m.x - x, m.y - y);
        if (d < best) {
          best = d;
          target = m;
        }
      }
      if (!target) {
        continue;
      }
      turret.fire();
      const angle = Math.atan2(target.y - y, target.x - x);
      const damage = turretDamage(turret.kind, turret.level);
      const label = STRUCTURES[turret.kind].label;
      this.outbox.events.push({ t: 'turret', tx: turret.tx, ty: turret.ty, fires: def.fires, angle: Math.round(angle * 100) / 100 });
      this._fires[def.fires].fire(turret, def, x, y, angle, damage, label, monsters);
    }
  }
}
