// Local Imports
import { InputMode } from './input-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { ModeResult } from './input-mode';

/**
 * Not joined (with no join screen showing) or dead: lets go of everything.
 */
export class IdleMode extends InputMode {
  /**
   * Lets go of everything.
   *
   * @param ctx - The frame.
   * @returns Always 'continue'.
   */
  step(ctx: FrameContext): ModeResult {
    ctx.held.release(ctx.live.send);
    return 'continue';
  }
}
