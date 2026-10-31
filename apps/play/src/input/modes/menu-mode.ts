// Packages
import { BUTTON_PRESS } from '@halloween/ui/config/input';
import { stick } from '@halloween/ui/input/gamepad';

// Local Imports
import {
  PAD,
  REPEAT_FIRST_MS,
  REPEAT_MS,
  SCROLL_SPEED,
} from '../../config/play';
import { scroller } from '../../helpers/dom';
import { InputMode } from './input-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { Menu, NavDir } from '../../types/play';
import type { ModeResult } from './input-mode';

/**
 * In a menu, a storage chest, or the join screen: lets go of everything,
 * then the D-pad or left stick moves the selection (repeating while held),
 * the right stick scrolls, A presses, B or Esc closes, LB and RB switch
 * menus, and a menu's own key or button toggles it.
 */
export class MenuMode extends InputMode {
  /**
   * Runs one frame of menu navigation.
   *
   * @param ctx - The frame (`root` is set).
   * @returns Always 'continue'.
   */
  step(ctx: FrameContext): ModeResult {
    const s = ctx.live;
    const k = ctx.keyboard;
    const pad = ctx.pad;
    const root = ctx.root!;
    const now = ctx.now;
    ctx.held.release(s.send);
    if (pad.gp) {
      if (ctx.padTapped >= 0 || Math.hypot(pad.axis(0), pad.axis(1)) > BUTTON_PRESS) {
        ctx.nav.ensure(root);
      }
      const [lx, ly] = [pad.axis(0), pad.axis(1)];
      const dir: NavDir | null = pad.down(PAD.up) ? 'up' : pad.down(PAD.down) ? 'down' : pad.down(PAD.left) ? 'left' : pad.down(PAD.right) ? 'right'
        : Math.abs(ly) > BUTTON_PRESS && Math.abs(ly) >= Math.abs(lx) ? (ly < 0 ? 'up' : 'down')
        : Math.abs(lx) > BUTTON_PRESS ? (lx < 0 ? 'left' : 'right') : null;
      if (dir !== ctx.navDir) {
        ctx.navDir = dir;
        ctx.navAt = now + REPEAT_FIRST_MS;
        if (dir) {
          ctx.nav.move(root, dir);
        }
      } else if (dir && now >= ctx.navAt) {
        ctx.navAt = now + REPEAT_MS;
        ctx.nav.move(root, dir);
      }
      const [rx, ry] = stick(pad.axis(2), pad.axis(3));
      if (rx || ry) {
        scroller(ctx.nav.focused(root))?.scrollBy(rx * SCROLL_SPEED, ry * SCROLL_SPEED);
      }
      if (pad.tap(PAD.a)) {
        ctx.nav.press(root);
      }
    }
    if (s.joined && !s.capturing) {
      if (pad.tap(PAD.b) || k.taps.has('Escape')) {
        if (s.stash) {
          s.send({ t: 'stash-close' });
        } else if (s.using) {
          s.send({ t: 'use-close' });
        } else {
          s.setMenu(null);
        }
      } else if (!s.stash && !s.using && s.menu) {
        const at = s.menus.indexOf(s.menu);
        const opened = s.menus.find((m: Menu): boolean => ctx.tappedAction(m));
        if (pad.tap(PAD.lb) || pad.tap(PAD.rb)) {
          s.setMenu(s.menus[(at + (pad.tap(PAD.rb) ? 1 : s.menus.length - 1)) % s.menus.length]);
        } else if (opened) {
          s.setMenu(s.menu === opened ? null : opened);
        }
      }
    }
    return 'continue';
  }
}
