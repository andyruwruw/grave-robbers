// Types
import type React from 'react';
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type {
  EditorState,
  EditToolId,
  StairsPlacement,
  Stroke,
  TileHit,
  TileRef,
} from '../../types/map-editor';
import type { MapEditController } from '../map-edit-controller';

/**
 * One of the map editor's tools: how big its cursor is, which tile a hit
 * means, what it previews, what a press does, and what a drag over a tile
 * edits.
 */
export abstract class EditTool {
  /**
   * The tool's id in `EditorState.tool`.
   */
  abstract readonly id: EditToolId;

  /**
   * How many tiles across the cursor ring is.
   *
   * @param state - The editor's state.
   * @returns The ring's size.
   */
  cursorSize(state: EditorState): number {
    return state.size;
  }

  /**
   * The tile a hit under the mouse means for this tool.
   *
   * @param hit - The tile hit along the line of sight.
   * @param _renderer - The renderer, for looking at the map.
   * @returns The tile.
   */
  resolveTile(hit: TileHit, _renderer: WorldRenderer): TileRef {
    return { tx: hit.tx, ty: hit.ty };
  }

  /**
   * The see-through flight of stairs to show at a tile, if this tool places
   * stairs.
   *
   * @param _renderer - The renderer, for the ways stairs could go.
   * @param _tile - The tile under the cursor.
   * @param _stairsDir - The way last picked with a right click, if any.
   * @returns The placement, or null.
   */
  ghost(_renderer: WorldRenderer, _tile: TileRef, _stairsDir: number | null): StairsPlacement | null {
    return null;
  }

  /**
   * The edit a stroke makes on one tile, if this tool paints strokes.
   *
   * @param _tx - The tile's column.
   * @param _ty - The tile's row.
   * @param _state - The editor's state.
   * @param _stroke - The stroke in progress.
   * @returns The edit, or null.
   */
  edit(_tx: number, _ty: number, _state: EditorState, _stroke: Stroke): MapEdit | null {
    return null;
  }

  /**
   * What a button going down on a tile does.
   *
   * @param ctrl - The editor's mouse, with its renderer, state, and batch.
   * @param e - The pointer event.
   * @param tile - The tile under the cursor.
   */
  abstract press(ctrl: MapEditController, e: React.PointerEvent<HTMLDivElement>, tile: TileRef): void;
}
