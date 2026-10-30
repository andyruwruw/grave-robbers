// Packages
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

/**
 * Chip meshes in the pool, reused oldest first.
 */
export const POOL_SIZE = 240;

/**
 * Chips thrown off a gathered tile per hit.
 */
export const CHIPS_PER_HIT = 7;

/**
 * Seconds a chip or puff flies.
 */
export const LIFETIME = 0.7;

/**
 * Seconds a glowing spark flies.
 */
export const SPARK_LIFETIME = 0.28;

/**
 * Seconds a flung clod flies.
 */
export const FLING_LIFETIME = 1.1;

/**
 * Seconds a flame chip flies.
 */
export const FLAME_LIFETIME = 0.4;

/**
 * How fast whirl sparks fly round, in world units per second.
 */
export const WHIRL_SPEED = 6;

/**
 * Pull on falling chips, in world units per second squared.
 */
export const GRAVITY = 9;

/**
 * Chip colors for each gathered material.
 */
export const CHIP_COLORS = { wood: RESOURCE_COLORS.wood, stone: '#80848d' };
