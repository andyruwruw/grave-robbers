// Packages
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { DEFAULT_MAP_GEN } from '@halloween/shared/map-gen/settings';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { CryptPass } from './classic/passes/crypt-pass';
import { ForestPass } from './classic/passes/forest-pass';
import { LampPass } from './classic/passes/lamp-pass';
import { LandmarkPass } from './classic/passes/landmark-pass';
import { PathPass } from './classic/passes/path-pass';
import { PlotPass } from './classic/passes/plot-pass';
import { ScatterPass } from './classic/passes/scatter-pass';
import { StairsPass } from './classic/passes/stairs-pass';
import { TerracePass } from './classic/passes/terrace-pass';
import { GenCanvas } from './gen-canvas';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';

/**
 * Builds a fresh graveyard on a seed:
 *
 * 1. Fence border and the central crypt in a cobbled courtyard.
 * 2. Four winding main paths out from the crypt, with two spawns on each.
 * 3. One landmark per quadrant (ruined chapel, hill with stairs, row of
 *    mausoleums, well plaza), each linked to the nearest path.
 * 4. Terraces and hollows over the open ground, with stone stairs where
 *    paths cross a level change.
 * 5. Hedged grave plots with gaps, an uneven forest edge with clearings,
 *    lamp posts along the paths, and scattered rocks, trees, and pumpkins.
 *
 * More stairs are added until every open area can be reached and left
 * (plus extra ones if asked); pockets that still can't are filled with
 * trees. `gen` sets how many mountains and pits, which landmarks, and how
 * much scenery.
 * @param seed The map's seed.
 * @param gen The generator knobs.
 * @returns The new map, with no pending changes.
 */
export function generateWorld(seed: number, gen: MapGenSettings = DEFAULT_MAP_GEN): WorldMap {
  const rand = seededRandom(seed);
  const map = WorldMap.filled('grass');
  const canvas = new GenCanvas(map, rand, gen);
  const crypt = new CryptPass(canvas);
  const paths = new PathPass(canvas);
  const stairs = new StairsPass(canvas);

  crypt.border();
  crypt.crypt();
  const arms = paths.mainPaths();
  const spawns = paths.spawns(arms);
  new LandmarkPass(canvas).landmarks();
  new TerracePass(canvas).terraces(spawns);
  stairs.connect(spawns);
  new ForestPass(canvas).forestEdge();
  if (gen.structures.plots) {
    new PlotPass(canvas).plots();
  }
  if (gen.structures.lamps) {
    new LampPass(canvas).lamps(arms);
  }
  new ScatterPass(canvas).scatter(spawns);
  stairs.tidyStairs();
  stairs.connect(spawns);
  stairs.extraStairs();
  stairs.fillUnreachable(spawns);
  map.takeChanges();
  return map;
}
