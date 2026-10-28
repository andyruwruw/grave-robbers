/**
 * Body colors a player can pick. Game content, not UI chrome.
 */
export const PLAYER_COLORS = [
  '#e8742a',
  '#8b3fd9',
  '#3fb950',
  '#d93f5b',
  '#3f8bd9',
  '#e8c547',
  '#e0e0e0',
  '#40c4b4',
];

/**
 * Most players allowed in at once.
 */
export const MAX_PLAYERS = 8;

/**
 * Longest allowed player name.
 */
export const MAX_NAME_LENGTH = 14;

/**
 * Movement speed in tiles per second.
 */
export const PLAYER_SPEED = 4;

/**
 * Panic (from the phone's skill tree screen): the player runs from any
 * monster within PANIC_RANGE tiles for PANIC_SECONDS, then walks back to
 * where they were (still dodging any monster within three quarters of that range),
 * giving up after PANIC_RETURN_SECONDS.
 */
export const PANIC_RANGE = 4;
export const PANIC_SECONDS = 1;
export const PANIC_RETURN_SECONDS = 1;

/**
 * Collision radius in tiles.
 */
export const PLAYER_RADIUS = 0.3;

/**
 * Hearts at full health.
 */
export const MAX_HP = 10;

/**
 * Health never comes back on its own: a burning campfire mends whoever
 * rests beside it, a tonic heals on the spot, and the ritual knife's kills
 * mend slowly. Damage taken in the last FRESH_WOUND_SECONDS can't be healed
 * yet (the phone and TV show it grey).
 */
export const CAMPFIRE_HEAL_PER_SECOND = 1 / 4;
export const FEAST_HEAL_PER_SECOND = 1 / 2;
export const FRESH_WOUND_SECONDS = 10;
export const CAMPFIRE_HEAL_RADIUS = 2;

/**
 * Seconds from pressing Action to the swing landing, matching the moment
 * the axe comes down on the TV.
 */
export const STRIKE_DELAY = 0.22;

/**
 * Height in combat. A swing (or a monster's bite) reaches down as far as
 * MELEE_REACH_DOWN but up only MELEE_REACH_UP, so whoever stands a level
 * higher can hit without being hit back. It also does HIGH_GROUND_BONUS more
 * damage to a target at least HIGH_GROUND lower. Crossbow bolts fly
 * BOLT_RANGE_PER_LEVEL tiles further for each level the shooter stands
 * above the ground. Being knocked off a drop of at least FALL_MIN hurts
 * FALL_DAMAGE per level fallen.
 */
export const MELEE_REACH_DOWN = 1.8;
export const MELEE_REACH_UP = 0.6;
export const HIGH_GROUND = 0.5;
export const HIGH_GROUND_BONUS = 1;
export const BOLT_RANGE_PER_LEVEL = 2;
export const FALL_MIN = 0.6;
export const FALL_DAMAGE = 1;

/**
 * Distance (tiles) a hit shoves its target, and over how long.
 */
export const KNOCKBACK_DISTANCE = 1;

/**
 * Players walk at this fraction of their speed through a tree's trunk.
 */
export const TREE_SLOW = 0.5;
export const KNOCKBACK_TIME = 0.2;

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
export const SPAWN_PROTECTION = 10;
