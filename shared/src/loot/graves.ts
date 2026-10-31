// Types
import type { Tile } from '../world/tiles';

/**
 * Graves a player can dig up: hits it takes (each weapon chop counts), and
 * how long (seconds) the mound left behind waits before a new gravestone
 * rises from it.
 */
export const GRAVE_TILES: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross']);

/**
 * Hits it takes to dig up a grave.
 */
export const DIG_HITS = 3;

/**
 * Least seconds before a new gravestone rises from a mound.
 */
export const MOUND_REFILL_MIN = 180;

/**
 * Up to this many more seconds, at random, before it does.
 */
export const MOUND_REFILL_SPREAD = 120;

/**
 * What a dug-up grave gives, until there are proper loot tables: always
 * some candy (what the skill tree runs on), maybe wood or bones, maybe a
 * blueprint (never gear: that only comes from chests and pumpkins).
 */
export const DIG_CANDY: [number, number] = [2, 3];

/**
 * Wood a dug-up grave can give (min, max).
 */
export const DIG_WOOD: [number, number] = [1, 2];

/**
 * Chance a dug-up grave gives wood.
 */
export const DIG_WOOD_CHANCE = 0.5;

/**
 * Chance a dug-up grave gives a blueprint.
 */
export const DIG_BLUEPRINT_CHANCE = 0.25;

/**
 * Bones a dug-up grave can give (min, max).
 */
export const DIG_BONES: [number, number] = [1, 4];

/**
 * Landmarks that can be robbed like graves but stay standing: statues (the
 * courtyards' special graves), crypts, and mausoleums. Each takes ROB_HITS
 * digs, gives richer loot than a grave (ROB_CANDY candy, bones, a chance at
 * gear and a blueprint), and then stays robbed for ROB_REFILL seconds. A
 * crypt or mausoleum is robbed as a whole, whichever wall is dug at.
 */
export const ROBBABLE: ReadonlySet<Tile> = new Set<Tile>(['statue', 'crypt', 'mausoleum']);

/**
 * Digs it takes to rob a landmark.
 */
export const ROB_HITS = 5;

/**
 * Seconds a robbed landmark stays robbed.
 */
export const ROB_REFILL = 600;

/**
 * Candy each kind of landmark gives when robbed (min, max).
 */
export const ROB_CANDY: Record<'statue' | 'crypt' | 'mausoleum', [number, number]> = { statue: [6, 10], crypt: [8, 14], mausoleum: [4, 8] };

/**
 * Chance a robbed landmark gives a blueprint.
 */
export const ROB_BLUEPRINT_CHANCE = 0.5;

/**
 * Chance a dug-up grave gives bones.
 */
export const DIG_BONE_CHANCE = 0.8;

/**
 * Chance a dug-up grave leaves headstone rubble, and how much stone it gives.
 */
export const DIG_STONE_CHANCE = 0.25;

/**
 * Stone from a grave's headstone rubble, least to most.
 */
export const DIG_STONE: [number, number] = [1, 2];
