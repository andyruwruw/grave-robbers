// Local Imports
import { BrushTool } from './brush-tool';

// Types
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { EditorState } from '../../types/map-editor';

/**
 * Mix: spreads the Mix brush's shares of scenery.
 */
export class MixTool extends BrushTool {
  /**
   * The tool's id.
   */
  readonly id = 'mix';

  /**
   * Blends one tile.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   * @param state - The editor's state.
   * @returns The blend edit.
   */
  edit(tx: number, ty: number, state: EditorState): MapEdit {
    return { op: 'blend', tx, ty, size: state.size, blend: state.blend };
  }
}
