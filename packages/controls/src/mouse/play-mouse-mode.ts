// Local Imports
import { MOUSE_SEND_MS } from '../config/mouse';
import { MapPointerMode } from './map-pointer-mode';

// Types
import type React from 'react';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { LiftTarget } from '@halloween/shared/protocol/tv-tools';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * The TV's mouse on the map while playing, each part switched on from the
 * Game tab: the left button picks up a player or monster and drops it
 * wherever it's let go (the server finds the nearest spot it can stand),
 * and holding the right button carries a light that follows the cursor.
 */
export class PlayMouseMode extends MapPointerMode {
  /**
   * The player or monster being carried, if any.
   */
  private _lifting: LiftTarget | null = null;

  /**
   * Whether the right button is carrying the light.
   */
  private _lighting = false;

  /**
   * When (performance.now ms) the last position went.
   */
  private _lastSent = 0;

  /**
   * The server's switches.
   */
  private _settings!: GameSettings;

  /**
   * Takes the page's latest values; call it every render.
   *
   * @param renderer - The TV's renderer, for picking.
   * @param settings - The server's switches.
   * @param send - Sends to the server.
   */
  sync(renderer: React.RefObject<WorldRenderer | null>, settings: GameSettings, send: (msg: ClientMessage) => void): void {
    this._renderer = renderer;
    this._settings = settings;
    this._send = send;
  }

  /**
   * Moves what's carried to the ground under the pointer.
   *
   * @param e - The pointer event.
   * @param drop - Whether it's let go there.
   */
  private lift(e: React.PointerEvent<HTMLDivElement>, drop: boolean): void {
    const { x, y } = this._renderer.current!.groundAt(e.clientX, e.clientY);
    this._send({ t: 'tv-lift', target: this._lifting!, x, y, drop });
  }

  /**
   * Moves the carried light to the ground under the pointer.
   *
   * @param e - The pointer event.
   */
  private light(e: React.PointerEvent<HTMLDivElement>): void {
    this._send({ t: 'tv-light', at: this._renderer.current!.groundAt(e.clientX, e.clientY) });
  }

  /**
   * Drops what's carried, or puts the light out, when its button comes up.
   *
   * @param e - The pointer event.
   */
  private end(e: React.PointerEvent<HTMLDivElement>): void {
    if (this._lifting && e.button !== 2) {
      this.lift(e, true);
      this._lifting = null;
    }
    if (this._lighting && (e.button === 2 || e.type === 'pointercancel')) {
      this._send({ t: 'tv-light', at: null });
      this._lighting = false;
    }
  }

  /**
   * Picks something up (left) or lights the light (right).
   *
   * @param e - The pointer event.
   */
  protected pointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (!this._renderer.current) {
      return;
    }
    if (e.button === 0 && this._settings.tvDrag) {
      const target = this._renderer.current.entityAt(e.clientX, e.clientY);
      if (target) {
        this._lifting = target;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.style.cursor = 'grabbing';
        this.lift(e, false);
      }
    } else if (e.button === 2 && this._settings.tvLight) {
      this._lighting = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      this.light(e);
    }
  }

  /**
   * Shows the grab cursor over something to pick up, or moves what's
   * carried (at most every `MOUSE_SEND_MS`).
   *
   * @param e - The pointer event.
   */
  protected pointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    if (!this._renderer.current) {
      return;
    }
    if (!this._lifting && !this._lighting) {
      e.currentTarget.style.cursor = this._settings.tvDrag && this._renderer.current.entityAt(e.clientX, e.clientY) ? 'grab' : '';
      return;
    }
    const now = performance.now();
    if (now - this._lastSent < MOUSE_SEND_MS) {
      return;
    }
    this._lastSent = now;
    if (this._lifting) {
      this.lift(e, false);
    }
    if (this._lighting) {
      this.light(e);
    }
  }

  /**
   * Ends a carry and resets the cursor.
   *
   * @param e - The pointer event.
   */
  protected pointerUp(e: React.PointerEvent<HTMLDivElement>): void {
    if (this._renderer.current) {
      this.end(e);
    }
    e.currentTarget.style.cursor = '';
  }

  /**
   * Ends a carry the browser cancelled.
   *
   * @param e - The pointer event.
   */
  protected pointerCancel(e: React.PointerEvent<HTMLDivElement>): void {
    if (this._renderer.current) {
      this.end(e);
    }
  }

  /**
   * Keeps the context menu shut while the mouse light is on.
   *
   * @param e - The mouse event.
   */
  protected contextMenu(e: React.MouseEvent<HTMLDivElement>): void {
    if (this._settings.tvLight) {
      e.preventDefault();
    }
  }
}
