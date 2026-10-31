// Types
import type { Material } from '@halloween/shared/goods/goods';

/**
 * Materials a pile shows as their bag model, since they have no heap of
 * their own.
 */
export const MODELED: Material[] = ['ectoplasm', 'chain', 'cursed-core', 'pumpkin', 'watering-can', 'holy-water', 'brute-tendon', 'ghoul-fang', 'hex-shard', 'brimstone'];

/**
 * Most pieces of one resource a pile shows.
 */
export const MAX_PIECES = 5;

/**
 * The glint's color.
 */
export const GLINT = '#fff6d8';

/**
 * A wrapped candy, as on the phone: yellow with orange twisted ends.
 */
export const CANDY_BODY = '#f5c62e';

/**
 * A candy's band and twisted ends.
 */
export const CANDY_ENDS = '#f07a18';

/**
 * A blood drop hovers over every blood puddle, bobbing, so it reads as
 * something to pick up: its height (tiles), bob depth, and bob rate.
 */
export const DROP_HEIGHT = 0.26;

/**
 * How far the blood drop bobs (see DROP_HEIGHT).
 */
export const DROP_BOB = 0.04;

/**
 * How fast the blood drop bobs (see DROP_HEIGHT).
 */
export const DROP_RATE = 2.4;

/**
 * Gear on the ground glints now and then so it can be found in the dark:
 * how often (radians per second) and how high above the item.
 */
export const GLINT_RATE = 3;

/**
 * How high the glint sits above gear (see GLINT_RATE).
 */
export const GLINT_HEIGHT = 0.12;

/**
 * Blood is drawn bright so a pile reads in the dark.
 */
export const BLOOD_GLOW = '#c8141f';

/**
 * Eye sockets of a skull in a pile of bones, a bright edge on silver, and
 * the lighter edge of a bloodsteel ingot.
 */
export const SOCKET = '#1a1210';

/**
 * The bright edge on silver nuggets.
 */
export const SILVER_SHINE = '#f4f8fc';

/**
 * The lighter edge of a bloodsteel ingot.
 */
export const BLOODSTEEL_EDGE = '#a8243a';

/**
 * Tonic bottle glass.
 */
export const VIAL_GLASS = '#a8bcc4';
