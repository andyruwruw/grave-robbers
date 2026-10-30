// Types
import type { Tile } from './tiles';

/**
 * Tiles that ramp from their own level up to the higher neighbor they lead
 * to: stone stairs and built wooden steps.
 */
export const RAMPS: ReadonlySet<Tile> = new Set<Tile>(['stairs', 'steps']);

/**
 * Tiles that keep a turn (`ramps`): stairs and steps, which way they
 * climb, and conveyor belts, which way they carry.
 */
export const KEEPS_TURN: ReadonlySet<Tile> = new Set<Tile>([...RAMPS, 'belt']);

/**
 * The four tile neighbors' offsets: east, west, south, north.
 */
export const CARDINAL_DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * The four ways stairs can be turned to climb (east, west, south, north), in
 * the order the map editor cycles through them.
 */
export const RAMP_DIRS: readonly [number, number][] = CARDINAL_DIRS;
