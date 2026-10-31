// Packages
import { Worker } from 'node:worker_threads';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { MapPreset } from '../../storage/types/save';
import type { HugeGenJob } from '../types/threads';

/**
 * Generates a huge world on its own thread, so the game keeps ticking for
 * the few hundred milliseconds it takes. The map comes back encoded, as a
 * nameless preset to start the world from.
 * @param gen The generator's knobs.
 * @returns The made map.
 */
export function generateHugeOffThread(gen: MapGenSettings): Promise<MapPreset> {
  const job: HugeGenJob = { seed: Math.floor(Math.random() * 2 ** 31), gen };
  return new Promise((resolve, reject): void => {
    const worker = new Worker(new URL('./huge-gen-worker.ts', import.meta.url), { workerData: job });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code: number): void => reject(new Error(`huge-gen worker exited (${code})`)));
  });
}
