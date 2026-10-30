/**
 * A ghoul's pounce: how far it leaps along its aim and how long the leap
 * takes.
 */
export const GHOUL_LEAP = 3.6;

/**
 * Seconds a ghoul's leap takes.
 */
export const GHOUL_LEAP_TIME = 0.32;

/**
 * A ghoul that sees someone but can't pounce yet runs circles around them
 * GHOUL_ORBIT tiles out (within GHOUL_CIRCLE tiles), switching direction
 * every few seconds or when it runs into something.
 */
export const GHOUL_ORBIT = 3;

/**
 * Tiles within which a ghoul circles someone instead of chasing them.
 */
export const GHOUL_CIRCLE = 7;

/**
 * A ghoul only pounces from at least this far, so there's always a leap
 * to sidestep.
 */
export const GHOUL_MIN_POUNCE = 2;
