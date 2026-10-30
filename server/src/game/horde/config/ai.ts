/**
 * Backing off (see `Kiter.backOff`): the directions tried either side of
 * straight away from the prey.
 */
export const FLEE_FAN = [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2, -2, 2.6, -2.6];

/**
 * How far each probe of a backing-off direction moves (tiles).
 */
export const FLEE_PROBE_STEP = 0.25;

/**
 * How many probe steps each backing-off direction gets.
 */
export const FLEE_PROBE_STEPS = 8;

/**
 * How often a backing-off heading that still works is reconsidered
 * (seconds).
 */
export const FLEE_RETHINK = 0.8;

/**
 * Speed multiplier for a shooter backing away.
 */
export const FLEE_HASTE = 1.3;

/**
 * Seconds between a zombie's path searches.
 */
export const ZOMBIE_REPATH = 0.6;

/**
 * Seconds between a vampire's path searches (they re-plan faster, they
 * cover ground quickly).
 */
export const VAMPIRE_REPATH = 0.3;

/**
 * Close enough to a path tile's center to move on to the next.
 */
export const WAYPOINT_REACHED = 0.15;

/**
 * Walkers push apart when closer than this.
 */
export const SEPARATION = 0.55;

/**
 * Idle ghosts drift to a random point this close, every few seconds.
 */
export const WANDER_RANGE = 5;

/**
 * Fraction of full speed for an idle zombie's shamble.
 */
export const SHAMBLE_PACE = 0.4;

/**
 * Fraction of full speed for an idle vampire's prowl.
 */
export const PROWL_PACE = 0.5;

/**
 * Idle zombies pick a tile this many tiles or so away (min, max) and path
 * to it.
 */
export const SHAMBLE_REACH = [3, 8] as const;

/**
 * A zombie making no headway for this many seconds stops and picks
 * somewhere else.
 */
export const BUMP_GIVE_UP = 0.8;

/**
 * A shambling zombie weaves side to side by up to this many radians.
 */
export const SHAMBLE_WEAVE = 0.3;

/**
 * About how many times a second a shambling zombie trips.
 */
export const STUMBLE_RATE = 0.12;

/**
 * How fast a trip lurches it (tiles/s).
 */
export const STUMBLE_SPEED = 1.6;

/**
 * How long a trip's lurch lasts (seconds).
 */
export const STUMBLE_TIME = 0.3;

/**
 * A ghost drains a light from this close to its center.
 */
export const GHOST_HOVER = 0.5;
