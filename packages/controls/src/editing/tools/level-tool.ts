// Local Imports
import { BrushTool } from './brush-tool';

// Types
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { EditorState, Stroke } from '../../types/map-editor';

/**
 * Raise or lower: tiles at the level the stroke starts on move one level.
 */
export abstract class LevelTool extends BrushTool {
  /**
   * Moves a tile from the stroke's starting level to its target level.
   *
   * @param tx - The tile's column.
   * @param ty - The tile's row.
   * @param state - The editor's state.
   * @param stroke - The stroke in progress.
   * @returns The level edit.
   */
  edit(tx: number, ty: number, state: EditorState, stroke: Stroke): MapEdit {
    return { op: 'level', tx, ty, size: state.size, level: stroke.level, from: stroke.from };
  }
}
