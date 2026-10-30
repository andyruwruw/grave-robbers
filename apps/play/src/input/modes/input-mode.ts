// Types
import type { FrameContext } from '../frame-context';

/**
 * What a mode's frame tells the loop: carry on to the prediction, or stop
 * the frame there (skipping the prediction and its frame time).
 */
export type ModeResult = 'continue' | 'halt';

/**
 * What the /play input does in one state (rebinding a pad button, in a
 * menu, walking, or neither).
 */
export abstract class InputMode {
  /**
   * Runs one frame.
   *
   * @param ctx - The frame.
   * @returns Whether the loop carries on to the prediction.
   */
  abstract step(ctx: FrameContext): ModeResult;
}
