// Packages
import { useLabel, useTarget } from '@halloween/shared/world/use-target';

// Local Imports
import { USE_PROMPT_LIFT } from '../config/play';

// Types
import type React from 'react';
import type { Binding, UsePromptShown } from '../types/play';
import type { FrameContext } from './frame-context';

/**
 * The prompt over what USE would act on right now (`useTarget`, toward
 * the mouse while it aims, else along the facing): the key or button and
 * what it does, such as Open Sawmill. What it shows goes to the page only
 * when it changes; where it sits is written straight to the element each
 * frame so the page doesn't re-render.
 */
export class UsePrompt {
  /**
   * What the page shows now, as a key, to skip setting the same again.
   */
  private _shown = '';

  /**
   * @param _el The prompt's element.
   * @param _padIndex The pad being played, if any.
   * @param _show Sets what the page shows (null: nothing).
   */
  constructor(
    private readonly _el: React.RefObject<HTMLDivElement | null>,
    private readonly _padIndex: React.RefObject<number | null>,
    private readonly _show: (prompt: UsePromptShown | null) => void,
  ) {}

  /**
   * Hands the page what to show, if it changed.
   *
   * @param prompt - What to show, or null.
   */
  private set(prompt: UsePromptShown | null): void {
    const key = JSON.stringify(prompt);
    if (key !== this._shown) {
      this._shown = key;
      this._show(prompt);
    }
  }

  /**
   * Shows the prompt over this frame's USE target, or hides it.
   *
   * @param ctx - The frame (after the prediction stepped).
   * @param show - Whether the player is out in the world, fighting.
   */
  update(ctx: FrameContext, show: boolean): void {
    const el = this._el.current;
    if (!el) {
      return;
    }
    const r = ctx.rendererRef.current;
    const map = r?.worldMap();
    const me = ctx.predictor;
    const target = show && r && map ? useTarget(map, me.x, me.y, me.facing, ctx.useAt) : null;
    const label = target?.found ? useLabel(map!.get(target.tx, target.ty)) : null;
    if (!r || !target || !label) {
      el.style.display = 'none';
      this.set(null);
      return;
    }
    const settings = ctx.live.settings;
    const binding: Binding = ctx.useAt || this._padIndex.current === null ? { code: settings.keys.use } : { button: settings.pad.use };
    this.set({ binding, label });
    const at = r.screenOf(target.tx + 0.5, target.ty + 0.5, USE_PROMPT_LIFT);
    el.style.display = '';
    el.style.left = `${at.x}px`;
    el.style.top = `${at.y}px`;
  }
}
