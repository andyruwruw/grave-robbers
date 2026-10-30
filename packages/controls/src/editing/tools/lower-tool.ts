// Local Imports
import { LevelTool } from './level-tool';

/**
 * Lower: tiles at the level the stroke starts on go down one.
 */
export class LowerTool extends LevelTool {
  /**
   * The tool's id.
   */
  readonly id = 'lower';

  /**
   * Strokes go down a level.
   *
   * @returns -1.
   */
  protected override levelDelta(): number {
    return -1;
  }
}
