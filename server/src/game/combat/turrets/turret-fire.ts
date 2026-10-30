// Local Imports
import { GameSystem } from '../../core/game-system';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { TurretDef } from '@halloween/shared/structures/types/structures';
import type { ReadyTurret } from '../../world/types/structures';

/**
 * What one kind of turret does once it fires at its target (see
 * `TurretDef.fires`).
 */
export abstract class TurretFire extends GameSystem {
  /**
   * Fires a turret that has a target.
   * @param turret The turret.
   * @param def Its stats.
   * @param x Its tile's center (tiles across).
   * @param y Its tile's center (tiles down).
   * @param angle Toward its target (radians).
   * @param damage Its damage at its builder's level.
   * @param label Its name, for the kill feed.
   * @param monsters Every monster with a body.
   */
  abstract fire(turret: ReadyTurret, def: TurretDef, x: number, y: number, angle: number, damage: number, label: string, monsters: { id: number; kind: MonsterKind; x: number; y: number }[]): void;
}
