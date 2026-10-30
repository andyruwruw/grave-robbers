// Packages
import {
  ArrowDown,
  ArrowUp,
  ChevronsUp,
  Eraser,
  Paintbrush,
  Pipette,
  Trees,
} from 'lucide-react';

// Types
import type { EditorState, ToolInfo, ViewSwitch } from '../types/map-editor';

/**
 * The map editor's view switches, in order.
 */
export const VIEW: ViewSwitch[] = [
  { key: 'topView', label: 'Top-down view' },
  { key: 'flat', label: 'Flat lighting' },
  { key: 'hideMonsters', label: 'Hide monsters' },
];

/**
 * The map editor's tools, in the order the grid shows them.
 */
export const TOOL_INFO: ToolInfo[] = [
  { tool: 'raise', label: 'Raise', icon: ArrowUp, hint: 'Click or drag: tiles at the level you start on go up one (others stay). Scroll to reach tiles hidden behind higher ground. Trees and buildings are hidden meanwhile' },
  { tool: 'lower', label: 'Lower', icon: ArrowDown, hint: 'Click or drag: tiles at the level you start on go down one (others stay). Scroll to reach tiles hidden behind higher ground. Trees and buildings are hidden meanwhile' },
  { tool: 'stairs', label: 'Stairs', icon: ChevronsUp, hint: 'The yellow flight shows the stairs you would place: point at the foot of a rise, or at the top of a wall to put them at its foot. Right click cycles the ways that work, left click places it. On stairs already there, left click deletes them and right click turns them. Scroll to reach tiles hidden behind higher ground' },
  { tool: 'paint', label: 'Paint', icon: Paintbrush, hint: 'Drag to paint the picked tile, grave, light, landmark, or structure; Fill below 100% scatters it (good for trees and graves)' },
  { tool: 'mix', label: 'Mix', icon: Trees, hint: 'Drag to spread the shares below evenly over grass and scenery (paths, paving, stairs, and buildings stay). Painting the same mix again changes nothing; graves skip spots at the edge of a drop or the foot of a rise' },
  { tool: 'pick', label: 'Pick', icon: Pipette, hint: 'Click an area to copy its mix into the Mix brush: the mix it was painted with, or else what grows there now' },
  { tool: 'erase', label: 'Erase', icon: Eraser, hint: 'Drag to clear back to grass: structures come down and anything lying on the ground goes' },
];

/**
 * Smallest area (tiles across) the picker measures on ground that was never
 * mixed.
 */
export const PICK_SIZE = 5;

/**
 * Fewest ms between batches of edits sent while dragging.
 */
export const EDIT_SEND_MS = 90;

/**
 * How near the back edge of a block (in tiles) the Stairs tool picks the
 * stairs climbing up to it instead: stairs that climb toward the camera are
 * seen almost edge on, as a sliver along that edge.
 */
export const STAIRS_EDGE = 0.4;

/**
 * The map editor's first settings, until it's been opened once.
 */
export const DEFAULT_EDITOR_STATE: EditorState = { tool: 'raise', size: 3, label: 'Tree', tile: 'tree', scatter: 1, blend: { tree: 15, rock: 3, tombstone: 4, cross: 2, pumpkin: 1 }, flat: true, hideMonsters: true, topView: true };
