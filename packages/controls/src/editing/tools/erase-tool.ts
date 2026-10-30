// Local Imports
import { BrushTool } from './brush-tool';

// Types
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { EditorState } from '../../types/map-editor';

/**
 * Erase: clears back to grass.
 */
export class EraseTool extends BrushTool {
  /**
   * The tool's id.
   */
  readonly id = 'erase';

  /**
   * Erases one tile.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   * @param state - The editor's state.
   * @returns The erase edit.
   */
  edit(tx: number, ty: number, state: EditorState): MapEdit {
    return { op: 'erase', tx, ty, size: state.size };
  }
}
