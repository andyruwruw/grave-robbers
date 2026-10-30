// Packages
import { MAX_LEVEL, MIN_LEVEL } from '@halloween/shared/world/dimensions';

// Local Imports
import { EditTool } from './edit-tool';

// Types
import type React from 'react';
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { EditorState, Stroke, TileRef } from '../../types/map-editor';
import type { MapEditController } from '../map-edit-controller';

/**
 * A tool that paints strokes: the left button starts one on the tile it
 * goes down on (remembering that tile's level and the level raise or lower
 * takes it to), and every tile the stroke reaches gets the tool's edit.
 */
export abstract class BrushTool extends EditTool {
  /**
   * Which way a stroke moves the level: up one, except for Lower.
   *
   * @returns 1 or -1.
   */
  protected levelDelta(): number {
    return 1;
  }

  /**
   * Starts a stroke with the left button and edits the first tile.
   *
   * @param ctrl - The editor's mouse.
   * @param e - The pointer event.
   * @param tile - The tile under the cursor.
   */
  press(ctrl: MapEditController, e: React.PointerEvent<HTMLDivElement>, tile: TileRef): void {
    if (e.button !== 0) {
      return;
    }
    const { tx, ty } = tile;
    const from = ctrl.renderer.levelAt(tx, ty);
    ctrl.stroke = { seen: new Set(), from, level: Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, from + this.levelDelta())) };
    e.currentTarget.setPointerCapture(e.pointerId);
    ctrl.apply(tx, ty);
  }

  /**
   * The edit a stroke makes on one tile.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   * @param state - The editor's state.
   * @param stroke - The stroke in progress.
   * @returns The edit.
   */
  abstract override edit(tx: number, ty: number, state: EditorState, stroke: Stroke): MapEdit;
}
