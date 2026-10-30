// Types
import type { LucideIcon } from 'lucide-react';
import type { Blend } from '@halloween/shared/map-editor/blend/blend';
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * The map editor's tools.
 */
export type EditToolId = 'raise' | 'lower' | 'stairs' | 'paint' | 'mix' | 'pick' | 'erase';

/**
 * What the map editor will do on a click: the tool, its brush size, and
 * the tile it paints.
 */
export interface EditorState {
  /**
   * The picked tool.
   */
  tool: EditToolId;

  /**
   * The brush's width in tiles.
   */
  size: number;

  /**
   * What Paint lays down: the palette entry's label (to show which is
   * picked), its tile, and the tiles it mixes at random, if any.
   */
  label: string;

  /**
   * The tile Paint lays down.
   */
  tile: Tile;

  /**
   * The tiles Paint mixes in at random, if any.
   */
  mix?: Tile[];

  /**
   * Share of the brush's tiles Paint fills (1 is all of them).
   */
  scatter: number;

  /**
   * The Mix brush's shares of each kind of scenery.
   */
  blend: Blend;

  /**
   * The view while editing: flat daylight, monsters hidden, and the camera
   * looking nearly straight down (so walls don't hide the tiles behind
   * them).
   */
  flat: boolean;

  /**
   * Whether monsters are hidden while editing.
   */
  hideMonsters: boolean;

  /**
   * Whether the camera looks nearly straight down while editing.
   */
  topView: boolean;
}

/**
 * One brush stroke: the tiles it already touched, the level it started on,
 * and the level raise or lower takes them to.
 */
export interface Stroke {
  /**
   * Tile keys (`ty * 1000 + tx`) already edited in this stroke.
   */
  seen: Set<number>;

  /**
   * The level of the tile the stroke started on.
   */
  from: number;

  /**
   * The level raise or lower moves tiles to.
   */
  level: number;
}

/**
 * Where a flight of stairs would go, and which way it climbs.
 */
export interface StairsPlacement {
  /**
   * The foot tile's column.
   */
  tx: number;

  /**
   * The foot tile's row.
   */
  ty: number;

  /**
   * Index into `RAMP_DIRS` of the way it climbs.
   */
  dir: number;
}

/**
 * A tile the cursor points at.
 */
export interface TileRef {
  /**
   * The tile's column.
   */
  tx: number;

  /**
   * The tile's row.
   */
  ty: number;
}

/**
 * One tile along the line of sight under the mouse: the tile, and the
 * exact ground point hit on it.
 */
export interface TileHit extends TileRef {
  /**
   * The hit point's x, in tiles.
   */
  x: number;

  /**
   * The hit point's y, in tiles.
   */
  y: number;
}

/**
 * One view switch in the map editor.
 */
export interface ViewSwitch {
  /**
   * The editor setting it flips.
   */
  key: 'flat' | 'hideMonsters' | 'topView';

  /**
   * Its name.
   */
  label: string;
}

/**
 * One tool button in the map editor.
 */
export interface ToolInfo {
  /**
   * The tool it picks.
   */
  tool: EditToolId;

  /**
   * Its name.
   */
  label: string;

  /**
   * Its icon.
   */
  icon: LucideIcon;

  /**
   * How to use it, shown under the tools.
   */
  hint: string;
}
