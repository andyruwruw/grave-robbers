// Local Imports
import { SweepTurretFire } from './sweep-turret-fire';

// Types
import type { TurretDef } from '@halloween/shared/structures/types/structures';

/**
 * A flamethrower: like a swiper, but only the monsters in a cone toward
 * its target burn.
 */
export class FlameTurretFire extends SweepTurretFire {
  /**
   * Whether a monster in range is inside the cone toward the target.
   * @param m The monster.
   * @param x The turret's tile center (tiles across).
   * @param y The turret's tile center (tiles down).
   * @param angle Toward its target (radians).
   * @param def Its stats, with the cone's half-width.
   * @returns True if it burns.
   */
  protected inReach(m: { x: number; y: number }, x: number, y: number, angle: number, def: TurretDef): boolean {
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(m.y - y, m.x - x) - angle), Math.cos(Math.atan2(m.y - y, m.x - x) - angle)));
    return off <= def.cone!;
  }
}
