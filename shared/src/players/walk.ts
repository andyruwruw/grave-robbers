// Local Imports
import { BLOCK_SLOW } from '../gear/defs/offhand';
import { GEAR } from '../gear/gear-catalog';
import { HEAVY_SWING_SLOW } from '../gear/melee-rules';
import { RELOAD_SLOW } from '../gear/ranged-rules';
import { GHOST_SLOW } from '../monsters/kinds/ghost';
import { BARBED_PLAYER_SLOW } from '../structures/traps';
import { moveWithCollision, walkerBlocked } from '../world/collision';
import { inTrunk } from '../world/trees';
import { PLAYER_RADIUS, PLAYER_SPEED, TREE_SLOW } from './movement';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { WorldMap } from '../world/world-map';

/**
 * What slows a walking player down, besides the ground under them.
 */
export interface WalkState {
  /**
   * Slowed by ectoplasm or a witch's puddle.
   */
  slowed: boolean;

  /**
   * Holding a shield up.
   */
  blocking: boolean;

  /**
   * Winding up or following through a heavy blow.
   */
  bracing: boolean;

  /**
   * Reloading a crossbow.
   */
  reloading: boolean;

  /**
   * The armor worn, if any.
   */
  armor: GearKind | null;
}

/**
 * How fast (tiles a second) a player at (x, y) walks: PLAYER_SPEED, slowed
 * by ectoplasm, a raised shield, a heavy swing, a reload, heavy armor,
 * barbed wire, and tree trunks. The server moves players with this, and
 * /play predicts its own player's walk with the same numbers.
 *
 * @param map The map.
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param s What else slows them.
 * @returns Their speed in tiles a second.
 */
export function walkSpeed(map: WorldMap, x: number, y: number, s: WalkState): number {
  return PLAYER_SPEED
    * (s.slowed ? GHOST_SLOW : 1)
    * (s.blocking ? BLOCK_SLOW : 1)
    * (s.bracing ? HEAVY_SWING_SLOW : 1)
    * (s.reloading ? RELOAD_SLOW : 1)
    * (s.armor ? GEAR[s.armor].speed ?? 1 : 1)
    * (map.get(Math.floor(x), Math.floor(y)) === 'barbed-wire' ? BARBED_PLAYER_SLOW : 1)
    * (inTrunk(map, x, y) ? TREE_SLOW : 1);
}

/**
 * Moves a player by (dx, dy) as far as the map lets them (and, being
 * knocked back, over the edge of a chasm).
 *
 * @param map The map.
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param dx How far to move along x.
 * @param dy How far to move along y.
 * @param intoChasm Whether they may be pushed over a chasm's edge.
 * @returns Where they end up.
 */
export function walk(map: WorldMap, x: number, y: number, dx: number, dy: number, intoChasm = false): { x: number; y: number } {
  return moveWithCollision(walkerBlocked(map, x, y, PLAYER_RADIUS, undefined, intoChasm), x, y, dx, dy, PLAYER_RADIUS);
}

/**
 * A joystick or WASD vector as a player walks it: snapped to one of 8
 * directions, at most full speed. (0, 0) stands still.
 *
 * @param x The stick's x.
 * @param y The stick's y.
 * @returns The snapped vector.
 */
export function steerOf(x: number, y: number): { x: number; y: number } {
  const len = Math.min(1, Math.hypot(x, y));
  if (len === 0) {
    return { x: 0, y: 0 };
  }
  const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
  return { x: Math.cos(angle) * len, y: Math.sin(angle) * len };
}
