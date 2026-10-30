// Local Imports
import { EraseTool } from './erase-tool';
import { LowerTool } from './lower-tool';
import { MixTool } from './mix-tool';
import { PaintTool } from './paint-tool';
import { PickTool } from './pick-tool';
import { RaiseTool } from './raise-tool';
import { StairsTool } from './stairs-tool';

// Types
import type { EditToolId } from '../../types/map-editor';
import type { EditTool } from './edit-tool';

/**
 * One instance of each map editor tool, by id. The tools hold no state, so
 * every editor shares them.
 */
export const EDIT_TOOLS: Record<EditToolId, EditTool> = {
  raise: new RaiseTool(),
  lower: new LowerTool(),
  stairs: new StairsTool(),
  paint: new PaintTool(),
  mix: new MixTool(),
  pick: new PickTool(),
  erase: new EraseTool(),
};
