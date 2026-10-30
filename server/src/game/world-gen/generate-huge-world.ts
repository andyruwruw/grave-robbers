// Packages
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { HUGE_SIZE, MIN_LEVEL } from '@halloween/shared/world/dimensions';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { DISTRICT_GRID } from './config/huge';
import { GenCanvas } from './gen-canvas';
import { generateWorld } from './generate-world';
import { inside } from './helpers/rect';
import { ChasmPass } from './huge/chasm-pass';
import { DistrictPass } from './huge/district-pass';
import { RoadPass } from './huge/road-pass';
import { SealPass } from './huge/seal-pass';
import { WildsPass } from './huge/wilds-pass';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { Rect } from './types/geometry';

/**
 * A huge world (HUGE_SIZE square): DISTRICT_GRID x DISTRICT_GRID classic
 * graveyards (each from `generateWorld`, fences taken down) spread over
 * wild woods, joined by winding roads, inside a ring of chasm, with
 * crevasses and sinkholes breaking up the wilds. Roads bridge whatever
 * they cross. Wild ground that can't be reached from the spawn and back
 * falls away into chasm; district ground that can't becomes trees.
 * @param seed The world's seed.
 * @param gen The generator knobs.
 * @returns The new map, with no pending changes.
 */
export function generateHugeWorld(seed: number, gen: MapGenSettings): WorldMap {
  const rand = seededRandom(seed ^ 0x2f6b1d);
  const n = HUGE_SIZE;
  const map = WorldMap.filled('grass', n, n);
  const canvas = new GenCanvas(map, rand, gen);
  const districtPass = new DistrictPass(canvas);
  const districts = districtPass.layDistricts();
  const inDistrict = (x: number, y: number, margin = 0): boolean => districts.some((r: Rect): boolean => inside(r, x, y, margin));

  new WildsPass(canvas).wilds(inDistrict);
  new ChasmPass(canvas).chasms(inDistrict);
  const middle = Math.floor((DISTRICT_GRID * DISTRICT_GRID) / 2);
  districts.forEach((r: Rect, i: number): void => districtPass.stamp(r, generateWorld(seed + 1013 * (i + 1), { ...gen, size: 'classic' }), i === middle));
  new RoadPass(canvas).roads(districts);
  new SealPass(canvas).seal(districts);
  for (let i = 0; i < map.size; i++) {
    if (map.get(i % n, Math.floor(i / n)) === 'chasm') {
      map.setLevel(i % n, Math.floor(i / n), MIN_LEVEL);
    }
  }
  map.takeChanges();
  return map;
}
