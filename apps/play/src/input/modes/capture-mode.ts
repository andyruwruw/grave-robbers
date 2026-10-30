// Local Imports
import { rebind } from '../../helpers/play-settings';
import { InputMode } from './input-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { ModeResult } from './input-mode';

/**
 * Waiting for a pad button to bind: the first one tapped takes the
 * binding. Nothing else runs while it waits.
 */
export class CaptureMode extends InputMode {
  /**
   * Binds a tapped button, if any.
   *
   * @param ctx - The frame.
   * @returns Always 'halt'.
   */
  step(ctx: FrameContext): ModeResult {
    const s = ctx.live;
    if (ctx.padTapped >= 0 && s.capturing?.device === 'pad') {
      s.changeSettings({ ...s.settings, pad: rebind(s.settings.pad, s.capturing.action, ctx.padTapped) });
      s.setCapturing(null);
    }
    return 'halt';
  }
}
