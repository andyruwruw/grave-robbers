/**
 * Blood on the ground: how many splats exist at once (the oldest is reused),
 * how long one stays before it starts drying away, and how long that takes.
 */
export const SPLAT_POOL = 700;

/**
 * Seconds a splat stays before it starts drying away.
 */
export const SPLAT_LIFE = 40;

/**
 * Seconds a splat takes to dry away.
 */
export const SPLAT_FADE = 6;

/**
 * Pumpkin seeds: their color and how long they lie there (plus a quick
 * fade).
 */
export const SEED = '#efe2b8';

/**
 * Seconds a seed lies there, from least to most.
 */
export const SEED_LIFE = [1.2, 2.2];

/**
 * Seconds a seed takes to fade.
 */
export const SEED_FADE = 0.6;

/**
 * Pieces of a dead monster: gravity (world units per second squared), how
 * fast they're thrown, how long they lie there, and how long they take to
 * sink into the ground.
 */
export const GRAVITY = 16;

/**
 * How fast a piece is thrown sideways, from least to most.
 */
export const GIB_SPEED = [1.6, 4.2];

/**
 * How far splats sit above the ground line: over the tallest grass
 * sub-voxel (+0.05), or patches of a tile would poke through.
 */
export const SPLAT_LIFT = 0.055;

/**
 * How fast a piece is thrown up, from least to most.
 */
export const GIB_LIFT = [2.4, 5];

/**
 * Fastest a piece tumbles, in radians per second.
 */
export const GIB_SPIN = 14;

/**
 * Seconds a piece lies there before it sinks.
 */
export const GIB_LIFE = 9;

/**
 * Seconds a piece takes to sink into the ground.
 */
export const GIB_SINK = 1.5;

/**
 * Broken things (walls, pumpkins, trees) fly a little less far than bodies
 * and are cleared sooner.
 */
export const DEBRIS_SPEED = 0.7;

/**
 * Seconds broken pieces lie there before they sink.
 */
export const DEBRIS_LIFE = 5;
