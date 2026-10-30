// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import { LIT } from '@halloween/shared/structures/lights';
import { STRUCTURES, isStructure } from '@halloween/shared/structures/structure-catalog';
import { RAMP_DIRS } from '@halloween/shared/world/ramps';
import { WorldMap } from '@halloween/shared/world/world-map';
import { unpackBlends } from '@halloween/shared/map-editor/blend/blend-areas';

// Local Imports
import { generateWorld } from '../world-gen/generate-world';
import { generateHugeWorld } from '../world-gen/generate-huge-world';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { MapPreset, WorldSave } from '../storage/types/save';
import type { GroundItems } from './items/ground-items';
import type { WorldLights } from './structures/features/world-lights';
import type { StructureStore } from './structures/structure-store';
import type { OpenedMap } from './types/setup';

/**
 * Opens the map a world starts on: the save's if it decodes, else the
 * preset's if given (and it fits), else a newly generated one.
 * @param save The save to load, or null.
 * @param preset The preset to start from, or null.
 * @param gen The generator knobs, for a generated map.
 * @returns The map and what goes with it.
 */
export function openMap(save: WorldSave | null, preset: MapPreset | null, gen?: MapGenSettings): OpenedMap {
  const loaded = save ? WorldMap.decode(save.tiles, save.levels, save.ramps, save.width) : null;
  if (save && loaded) {
    return { seed: save.seed, map: loaded, time: save.time, view: save.view ?? null, quiet: save.quiet ?? false, blends: unpackBlends(save.blends), save };
  }
  const fromPreset = preset ? WorldMap.decode(preset.tiles, preset.levels, preset.ramps, preset.width) : null;
  const seed = fromPreset ? preset!.seed : Math.floor(Math.random() * 2 ** 31);
  const map = fromPreset ?? (gen?.size === 'huge' ? generateHugeWorld(seed, gen) : generateWorld(seed, gen));
  return {
    seed,
    map,
    time: 0,
    view: fromPreset ? preset!.view ?? null : null,
    quiet: fromPreset ? preset!.quiet ?? false : false,
    blends: unpackBlends(fromPreset ? preset!.blends : undefined),
    save: null,
  };
}

/**
 * Brings a saved world's lights and ground items back: lights that never
 * burn down are lit again, and every saved item goes back on the ground.
 * @param map The world's map.
 * @param structures The world's structures, already loaded from the save.
 * @param items The world's (empty) ground.
 * @param save The save.
 */
export function restoreSave(map: WorldMap, structures: StructureStore, items: GroundItems, save: WorldSave): void {
  for (const [i, s] of structures.entries()) {
    const tile = map.get(i % map.width, Math.floor(i / map.width));
    if (s.fuel > 0 && isStructure(tile) && STRUCTURES[tile].light?.burn === Infinity) {
      s.fuel = LIT;
    }
  }
  for (const item of save.items) {
    if (item.held) {
      items.addHeld(item.x, item.y, item.held, null);
    } else {
      items.addItem(item.x, item.y, stock(Object.fromEntries(GOODS.map((g: Goods): [Goods, number] => [g, item[g] ?? 0]))), null);
    }
  }
}

/**
 * Turns every structure tile on a fresh map into a placed structure, kept
 * facing the way its tile was turned, with its light lit for good.
 * @param map The world's map.
 * @param structures The world's (empty) structures.
 * @param lights The world's lights.
 */
export function seedPresetStructures(map: WorldMap, structures: StructureStore, lights: WorldLights): void {
  for (let i = 0; i < map.width * map.height; i++) {
    const tile = map.get(i % map.width, Math.floor(i / map.width));
    if (isStructure(tile)) {
      const tx = i % map.width;
      const ty = Math.floor(i / map.width);
      const turn = map.turnOf(tx, ty);
      map.set(tx, ty, 'grass');
      structures.place(tx, ty, tile, 0);
      if (turn) {
        map.setRamp(tx, ty, RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === turn[0] && dy === turn[1]));
      }
      lights.eternal(tx, ty);
    }
  }
  map.takeChanges();
}
