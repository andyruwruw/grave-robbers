// Packages
import { TV_VIEW_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import {
  readStorage,
  writeStorage,
} from '@halloween/ui/helpers/storage';

// Local Imports
import { TV_VIEWS } from '../config/tv-view';

// Types
import type { TvView } from '../types/tv-view';

/**
 * The TV view this browser last picked (Classic at first).
 *
 * @returns {TvView} The saved view, or Classic.
 */
export function loadTvView(): TvView {
  const saved = readStorage(TV_VIEW_STORAGE_KEY);
  return TV_VIEWS.some(({ id }): boolean => id === saved) ? saved as TvView : 'classic';
}

/**
 * Remembers the TV view for this browser.
 *
 * @param {TvView} view - The view to keep.
 */
export function saveTvView(view: TvView): void {
  writeStorage(TV_VIEW_STORAGE_KEY, view);
}
