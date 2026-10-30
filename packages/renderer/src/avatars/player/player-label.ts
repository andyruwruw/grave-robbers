// Packages
import { MAX_HP } from '@halloween/shared/players/health';

// Local Imports
import { HEALTH_FILL, WOUND_FILL } from './config/player-look';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * A player's name tag in the DOM, underlined in their color, with a health
 * bar under it while hurt.
 */
export class PlayerLabel {
  /**
   * The name tag; the renderer positions it each frame.
   */
  readonly element: HTMLDivElement;

  /**
   * The health bar, shown while hurt.
   */
  private _healthBar: HTMLDivElement;

  /**
   * The health bar's fill.
   */
  private _healthFill: HTMLDivElement;

  /**
   * The health bar's wounded (healable) part.
   */
  private _woundFill: HTMLDivElement;

  /**
   * Makes the name tag and adds it to the label layer.
   * @param state The player's first state.
   * @param labelLayer Where labels go.
   */
  constructor(state: PlayerState, labelLayer: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'pointer-events-none absolute left-0 top-0 whitespace-nowrap border-b-2 px-1 pb-0.5 font-medium text-sm text-foreground [text-shadow:0_2px_0_var(--arw-bg)]';
    this.element.style.borderColor = state.color;
    this.element.textContent = state.name;
    this._healthBar = document.createElement('div');
    this._healthBar.className = 'absolute inset-x-1 -bottom-1.5 h-1 bg-background';
    this._healthFill = document.createElement('div');
    this._healthFill.className = 'h-full';
    this._healthFill.style.backgroundColor = HEALTH_FILL;
    this._woundFill = document.createElement('div');
    this._woundFill.className = 'absolute inset-y-0 right-0';
    this._woundFill.style.backgroundColor = WOUND_FILL;
    this._healthBar.append(this._healthFill, this._woundFill);
    this.element.appendChild(this._healthBar);
    labelLayer.appendChild(this.element);
  }

  /**
   * Dims the tag while the phone is away and fills the health bar.
   * @param t The player's state.
   */
  update(t: PlayerState): void {
    this.element.style.opacity = String(t.connected ? 1 : 0.5);
    this._healthBar.style.display = t.hp < MAX_HP ? '' : 'none';
    this._healthFill.style.width = `${(t.hp / MAX_HP) * 100}%`;
    this._woundFill.style.width = `${(t.wounded / MAX_HP) * 100}%`;
  }

  /**
   * Takes the tag out of the page.
   */
  dispose(): void {
    this.element.remove();
  }
}
