/**
 * Trickle spawning: a base number of monsters plus more per living player,
 * and seconds between spawns while under the cap. A world event's
 * `spawning` effect can replace either.
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
 * Most monsters out at once, however many play.
 */
export const MAX_MONSTERS = 60;

/**
 * Zombies kept shambling around while nobody is playing, so the TV is never
 * empty. The server starts with that many already out.
 */
export const IDLE_ZOMBIES = 10;

/**
 * One ghost per this many burning built lights (a world event's
 * `spawning` effect can change it), at most one new ghost every GHOST_SPAWN_INTERVAL.
 */
export const LIGHTS_PER_GHOST = 3;

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

/**
 * On a huge world each player has their own cap and spawn clock, so one
 * far from the others still feels the horde: the cap counts the walkers
 * within PRESSURE_RADIUS tiles of them, and is BASE_MONSTERS plus the
 * per-player number for every player within that reach (them included),
 * whose clocks slow to match, so a group together gets what it would on a
 * small map. MAX_MONSTERS still holds across the world.
 */
export const PRESSURE_RADIUS = 30;
