// Local Imports
import { SfxEngine } from './sfx-engine';

/**
 * The page's one sound effects engine.
 */
export const sfx = new SfxEngine();

if (import.meta.hot) {
  import.meta.hot.dispose((): void => sfx.setAmbience([], 0));
}
