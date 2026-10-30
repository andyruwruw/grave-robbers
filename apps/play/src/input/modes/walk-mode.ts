// Packages
import { stick } from '@halloween/ui/input/gamepad';

// Local Imports
import {
  MENUS,
  MOUSE_AIM_MIN,
  SEND_MS,
} from '../../config/play';
import { InputMode } from './input-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { Menu } from '../../types/play';
import type { ModeResult } from './input-mode';

/**
 * Out in the world: clears the menu selection, walks with the left stick
 * or the keys, aims with the right stick or the mouse (snapped to eight
 * ways, once it's far enough from the player), and sends both when they
 * change (at most every `SEND_MS`). Then the subclass acts (fighting or
 * building), and a menu's key or button opens it.
 */
export abstract class WalkMode extends InputMode {
  /**
   * Runs one frame of walking, then the subclass's action.
   *
   * @param ctx - The frame.
   * @returns 'halt' if the action ended the frame.
   */
  step(ctx: FrameContext): ModeResult {
    const s = ctx.live;
    const k = ctx.keyboard;
    const pad = ctx.pad;
    const now = ctx.now;
    ctx.nav.select(null);
    ctx.navDir = null;
    let [mx, my] = stick(pad.axis(0), pad.axis(1));
    if (!mx && !my) {
      const kx = (ctx.keyDown('right') ? 1 : 0) - (ctx.keyDown('left') ? 1 : 0);
      const ky = (ctx.keyDown('down') ? 1 : 0) - (ctx.keyDown('up') ? 1 : 0);
      const len = Math.hypot(kx, ky) || 1;
      [mx, my] = [Math.round((kx / len) * 100) / 100, Math.round((ky / len) * 100) / 100];
    }
    let [ax, ay] = stick(pad.axis(2), pad.axis(3));
    if (ax || ay) {
      ctx.padAimAt = now;
    } else if (k.mouse && k.mouse.at > ctx.padAimAt) {
      const ground = ctx.rendererRef.current?.groundAt(k.mouse.x, k.mouse.y);
      const me = ctx.predictor;
      if (ground && Math.hypot(ground.x - me.x, ground.y - me.y) > MOUSE_AIM_MIN) {
        const angle = Math.round(Math.atan2(ground.y - me.y, ground.x - me.x) / (Math.PI / 4)) * (Math.PI / 4);
        [ax, ay] = [Math.round(Math.cos(angle) * 100) / 100, Math.round(Math.sin(angle) * 100) / 100];
      }
    }
    ctx.move = { x: mx, y: my };
    ctx.aim = { x: ax, y: ay };
    if (now - ctx.sentAt >= SEND_MS) {
      ctx.sentAt = now;
      if (`${mx},${my}` !== ctx.held.move) {
        ctx.held.move = `${mx},${my}`;
        s.send({ t: 'input', x: mx, y: my });
      }
      if (`${ax},${ay}` !== ctx.held.aim) {
        ctx.held.aim = `${ax},${ay}`;
        s.send({ t: 'aim', x: ax, y: ay });
      }
    }
    if (this.act(ctx) === 'halt') {
      return 'halt';
    }
    const opened = MENUS.find((m: Menu): boolean => ctx.tappedAction(m));
    if (opened) {
      s.setMenu(opened);
    }
    return 'continue';
  }

  /**
   * What the subclass does with the action buttons this frame.
   *
   * @param ctx - The frame.
   * @returns 'halt' to end the frame here.
   */
  protected abstract act(ctx: FrameContext): ModeResult;
}
