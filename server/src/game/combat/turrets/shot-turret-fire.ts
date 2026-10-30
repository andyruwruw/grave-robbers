// Packages
import { BOLT_SPEED } from '@halloween/shared/gear/ranged-rules';

// Local Imports
import { BOLT_HEIGHT } from '../../config/shots';
import { TurretFire } from './turret-fire';

// Types
import type { TurretDef } from '@halloween/shared/structures/types/structures';
import type { ReadyTurret } from '../../world/types/structures';

/**
 * A shooter (bolt turret, blood sentry, ballista): it looses a bolt or a
 * gob of blood at its target.
 */
export class ShotTurretFire extends TurretFire {
  /**
   * Puts the turret's shot in flight.
   * @param turret The turret.
   * @param def Its stats.
   * @param x Its tile's center (tiles across).
   * @param y Its tile's center (tiles down).
   * @param angle Toward its target (radians).
   * @param damage Its damage at its builder's level.
   * @param label Its name, for the kill feed.
   */
  fire(turret: ReadyTurret, def: TurretDef, x: number, y: number, angle: number, damage: number, label: string): void {
    this._game.shots.add({
      id: this._game.shots.nextId(),
      x: x + Math.cos(angle) * 0.55,
      y: y + Math.sin(angle) * 0.55,
      angle,
      kind: def.ammo === 'blood' ? 'blood' : 'bolt',
      left: def.range + 1,
      height: this.world.map.base(turret.tx, turret.ty) + BOLT_HEIGHT + 0.3,
      owner: null,
      damage,
      knockback: def.knockback,
      speed: BOLT_SPEED,
      weapon: def.ammo === 'blood' ? 'blood-gun' : 'crossbow',
      hostile: false,
      by: label,
      ...(def.pierce ? { pierce: def.pierce, struck: [] } : {}),
    });
  }
}
