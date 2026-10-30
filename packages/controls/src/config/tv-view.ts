// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { FOLLOW_TALL } from '@halloween/renderer/world/camera/config/camera';

// Types
import type { TvViewOption } from '../types/tv-view';

/**
 * Every TV view preset, in the order the Game tab lists them.
 */
export const TV_VIEWS: TvViewOption[] = [
  { id: 'classic', label: 'Classic', hint: `${MAP_WIDTH} x ${MAP_HEIGHT}, a classic map`, view: { w: MAP_WIDTH, h: MAP_HEIGHT } },
  { id: 'close', label: 'Close', hint: `${FOLLOW_TALL} tall, like /play`, view: FOLLOW_TALL },
];
