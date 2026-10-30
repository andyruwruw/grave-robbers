// Packages
import { STATION_REACH } from '@halloween/shared/structures/stations';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';

// Local Imports
import { TickingFeature } from './ticking-feature';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { ReadyTurret, StructureState } from '../../types/structures';

/**
 * Turrets' ammo and cooldowns: loading them by hand or from nearby piles,
 * and which are ready to act. Firing itself is combat's job.
 */
export class TurretAmmo extends TickingFeature {
  /**
   * Arms a turret that takes ammo from piles in reach.
   * @param tx The turret's tile column.
   * @param ty The turret's tile row.
   * @param s The turret's state.
   * @param _dt Seconds since the last step.
   */
  tick(tx: number, ty: number, s: StructureState, _dt: number): void {
    const turret = TURRETS[this.map.get(tx, ty) as StructureKind]!;
    this.arm(tx, ty, s, turret.ammo!, turret.shots, turret.most);
  }

  /**
   * Loads a turret with one ammo's worth of shots. Returns false if it
   * isn't a turret that takes ammo, or it's too full for a whole load.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether it was loaded.
   */
  load(tx: number, ty: number): boolean {
    const s = this.structures.get(ty * this.map.width + tx);
    const kind = this.map.get(tx, ty);
    const def = isStructure(kind) ? TURRETS[kind] : undefined;
    if (!s || !def?.ammo || (s.ammo ?? 0) + def.shots > def.most) {
      return false;
    }
    s.ammo = (s.ammo ?? 0) + def.shots;
    return true;
  }

  /**
   * Every turret ready to act (loaded, if it takes ammo, and cooled
   * down): where it is, what it is, its builder's level, and a callback
   * that spends a shot and sets when it may act again.
   * @returns The ready turrets, in build order.
   */
  readyTurrets(): ReadyTurret[] {
    const ready: ReadyTurret[] = [];
    for (const [i, s] of this.structures.entries()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      const kind = this.map.get(tx, ty);
      const def = isStructure(kind) ? TURRETS[kind] : undefined;
      if (def && (!def.ammo || (s.ammo ?? 0) > 0) && this.clock.now >= (s.readyAt ?? 0)) {
        ready.push({
          tx,
          ty,
          kind: kind as StructureKind,
          level: s.level ?? 0,
          fire: (): void => {
            if (def.ammo) {
              s.ammo = (s.ammo ?? 1) - 1;
            }
            s.readyAt = this.clock.now + def.cooldown;
          },
        });
      }
    }
    return ready;
  }

  /**
   * Loads a turret from piles within STATION_REACH (one ammo at a time,
   * while a whole load still fits), so a belt can keep it fed.
   * @param tx The turret's tile column.
   * @param ty The turret's tile row.
   * @param s The turret's state.
   * @param ammo The goods it takes.
   * @param shots Shots one ammo gives.
   * @param most The most shots it holds.
   */
  private arm(tx: number, ty: number, s: StructureState, ammo: Goods, shots: number, most: number): void {
    for (const [id, item] of this.items.entries()) {
      if ((s.ammo ?? 0) + shots > most) {
        return;
      }
      if (item.held || item[ammo] <= 0 || Math.hypot(item.x - (tx + 0.5), item.y - (ty + 0.5)) > STATION_REACH) {
        continue;
      }
      const loads = Math.min(item[ammo], Math.floor((most - (s.ammo ?? 0)) / shots));
      item[ammo] -= loads;
      s.ammo = (s.ammo ?? 0) + loads * shots;
      this.items.dropIfEmpty(id, item);
    }
  }
}
