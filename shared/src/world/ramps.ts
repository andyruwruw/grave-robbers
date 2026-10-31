// Types
import type { Tile } from './tiles';

/**
 * Tiles that ramp from their own level up to the higher neighbor they lead
 * to: stone stairs and built wooden steps.
 */
export const RAMPS: ReadonlySet<Tile> = new Set<Tile>(['stairs', 'steps']);

/**
 * Tiles that keep a turn (`ramps`): stairs and steps, which way they
 * climb, conveyor belts, which way they carry, and walls, which way they
 * face and which look they were built with (see `turnCode`).
 */
export const KEEPS_TURN: ReadonlySet<Tile> = new Set<Tile>([...RAMPS, 'belt', 'sorter', 'wood-wall', 'stone-wall', 'bone-wall']);

/**
 * How many looks a tile's turn can carry (see `turnCode`).
 */
export const MAX_STYLES = 8;

/**
 * The biggest turn code a tile can hold.
 */
export const MAX_TURN_CODE = 4 * MAX_STYLES;

/**
 * A tile's turn code: 0 for no turn, else 1 + its way (an index into
 * RAMP_DIRS) + 4 x its look (a cosmetic variant, 0 for the plain one). One
 * number per tile, so a wall's look travels, saves, and loads everywhere
 * its turn does.
 * @param dir Its way, or null for none.
 * @param style Its look.
 * @returns The code.
 */
export function turnCode(dir: number | null, style = 0): number {
  return dir === null ? 0 : 1 + dir + 4 * style;
}

/**
 * The way in a turn code.
 * @param code The code.
 * @returns An index into RAMP_DIRS, or null for none.
 */
export function turnDir(code: number): number | null {
  return code > 0 ? (code - 1) % 4 : null;
}

/**
 * The look in a turn code.
 * @param code The code.
 * @returns The look (0 for the plain one).
 */
export function turnStyle(code: number): number {
  return code > 0 ? Math.floor((code - 1) / 4) : 0;
}

/**
 * The four tile neighbors' offsets: east, west, south, north.
 */
export const CARDINAL_DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * The four ways stairs can be turned to climb (east, west, south, north), in
 * the order the map editor cycles through them.
 */
export const RAMP_DIRS: readonly [number, number][] = CARDINAL_DIRS;
