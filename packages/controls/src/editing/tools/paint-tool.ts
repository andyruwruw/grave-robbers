// Local Imports
import { BrushTool } from './brush-tool';

// Types
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { EditorState } from '../../types/map-editor';

/**
 * Paint: lays the picked tile (mixed with others, or scattered, if set).
 */
export class PaintTool extends BrushTool {
  /**
   * The tool's id.
   */
  readonly id = 'paint';

  /**
   * Paints one tile.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   * @param state - The editor's state.
   * @returns The tile edit.
   */
  edit(tx: number, ty: number, state: EditorState): MapEdit {
    const { size, tile, mix, scatter } = state;
    return { op: 'tile', tx, ty, size, tile, ...(mix ? { mix } : {}), ...(scatter < 1 ? { scatter } : {}) };
  }
}
