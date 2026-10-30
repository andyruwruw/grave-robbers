// Types
import type React from 'react';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { TvMouseHandlers } from '../types/mouse';

/**
 * What the TV's mouse does over the map. Each mode keeps its state across
 * renders and gets the page's latest values through its own `sync`; the
 * handlers it hands the map's element are built once, on first use (not
 * in the constructor, where a subclass's fields don't exist yet), and
 * call the mode's methods.
 */
export abstract class MapPointerMode {
  /**
   * The page's renderer, for picking.
   */
  protected _renderer: React.RefObject<WorldRenderer | null> = { current: null };

  /**
   * Sends to the server.
   */
  protected _send: (msg: ClientMessage) => void = (): void => {};

  /**
   * The handlers, once built.
   */
  private _handlers: TvMouseHandlers | null = null;

  /**
   * A button goes down over the map.
   *
   * @param e - The pointer event.
   */
  protected abstract pointerDown(e: React.PointerEvent<HTMLDivElement>): void;

  /**
   * The pointer moves over the map.
   *
   * @param e - The pointer event.
   */
  protected abstract pointerMove(e: React.PointerEvent<HTMLDivElement>): void;

  /**
   * A button comes up.
   *
   * @param e - The pointer event.
   */
  protected abstract pointerUp(e: React.PointerEvent<HTMLDivElement>): void;

  /**
   * The browser cancels the pointer.
   *
   * @param e - The pointer event.
   */
  protected abstract pointerCancel(e: React.PointerEvent<HTMLDivElement>): void;

  /**
   * The right button would open the context menu.
   *
   * @param e - The mouse event.
   */
  protected abstract contextMenu(e: React.MouseEvent<HTMLDivElement>): void;

  /**
   * The wheel turns over the map. Modes without it leave `onWheel` off the
   * handlers.
   *
   * @param e - The wheel event.
   */
  protected wheel?(e: React.WheelEvent<HTMLDivElement>): void;

  /**
   * The handlers for the element over the map, the same object every time.
   *
   * @returns The handlers.
   */
  handlers(): TvMouseHandlers {
    this._handlers ??= {
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>): void => this.pointerDown(e),
      onPointerMove: (e: React.PointerEvent<HTMLDivElement>): void => this.pointerMove(e),
      onPointerUp: (e: React.PointerEvent<HTMLDivElement>): void => this.pointerUp(e),
      onPointerCancel: (e: React.PointerEvent<HTMLDivElement>): void => this.pointerCancel(e),
      onContextMenu: (e: React.MouseEvent<HTMLDivElement>): void => this.contextMenu(e),
      ...(this.wheel ? { onWheel: (e: React.WheelEvent<HTMLDivElement>): void => this.wheel!(e) } : {}),
    };
    return this._handlers;
  }
}
