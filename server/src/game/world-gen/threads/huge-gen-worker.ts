// Packages
import { parentPort, workerData } from 'node:worker_threads';

// Local Imports
import { generateHugeWorld } from '../generate-huge-world';

// Types
import type { MapPreset } from '../../storage/types/save';
import type { HugeGenJob } from '../types/threads';

const { seed, gen } = workerData as HugeGenJob;
const map = generateHugeWorld(seed, gen);
const made: MapPreset = {
  name: '',
  seed,
  tiles: map.encode(),
  width: map.width,
  levels: map.encodeLevels(),
  ramps: map.encodeRamps(),
};
parentPort!.postMessage(made);
