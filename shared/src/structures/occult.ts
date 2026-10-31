/**
 * Occult works: a cursed obelisk makes monsters within OBELISK_RADIUS
 * tiles (more with upgrades) take OBELISK_CURSE times the damage; a blood
 * fountain mends whoever stands by it like a campfire (and drains
 * monsters, see TRAPS); a soul cage pulls in and destroys a ghost that
 * drifts within SOUL_CAGE_RADIUS, one every SOUL_CAGE_COOLDOWN seconds.
 */
export const OBELISK_RADIUS = 4;

/**
 * Damage multiplier on monsters near a cursed obelisk.
 */
export const OBELISK_CURSE = 1.25;

/**
 * Tiles within which a soul cage pulls in a ghost.
 */
export const SOUL_CAGE_RADIUS = 3;

/**
 * Seconds between the ghosts a soul cage destroys.
 */
export const SOUL_CAGE_COOLDOWN = 6;

/**
 * An effigy curses the ground around it: zombies, vampires, and the like
 * within EFFIGY_RADIUS tiles (more with upgrades) move at EFFIGY_SLOW of
 * their speed.
 */
export const EFFIGY_RADIUS = 3;

/**
 * Fraction of their speed monsters near an effigy move at.
 */
export const EFFIGY_SLOW = 0.7;

/**
 * Health an offering at a sacrificial altar takes, as a fresh wound.
 */
export const ALTAR_HP_COST = 2;

/**
 * Seconds an offering keeps an altar awake.
 */
export const ALTAR_AWAKE_SECONDS = 60;

/**
 * How many times over monsters bleed when they die near an awake altar at
 * level 0 (plus half per level).
 */
export const ALTAR_BLEED = 2;

/**
 * Tiles from an awake altar within which dying monsters bleed more.
 */
export const ALTAR_RADIUS = 4;

/**
 * Ghosts can't drift closer than this (tiles) to a silver bell, plus half
 * a tile per level.
 */
export const BELL_RADIUS = 3.5;
