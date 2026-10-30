// Types
import type { Tile } from '../world/tiles';
import type { Blend } from './blend/blend';

/**
 * One change from the TV's map editor, on the tile at (tx, ty) and, for
 * the brush tools, the round brush `size` tiles across around it:
 *
 * - level: sets the ground to a level, only where it's at `from` when given
 *   (the editor's raise and lower tools take the level a stroke starts on
 *   as `from` and go one above or below it, so a stroke lifts or sinks just
 *   that layer).
 * - tile: paints a tile (ground, scenery, a grave, a landmark, or a built
 *   structure, which starts out fresh; lights never burn out), or one of
 *   `mix` at random per tile, on only a `scatter` share (0 to 1) of the
 *   brush's tiles when given.
 * - erase: back to grass (a built structure comes down to what it stood on)
 *   and anything lying on the ground there is gone.
 * - blend: the Mix brush; repaints grass and scenery to the `blend`'s
 *   shares, laid out on a fixed even pattern (see `blendTile`), so the same
 *   setting twice changes nothing, and remembers the setting on each tile.
 * - stairs: puts stairs down (climbing `dir`, an index into RAMP_DIRS,
 *   when that leads up), or turns stairs already there to climb the next
 *   way that leads up (the editor deletes stairs with erase).
 */
export type MapEdit =
  /**
   * Sets the ground's level.
   */
  | { op: 'level'; tx: number; ty: number; size: number; level: number; from?: number }
  /**
   * Clears back to grass.
   */
  | { op: 'erase'; tx: number; ty: number; size: number }
  /**
   * Paints a tile.
   */
  | { op: 'tile'; tx: number; ty: number; size: number; tile: Tile; mix?: Tile[]; scatter?: number }
  /**
   * Paints with the Mix brush.
   */
  | { op: 'blend'; tx: number; ty: number; size: number; blend: Blend }
  /**
   * Puts down or turns stairs.
   */
  | { op: 'stairs'; tx: number; ty: number; dir?: number };

/**
 * The editor's brush is round, from one tile up to this many across.
 */
export const EDIT_SIZE_MIN = 1;

/**
 * The biggest brush, in tiles across.
 */
export const EDIT_SIZE_MAX = 11;

/**
 * How much of the brush a scattered paint fills, as offered by the editor.
 */
export const EDIT_SCATTER = [1, 0.5, 0.2] as const;

/**
 * Fuel given to lights placed in the editor (or loaded from a preset): far
 * more than any game lasts, so they never burn out.
 */
export const EDITOR_LIGHT_FUEL = 1e9;
