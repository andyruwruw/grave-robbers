// Packages
import { TURRETS } from '@halloween/shared/structures/turrets';

// Local Imports
import { WorldFeature } from '../world-feature';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { WorldSite } from '../types/site';
import type { Diggers } from './features/diggers';
import type { Stations } from './features/stations';
import type { TurretAmmo } from './features/turret-ammo';
import type { WorldLights } from './features/world-lights';

/**
 * Steps every built structure once, in build order, handing each to the
 * feature its state's shape belongs to.
 */
export class StructureTicker extends WorldFeature {
  /**
   * Sets the ticker up.
   * @param site What every part of the world shares.
   * @param _diggers Bone diggers.
   * @param _turretAmmo Turrets that arm themselves from piles.
   * @param _lights Everything that burns fuel.
   * @param _stations Crafting stations.
   */
  constructor(
    site: WorldSite,
    private readonly _diggers: Diggers,
    private readonly _turretAmmo: TurretAmmo,
    private readonly _lights: WorldLights,
    private readonly _stations: Stations,
  ) {
    super(site);
  }

  /**
   * One pass over the structures: diggers dig, turrets arm then burn,
   * anything else that isn't a station burns fuel, and stations work.
   * @param dt Seconds since the last step.
   */
  step(dt: number): void {
    for (const [i, s] of this.structures.entries()) {
      if (s.progress !== undefined && s.queue === undefined) {
        this._diggers.tick(i % this.map.width, Math.floor(i / this.map.width), s, dt);
        continue;
      }
      if (s.queue === undefined) {
        const turret = s.ammo !== undefined ? TURRETS[this.map.get(i % this.map.width, Math.floor(i / this.map.width)) as StructureKind] : undefined;
        if (turret?.ammo) {
          this._turretAmmo.tick(i % this.map.width, Math.floor(i / this.map.width), s, dt);
        }
        this._lights.tick(i % this.map.width, Math.floor(i / this.map.width), s, dt);
        continue;
      }
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      this._stations.tick(tx, ty, s, dt);
    }
  }
}
