// Packages
import { useState } from 'react';
import { cleanMapGen } from '@halloween/shared/map-gen/clean-map-gen';
import { MAP_GEN_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { readStorage, writeStorage } from '@halloween/ui/helpers/storage';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';

/**
 * The next random map's settings, kept per browser.
 *
 * @returns {[MapGenSettings, (next: MapGenSettings) => void]} The settings, and a setter that also saves them.
 */
export function useMapGen(): [MapGenSettings, (next: MapGenSettings) => void] {
  const [gen, setGen] = useState<MapGenSettings>((): MapGenSettings => {
    try {
      return cleanMapGen(JSON.parse(readStorage(MAP_GEN_STORAGE_KEY) ?? '{}'));
    } catch {
      return cleanMapGen(null);
    }
  });
  /**
   * Sets the generator settings and saves them.
   * @param next The new settings.
   */
  const changeGen = (next: MapGenSettings): void => {
    setGen(next);
    writeStorage(MAP_GEN_STORAGE_KEY, JSON.stringify(next));
  };
  return [gen, changeGen];
}
