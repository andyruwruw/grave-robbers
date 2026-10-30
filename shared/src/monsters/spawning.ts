/**
 * Trickle spawning: a base number of monsters plus more per living player,
 * and seconds between spawns while under the cap. The blood moon raises
 * both.
 */
export const BASE_MONSTERS = 2;

/**
 * More monsters allowed out per living player.
 */
export const MONSTERS_PER_PLAYER = 4;

/**
 * Seconds between spawns while under the cap.
 */
export const SPAWN_INTERVAL = 4.5;

/**
 * Monsters per living player during a blood moon.
 */
export const BLOOD_MOON_MONSTERS_PER_PLAYER = 7;

/**
 * Seconds between spawns during a blood moon.
 */
export const BLOOD_MOON_SPAWN_INTERVAL = 1;

/**
 * Most monsters out at once, however many play.
 */
export const MAX_MONSTERS = 60;

/**
 * Zombies kept shambling around while nobody is playing, so the TV is never
 * empty. The server starts with that many already out.
 */
export const IDLE_ZOMBIES = 10;

/**
 * One ghost per this many burning built lights (fewer lights per ghost
 * during a blood moon), at most one new ghost every GHOST_SPAWN_INTERVAL.
 */
export const LIGHTS_PER_GHOST = 3;

/**
 * Burning built lights per ghost during a blood moon.
 */
export const BLOOD_MOON_LIGHTS_PER_GHOST = 2;

/**
 * Least seconds between new ghosts.
 */
export const GHOST_SPAWN_INTERVAL = 20;

/**
 * Monsters appear near the map edge, at least this far from every player.
 */
export const SPAWN_EDGE = 5;

/**
 * Least tiles from every player a monster spawns.
 */
export const SPAWN_MIN_DISTANCE = 10;

/**
 * A huge world has no edge to come from: monsters appear on a dark spot
 * SPAWN_MIN_DISTANCE to SPAWN_RING_MAX tiles from a random player, and
 * any that stray DESPAWN_DISTANCE from every player for DESPAWN_AFTER
 * seconds are gone. No zombies are kept out while nobody plays.
 */
export const SPAWN_RING_MAX = 24;

/**
 * Tiles from every player past which a monster in a huge world starts to fade.
 */
export const DESPAWN_DISTANCE = 44;

/**
 * Seconds a monster stays that far off before it's gone.
 */
export const DESPAWN_AFTER = 8;
