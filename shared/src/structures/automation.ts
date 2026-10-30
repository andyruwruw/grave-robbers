// Types
import type { Tile } from '../world/tiles';

/**
 * A bone digger stands on a grave and digs it up again every
 * DIGGER_SECONDS (at level 0, about as long as a dug grave takes to fill):
 * DIGGER_BONES bones, and only now and then (DIGGER_CANDY_CHANCE) a little
 * candy.
 */
export const DIGGER_SECONDS = 120;

/**
 * Bones each dig gives (min, max).
 */
export const DIGGER_BONES: [number, number] = [1, 3];

/**
 * Chance a dig also gives candy.
 */
export const DIGGER_CANDY_CHANCE = 0.05;

/**
 * Candy that dig gives when it does (min, max).
 */
export const DIGGER_CANDY: [number, number] = [1, 2];

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
