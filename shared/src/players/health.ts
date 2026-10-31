/**
 * Hearts at full health.
 */
export const MAX_HP = 10;

/**
 * Health never comes back on its own: a burning campfire mends whoever
 * rests beside it, a tonic heals on the spot, and the ritual knife's kills
 * mend slowly. Damage taken in the last FRESH_WOUND_SECONDS can't be healed
 * yet (the phone and TV show it grey). At level 0 a campfire takes a
 * full minute to mend all MAX_HP.
 */
export const CAMPFIRE_HEAL_PER_SECOND = 1 / 6;

/**
 * How much faster a campfire mends per level of its builder (+10% a level,
 * so level 3 mends all MAX_HP in about 46s).
 */
export const CAMPFIRE_HEAL_PER_LEVEL = 0.1;

/**
 * Hearts a second the ritual knife's kills mend.
 */
export const FEAST_HEAL_PER_SECOND = 1 / 2;

/**
 * Seconds a wound stays fresh (can't be healed yet).
 */
export const FRESH_WOUND_SECONDS = 10;

/**
 * Tiles from a burning campfire within which it mends.
 */
export const CAMPFIRE_HEAL_RADIUS = 2;

/**
 * Least drop (world units) a knocked-off player is hurt by (see
 * `players/combat.ts`).
 */
export const FALL_MIN = 0.6;

/**
 * What a player knocked into a chasm is killed by (the death screen and
 * kill feed show it).
 */
export const CHASM_DEATH = 'the abyss';

/**
 * Damage per level fallen from a drop of at least FALL_MIN.
 */
export const FALL_DAMAGE = 1;

/**
 * Damage per second while standing on spikes.
 */
export const SPIKE_DAMAGE_PER_SECOND = 2;

/**
 * Hearts one tonic gives back.
 */
export const TONIC_HEAL = 4;

/**
 * Share of a player's candy and blood that's gone for good when they die
 * (the bag spills where they fell; what they wear stays on them).
 */
export const DEATH_TOLL = 0.5;

/**
 * Seconds dead before respawning, and of spawn protection afterwards.
 */
export const RESPAWN_DELAY = 5;

/**
 * Seconds of spawn protection after respawning.
 */
export const SPAWN_PROTECTION = 10;
