// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';

/**
 * What a huge-world worker is asked to make.
 */
export interface HugeGenJob {
  /**
   * The seed to generate from.
   */
  seed: number;

  /**
   * The generator's knobs.
   */
  gen: MapGenSettings;
}
