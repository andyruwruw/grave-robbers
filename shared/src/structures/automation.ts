// Types
import type { Tile } from '../world/tiles';

/**
 * A bone digger stands on a grave and digs it up again every
 * DIGGER_SECONDS at level 0 (about as long as a dug grave takes to fill),
 * turning up what a grave dug by hand would (no blueprints).
 */
export const DIGGER_SECONDS = 240;

/**
 * How many goods a bone digger holds for its builder before it stops
 * digging (what a station or belt beside it takes doesn't count).
 */
export const DIGGER_CAPACITY = 60;

/**
 * Tiles a bone digger can stand on: graves and mounds.
 */
export const DIGGER_FLOORS: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross', 'mound']);

/**
 * Conveyor belts carry anything lying on them (piles and dropped items)
 * BELT_SPEED tiles a second the way they were laid, up to the edge of
 * whatever isn't a belt (a station there takes it in).
 */
export const BELT_SPEED = 1.5;

/**
 * Tiles that carry things: belts, and sorters (which pick each thing's
 * way, see `SORT_SIDES`). Each holds one thing at a time.
 */
export const CONVEYORS: ReadonlySet<Tile> = new Set<Tile>(['belt', 'sorter']);

/**
 * Seconds between a belt pulling things out of what's behind or beside
 * it (a storage chest, a bone digger, or a station's finished goods), and
 * the most of one good it pulls at once.
 */
export const BELT_PULL_SECONDS = 0.6;
export const BELT_PULL_STACK = 10;

/**
 * How much a station, digger, or fountain with a belt leading away holds
 * for the belt to pull before a station stops working (diggers and
 * fountains drop the rest beside them, as with no belt).
 */
export const OUTPUT_HOLD = 10;
