// Packages
import { MapPointerMode } from '@halloween/controls/mouse/map-pointer-mode';

// Types
import type React from 'react';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * The admin's mouse on the map while something is picked on the Spawn
 * page: a crosshair, and a left click conjures it on the ground under the
 * pointer (the server skips a spot it can't go on).
 */
export class SpawnMouseMode extends MapPointerMode {
  /**
   * What a click conjures.
   */
  private _kind: SpawnKind = 'tree';

  /**
   * Takes the page's latest values; call it every render.
   *
   * @param renderer - The admin's renderer, for picking.
   * @param kind - What a click conjures.
   * @param send - Sends to the server.
   */
  sync(renderer: React.RefObject<WorldRenderer | null>, kind: SpawnKind, send: (msg: ClientMessage) => void): void {
    this._renderer = renderer;
    this._kind = kind;
    this._send = send;
  }

  /**
   * Conjures the picked thing where the left button goes down.
   *
   * @param e - The pointer event.
   */
  protected pointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.button !== 0 || !this._renderer.current) {
      return;
    }
    this._send({ t: 'spawn', kind: this._kind, at: this._renderer.current.groundAt(e.clientX, e.clientY) });
  }

  /**
   * Shows the crosshair.
   *
   * @param e - The pointer event.
   */
  protected pointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    e.currentTarget.style.cursor = 'crosshair';
  }

  /**
   * Nothing to finish.
   */
  protected pointerUp(): void {}

  /**
   * Nothing to cancel.
   */
  protected pointerCancel(): void {}

  /**
   * Leaves the context menu alone.
   */
  protected contextMenu(): void {}
}
