// Types
import type { FollowView } from '@halloween/renderer/types/camera';

/**
 * How much ground each pane of the TV's split screen shows on a huge
 * world. Classic frames the same area the TV showed of a classic map.
 */
export type TvView = 'classic' | 'close';

/**
 * One TV view preset as the Game tab lists it.
 */
export interface TvViewOption {
  /**
   * The preset's id.
   */
  id: TvView;

  /**
   * Its name on the button.
   */
  label: string;

  /**
   * The line under the name.
   */
  hint: string;

  /**
   * How much ground the camera frames.
   */
  view: FollowView;
}
