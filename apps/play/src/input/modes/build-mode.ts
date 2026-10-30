// Local Imports
import { PAD, SEND_MS } from '../../config/play';
import { WalkMode } from './walk-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { ModeResult } from './input-mode';

/**
 * Walking while building: the mouse picks the spot (sent at most every
 * `SEND_MS`), LB, RB, or the rotate binding turns it, the attack binding,
 * A, or right click places it, and B or Esc goes back to the bag.
 */
export class BuildMode extends WalkMode {
  /**
   * Aims, turns, places, or stops building.
   *
   * @param ctx - The frame.
   * @returns 'halt' after going back to the bag (the frame ends there).
   */
  protected act(ctx: FrameContext): ModeResult {
    const s = ctx.live;
    const k = ctx.keyboard;
    const pad = ctx.pad;
    const now = ctx.now;
    const mouseAim = k.mouse && k.mouse.at > ctx.padAimAt ? ctx.rendererRef.current?.groundAt(k.mouse.x, k.mouse.y) ?? null : null;
    const buildAim = mouseAim && { x: Math.round(mouseAim.x * 10) / 10, y: Math.round(mouseAim.y * 10) / 10 };
    if (s.playerId) {
      ctx.rendererRef.current?.setBuildAim(s.playerId, buildAim);
    }
    if (JSON.stringify(buildAim) !== ctx.held.buildAim && now - ctx.buildAimAt >= SEND_MS) {
      ctx.held.buildAim = JSON.stringify(buildAim);
      ctx.buildAimAt = now;
      s.send({ t: 'build-aim', at: buildAim });
    }
    if (pad.tap(PAD.lb) || pad.tap(PAD.rb) || ctx.tappedAction('rotate')) {
      s.send({ t: 'turn', dir: pad.tap(PAD.lb) ? -1 : 1 });
    }
    if (ctx.tappedAction('attack') || pad.tap(PAD.a) || k.taps.has('Mouse2')) {
      s.send({ t: 'build-place' });
    } else if (pad.tap(PAD.b) || k.taps.has('Escape')) {
      s.stopBuilding();
      return 'halt';
    }
    return 'continue';
  }
}
