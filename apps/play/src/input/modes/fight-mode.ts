// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { itemStats } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { WalkMode } from './walk-mode';

// Types
import type { FrameContext } from '../frame-context';
import type { ModeResult } from './input-mode';

/**
 * Walking with a weapon: the attack binding presses and lets go of the
 * action button (showing a melee swing at once, no faster than the
 * weapon's cooldown), and the block binding raises and lowers the shield.
 */
export class FightMode extends WalkMode {
  /**
   * Sends attack and block when they change.
   *
   * @param ctx - The frame.
   * @returns Always 'continue'.
   */
  protected act(ctx: FrameContext): ModeResult {
    const s = ctx.live;
    const pads = s.settings.pad;
    const now = ctx.now;
    const act = ctx.pad.down(pads.attack) || ctx.keyDown('attack');
    if (act !== ctx.held.act) {
      ctx.held.act = act;
      s.send({ t: 'action', down: act });
      const kind = s.weapon?.kind ?? 'hammer';
      if (act && s.playerId && !GEAR[kind].weapon?.ranged && now >= ctx.swingReadyAt) {
        ctx.rendererRef.current?.predictSwing(s.playerId);
        ctx.swingReadyAt = now + itemStats(s.weapon, s.tree).cooldown * 1000;
      }
    }
    const block = ctx.pad.down(pads.block) || ctx.keyDown('block');
    if (block !== ctx.held.block) {
      ctx.held.block = block;
      s.send({ t: 'block', down: block });
    }
    return 'continue';
  }
}
