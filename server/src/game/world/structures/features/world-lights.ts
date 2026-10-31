// Packages
import {
  GHOSTPROOF,
  LAMP_LIGHT,
  LIT,
  LOW_FUEL,
  PUMPKIN_LIGHT,
  WORKING_GLOW,
} from '@halloween/shared/structures/lights';
import { ALTAR_AWAKE_SECONDS } from '@halloween/shared/structures/occult';
import { STATIONS } from '@halloween/shared/structures/stations';
import { STRUCTURES, isStructure } from '@halloween/shared/structures/structure-catalog';
import { bellRadius, lightIntensity, lightRadius } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { EDITOR_LIGHT_FUEL } from '@halloween/shared/map-editor/map-edit';

// Local Imports
import { TickingFeature } from './ticking-feature';

// Types
import type { LightState } from '@halloween/shared/protocol/state/world-state';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { ActiveLight, Bell, Shine } from '../../types/lights';
import type { WorldSite } from '../../types/site';
import type { StructureState } from '../../types/structures';
import type { Step } from '../../../pathing/types/path';
import type { StructureQueries } from '../structure-queries';

/**
 * Every light on the map: built lights burning fuel, pumpkins and lamp
 * posts, glowing stations and altars, and silver bells.
 */
export class WorldLights extends TickingFeature {
  /**
   * Lights a blackout is putting out: tile index to when it goes out and
   * how long it sputters first.
   */
  private readonly _doomed = new Map<number, { at: number; sputter: number }>();

  /**
   * Every pumpkin and lamp post on `_spotsMap`, by tile index, kept up to
   * date as tiles change (`TileGrid.listen`) so `activeLights` never scans
   * the whole map.
   */
  private readonly _spots = new Set<number>();

  /**
   * The map `_spots` indexes (a new world brings a new map).
   */
  private _spotsMap: WorldMap | null = null;

  /**
   * Sets the lights up.
   * @param site What every part of the world shares.
   * @param _queries Where structures are and their builders' levels.
   */
  constructor(site: WorldSite, private readonly _queries: StructureQueries) {
    super(site);
  }

  /**
   * Burns a step's worth of fuel (anything that isn't a station).
   * @param _tx The structure's tile column.
   * @param _ty The structure's tile row.
   * @param s The structure's state.
   * @param dt Seconds since the last step.
   */
  tick(_tx: number, _ty: number, s: StructureState, dt: number): void {
    s.fuel = Math.max(0, s.fuel - dt);
  }

  /**
   * Keeps a burning light (torch, lantern, campfire) lit for good: what the
   * editor places, and what a preset starts with.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  eternal(tx: number, ty: number): void {
    const s = this.structures.get(ty * this.map.width + tx);
    const kind = this.map.get(tx, ty);
    if (s && isStructure(kind) && STRUCTURES[kind].light && !STATIONS[kind] && STRUCTURES[kind].light!.burn !== WORKING_GLOW) {
      s.fuel = EDITOR_LIGHT_FUEL;
    }
  }

  /**
   * Sets a light glowing for a while without counting it as burning fuel
   * (an altar after an offering).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param seconds How long it glows at least.
   */
  kindle(tx: number, ty: number, seconds: number): void {
    const s = this.structures.get(ty * this.map.width + tx);
    if (s) {
      s.fuel = Math.max(s.fuel, seconds);
    }
  }

  /**
   * Relights a light a ghost snuffed (free; lights never burn down).
   * Returns false if it's still lit or isn't a light.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether it was relit.
   */
  relight(tx: number, ty: number): boolean {
    const tile = this.map.get(tx, ty);
    const s = this.structures.get(ty * this.map.width + tx);
    if (!isStructure(tile) || STRUCTURES[tile].light?.burn !== Infinity || !s || s.fuel > 0) {
      return false;
    }
    s.fuel = LIT;
    return true;
  }

  /**
   * Puts out a burning light (a ghost got to it).
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  snuff(tx: number, ty: number): void {
    const s = this.structures.get(ty * this.map.width + tx);
    if (s) {
      s.fuel = 0;
    }
  }

  /**
   * A world event's blackout: every burning light a ghost could snuff
   * (and Action relight) goes out at its own moment within `within`
   * seconds, sputtering for `sputter` seconds first.
   * @param within Seconds over which they all go out.
   * @param sputter Seconds each sputters first.
   */
  blackout(within: number, sputter: number): void {
    for (const [i, s] of this.structures.entries()) {
      const tile = this.map.get(i % this.map.width, Math.floor(i / this.map.width));
      if (s.fuel > 0 && isStructure(tile) && STRUCTURES[tile].light?.burn === Infinity && !GHOSTPROOF.has(tile)) {
        this._doomed.set(i, { at: this.clock.now + sputter + Math.random() * within, sputter });
      }
    }
  }

  /**
   * Puts out the blackout's lights whose moment has come (skipping any
   * already out or torn down).
   * @returns The tiles that went out.
   */
  stepBlackout(): Step[] {
    const out: Step[] = [];
    for (const [i, { at }] of this._doomed) {
      if (this.clock.now < at) {
        continue;
      }
      this._doomed.delete(i);
      const s = this.structures.get(i);
      if (s && s.fuel > 0) {
        s.fuel = 0;
        out.push({ tx: i % this.map.width, ty: Math.floor(i / this.map.width) });
      }
    }
    return out;
  }

  /**
   * Every silver bell: its middle and how close ghosts may come.
   * @returns The bells.
   */
  bells(): Bell[] {
    return this._queries.structuresOf('bell').map(({ tx, ty }): Bell => ({ x: tx + 0.5, y: ty + 0.5, radius: bellRadius(this._queries.level(tx, ty)) }));
  }

  /**
   * The best level among burning campfires (soul fires, blood fountains)
   * whose tile center is within `radius` of (x, y).
   * @param x Where across, in tiles.
   * @param y Where down, in tiles.
   * @param radius How far to look, in tiles.
   * @returns The level, or null when none is that close.
   */
  litCampfireLevel(x: number, y: number, radius: number): number | null {
    let best: number | null = null;
    for (const [i, s] of this.structures.entries()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      const tile = this.map.get(tx, ty);
      if (s.fuel > 0 && (tile === 'campfire' || tile === 'soul-fire' || tile === 'blood-fountain') && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= radius) {
        best = Math.max(best ?? 0, s.level ?? 0);
      }
    }
    return best;
  }

  /**
   * Every light that's on: pumpkins and lamp posts always, built lights
   * while they have fuel (shrinking as it runs low, like on the TV).
   * @returns The lights, for monsters.
   */
  activeLights(): ActiveLight[] {
    const lights: ActiveLight[] = [];
    for (const i of this.lightSpots()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      lights.push({ tx, ty, radius: (this.map.get(tx, ty) === 'lamp' ? LAMP_LIGHT : PUMPKIN_LIGHT).radius, structure: false });
    }
    for (const [i, s] of this.structures.entries()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      const tile = this.map.get(tx, ty);
      const light = isStructure(tile) ? STRUCTURES[tile].light : undefined;
      if (light && s.fuel > 0) {
        lights.push({ tx, ty, radius: this.shine(tile as StructureKind, s).radius, structure: s.queue === undefined && !GHOSTPROOF.has(tile as StructureKind) });
      }
    }
    return lights;
  }

  /**
   * Every pumpkin and lamp post's tile index: found once per map, then
   * kept up to date as tiles change.
   * @returns The indexes.
   */
  private lightSpots(): Set<number> {
    const map = this.map;
    if (this._spotsMap !== map) {
      this._spotsMap = map;
      this._spots.clear();
      for (let i = 0; i < map.size; i++) {
        const tile = map.get(i % map.width, Math.floor(i / map.width));
        if (tile === 'pumpkin' || tile === 'lamp') {
          this._spots.add(i);
        }
      }
      map.listen((i: number, tile: Tile): void => {
        if (this._spotsMap !== map) {
          return;
        }
        if (tile === 'pumpkin' || tile === 'lamp') {
          this._spots.add(i);
        } else {
          this._spots.delete(i);
        }
      });
    }
    return this._spots;
  }

  /**
   * Every lit light and glowing station, with how far and bright it
   * shines.
   * @returns The lights, for the TV.
   */
  lightStates(): LightState[] {
    const lights: LightState[] = [];
    for (const [i, s] of this.structures.entries()) {
      const tile = this.map.get(i % this.map.width, Math.floor(i / this.map.width));
      if (s.fuel > 0 && isStructure(tile) && STRUCTURES[tile].light) {
        const { radius, intensity } = this.shine(tile, s);
        const doom = this._doomed.get(i);
        const dying = doom ? (doom.at - this.clock.now) / doom.sputter : Infinity;
        lights.push({ i, fuel: Math.round(Math.min(s.fuel, tile === 'altar' ? ALTAR_AWAKE_SECONDS : LOW_FUEL) * 10) / 10, radius: Math.round(radius * 100) / 100, intensity: Math.round(intensity * 100) / 100, ...(dying <= 1 ? { dying: Math.max(0, Math.round(dying * 100) / 100) } : {}) });
      }
    }
    return lights;
  }

  /**
   * How far and how bright a built light shines: lights by their
   * builder's level (see `lightRadius`), glowing stations and altars
   * shrinking as their glow runs out.
   * @param kind The kind of structure.
   * @param s Its state.
   * @returns Its radius and intensity.
   */
  private shine(kind: StructureKind, s: StructureState): Shine {
    const light = STRUCTURES[kind].light!;
    if (light.burn === Infinity) {
      return { radius: lightRadius(light.radius, s.level ?? 0), intensity: lightIntensity(light.intensity, s.level ?? 0) };
    }
    return { radius: light.radius * (0.5 + 0.5 * Math.min(1, s.fuel / LOW_FUEL)), intensity: light.intensity ?? 1 };
  }
}
