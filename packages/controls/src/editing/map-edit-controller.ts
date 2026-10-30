// Local Imports
import { MapPointerMode } from '../mouse/map-pointer-mode';
import { EditBatcher } from './edit-batcher';
import { TilePicker } from './tile-picker';
import { EDIT_TOOLS } from './tools/edit-tools';

// Types
import type React from 'react';
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type {
  EditorState,
  StairsPlacement,
  Stroke,
  TileRef,
} from '../types/map-editor';

/**
 * The TV's mouse while the map editor is open: a ring follows the tile
 * under the cursor (traced through the terrain, so the side of a block picks
 * the block and a pit's back wall picks the pit; scrolling steps to tiles
 * hidden further back) showing what the round brush covers, and pressing
 * (and dragging) edits the tiles under it with the picked tool
 * (`EDIT_TOOLS`).
 */
export class MapEditController extends MapPointerMode {
  /**
   * The editor's tool, or null while it's closed.
   */
  editor: EditorState | null = null;

  /**
   * The Mix settings the map remembers, for the picker.
   */
  blends: React.RefObject<BlendAreas | null> = { current: null };

  /**
   * Changes the editor's state (the picker sets the Mix brush).
   */
  onChange: (next: EditorState) => void = (): void => {};

  /**
   * The brush stroke in progress, if any.
   */
  stroke: Stroke | null = null;

  /**
   * The way the Stairs tool last turned to, if any.
   */
  stairsDir: number | null = null;

  /**
   * The flight of stairs shown under the cursor, if any.
   */
  placing: StairsPlacement | null = null;

  /**
   * Edits waiting to go to the server.
   */
  readonly batcher = new EditBatcher((msg: ClientMessage): void => this._send(msg));

  /**
   * Where the pointer last was over the map, for the wheel.
   */
  private _pointer: { x: number; y: number } | null = null;

  /**
   * Picks the tile under the mouse at the scrolled depth.
   */
  private readonly _picker = new TilePicker();

  /**
   * Takes the page's latest values; call it every render.
   *
   * @param renderer - The TV's renderer, for picking.
   * @param editor - The editor's tool, or null while it's closed.
   * @param blends - The Mix settings the map remembers, for the picker.
   * @param onChange - Changes the editor's state.
   * @param send - Sends to the server.
   */
  sync(
    renderer: React.RefObject<WorldRenderer | null>,
    editor: EditorState | null,
    blends: React.RefObject<BlendAreas | null>,
    onChange: (next: EditorState) => void,
    send: (msg: ClientMessage) => void,
  ): void {
    this._renderer = renderer;
    this.editor = editor;
    this.blends = blends;
    this.onChange = onChange;
    this._send = send;
  }

  /**
   * The renderer, once it's mounted (only read after checking it is).
   *
   * @returns The renderer.
   */
  get renderer(): WorldRenderer {
    return this._renderer.current!;
  }

  /**
   * The tile the brush is on: the nearest one under the mouse, or one
   * further back along the line of sight after scrolling.
   *
   * @param clientX - The pointer's x on the page.
   * @param clientY - The pointer's y on the page.
   * @returns The tile, or null over nothing.
   */
  tileAt(clientX: number, clientY: number): TileRef | null {
    const hit = this._picker.pick(this.renderer, clientX, clientY);
    if (!hit) {
      return null;
    }
    return this.editor ? EDIT_TOOLS[this.editor.tool].resolveTile(hit, this.renderer) : { tx: hit.tx, ty: hit.ty };
  }

  /**
   * Moves the ring (and the Stairs tool's flight) to the tile under a
   * point.
   *
   * @param clientX - The pointer's x on the page.
   * @param clientY - The pointer's y on the page.
   * @returns The tile, or null over nothing.
   */
  showCursor(clientX: number, clientY: number): TileRef | null {
    const tile = this.tileAt(clientX, clientY);
    const r = this.renderer;
    this.placing = null;
    if (tile && this.editor) {
      this.placing = EDIT_TOOLS[this.editor.tool].ghost(r, tile, this.stairsDir);
    }
    r.setStairsGhost(this.placing);
    const size = !this.editor ? 1 : EDIT_TOOLS[this.editor.tool].cursorSize(this.editor);
    r.setEditCursor(tile && this.editor && { ...(this.placing ?? tile), size });
    return tile;
  }

  /**
   * Edits one tile the stroke reaches, once per stroke.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   */
  apply(tx: number, ty: number): void {
    if (!this.editor || !this.stroke) {
      return;
    }
    const key = ty * 1000 + tx;
    if (this.stroke.seen.has(key)) {
      return;
    }
    this.stroke.seen.add(key);
    const edit = EDIT_TOOLS[this.editor.tool].edit(tx, ty, this.editor, this.stroke);
    if (edit) {
      this.batcher.push(edit);
    }
  }

  /**
   * Cancels a scheduled send.
   */
  dispose(): void {
    this.batcher.dispose();
  }

  /**
   * Hands the press to the picked tool.
   *
   * @param e - The pointer event.
   */
  protected pointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (!this._renderer.current || !this.editor) {
      return;
    }
    const tile = this.tileAt(e.clientX, e.clientY);
    if (!tile) {
      return;
    }
    EDIT_TOOLS[this.editor.tool].press(this, e, tile);
  }

  /**
   * Moves the ring, and carries on the stroke.
   *
   * @param e - The pointer event.
   */
  protected pointerMove(e: React.PointerEvent<HTMLDivElement>): void {
    if (!this._renderer.current || !this.editor) {
      return;
    }
    this._pointer = { x: e.clientX, y: e.clientY };
    const tile = this.showCursor(e.clientX, e.clientY);
    if (tile && this.stroke) {
      this.apply(tile.tx, tile.ty);
    }
  }

  /**
   * Ends the stroke and sends what's left.
   */
  protected pointerUp(): void {
    this.stroke = null;
    this.batcher.flush();
  }

  /**
   * Ends the stroke and sends what's left.
   */
  protected pointerCancel(): void {
    this.stroke = null;
    this.batcher.flush();
  }

  /**
   * Keeps the context menu shut, since the right button turns stairs.
   *
   * @param e - The mouse event.
   */
  protected contextMenu(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  /**
   * Steps the brush to a tile further back (or nearer) along the line of
   * sight.
   *
   * @param e - The wheel event.
   */
  protected wheel(e: React.WheelEvent<HTMLDivElement>): void {
    if (!this._renderer.current || !this.editor || !this._pointer) {
      return;
    }
    this._picker.step(this._renderer.current, this._pointer.x, this._pointer.y, e.deltaY);
    this.showCursor(this._pointer.x, this._pointer.y);
  }
}
