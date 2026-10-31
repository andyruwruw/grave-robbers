// Local Imports
import {
  DIRS,
  FOCUS_CLASS,
  FOCUSABLE,
} from '../config/nav';
import { center } from '../helpers/dom';

// Types
import type { NavDir } from '../types/play';

/**
 * Moves a gamepad's selection around a menu: one element at a time carries
 * `pad-focus` (and real focus, so a text field takes typing), and the D-pad
 * picks the nearest element that way, favoring ones straight ahead.
 */
export class SpatialNav {
  /**
   * The selected element, if any.
   */
  private _current: HTMLElement | null = null;

  /**
   * Whatever's selected, if it's still in `root` and showing.
   *
   * @param root - The menu.
   * @returns The selected element, or null.
   */
  focused(root: HTMLElement): HTMLElement | null {
    const el = this._current;
    return el && root.contains(el) && el.getClientRects().length > 0 && !(el as HTMLButtonElement).disabled ? el : null;
  }

  /**
   * Selects an element (scrolling it into view), or clears the selection.
   *
   * @param el - The element, or null.
   */
  select(el: HTMLElement | null): void {
    if (this._current === el) {
      return;
    }
    this._current?.classList.remove(FOCUS_CLASS);
    this._current = el;
    if (el) {
      el.classList.add(FOCUS_CLASS);
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /**
   * Keeps something selected in `root`: the current element if it's still
   * there (even disabled, so the next move starts from it), else the first
   * one.
   *
   * @param root - The menu.
   */
  ensure(root: HTMLElement): void {
    if (!this.focused(root) && !this.origin(root)) {
      this.select(this.candidates(root)[0] ?? null);
    }
  }

  /**
   * Moves the selection one step in a direction (from where the selection
   * was, even if it just turned disabled, like a reset button pressed).
   *
   * @param root - The menu.
   * @param dir - Which way.
   */
  move(root: HTMLElement, dir: NavDir): void {
    const from = this.focused(root) ?? this.origin(root);
    if (!from) {
      this.ensure(root);
      return;
    }
    const d = DIRS[dir];
    const c = center(from);
    let best: HTMLElement | null = null;
    let bestScore = Infinity;
    for (const el of this.candidates(root)) {
      if (el === from) {
        continue;
      }
      const p = center(el);
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const along = dx * d.x + dy * d.y;
      if (along < 2) {
        continue;
      }
      const score = along + Math.abs(dx * d.y - dy * d.x) * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) {
      this.select(best);
    }
  }

  /**
   * The selected element if it's still in `root` and showing but can't be
   * selected any more (disabled), to move on from.
   *
   * @param root - The menu.
   * @returns The element, or null.
   */
  private origin(root: HTMLElement): HTMLElement | null {
    const el = this._current;
    return el && root.contains(el) && el.getClientRects().length > 0 ? el : null;
  }

  /**
   * Presses the selected element.
   *
   * @param root - The menu.
   */
  press(root: HTMLElement): void {
    this.focused(root)?.click();
  }

  /**
   * What can be selected in `root`: showing, and not in a hidden or
   * skipped part.
   *
   * @param root - The menu.
   * @returns The elements.
   */
  private candidates(root: HTMLElement): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el: HTMLElement): boolean => el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"], [data-pad-skip]'));
  }
}
