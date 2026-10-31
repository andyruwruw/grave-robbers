// Packages
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { HUGE_SIZE, MIN_LEVEL } from '@halloween/shared/world/dimensions';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { LampPass } from './classic/passes/lamp-pass';
import { StairsPass } from './classic/passes/stairs-pass';
import { TerracePass } from './classic/passes/terrace-pass';
import { CONNECT_ROUNDS, CONNECT_SPREAD, LAMP_STRETCH } from './config/huge';
import { GenCanvas } from './gen-canvas';
import { ChasmPass } from './huge/chasm-pass';
import { HeightPass } from './huge/height-pass';
import { HubPass } from './huge/hub-pass';
import { RoadPass } from './huge/road-pass';
import { SiteBuildPass } from './huge/site-build-pass';
import { SitePass } from './huge/site-pass';
import { WildsPass } from './huge/wilds-pass';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { Point } from './types/geometry';

/**
 * A huge world (HUGE_SIZE square): one landscape of hills, peaks, and
 * hollows, with sites scattered over it (a hub with the crypt and spawns
 * at the middle, chapels, watchtowers, mausoleums, graveyards, crypts,
 * ruins, stone circles, pumpkin patches), each on a flat pad, joined by
 * winding roads that climb with stairs and bridge chasms. Woods, burial
 * grounds, rocks, and pumpkins fill the wilds between, inside a ring of
 * chasm with crevasses and sinkholes. Stairs are added until everything
 * can be reached from the spawns and back; what still can't becomes trees.
 * @param seed The world's seed.
 * @param gen The generator knobs.
 * @returns The new map, with no pending changes.
 */
export function generateHugeWorld(seed: number, gen: MapGenSettings): WorldMap {
  const rand = seededRandom(seed ^ 0x2f6b1d);
  const n = HUGE_SIZE;
  const map = WorldMap.filled('grass', n, n);
  const canvas = new GenCanvas(map, rand, gen);
  const stairs = new StairsPass(canvas);

  const sites = new SitePass(canvas).lay();
  new HeightPass(canvas).heights(sites);
  new ChasmPass(canvas).chasms(sites);
  const spawns = new HubPass(canvas).hub(sites[0]);
  const roads = new RoadPass(canvas).roads(sites);
  new SiteBuildPass(canvas).build(sites);
  if (gen.structures.lamps) {
    new LampPass(canvas).lamps(roads.flatMap((road: Point[]): Point[][] => [road.slice(0, LAMP_STRETCH), road.slice(-LAMP_STRETCH).reverse()]));
  }
  new TerracePass(canvas).stairsOnPaths();
  new WildsPass(canvas).wilds(sites);
  stairs.tidyStairs();
  stairs.connect(spawns, CONNECT_SPREAD, CONNECT_ROUNDS);
  stairs.extraStairs();
  stairs.fillUnreachable(spawns);
  for (let i = 0; i < map.size; i++) {
    if (map.get(i % n, Math.floor(i / n)) === 'chasm') {
      map.setLevel(i % n, Math.floor(i / n), MIN_LEVEL);
    }
  }
  map.takeChanges();
  return map;
}
