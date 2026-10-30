/**
 * Occult works: a cursed obelisk makes monsters within OBELISK_RADIUS
 * tiles (more with upgrades) take OBELISK_CURSE times the damage; a blood
 * fountain mends whoever stands by it like a campfire (and drains
 * monsters, see TRAPS); a soul cage pulls
 * in and destroys a ghost that drifts within SOUL_CAGE_RADIUS, one every
 * SOUL_CAGE_COOLDOWN seconds; a cursed mirror turns monsters' arrows and
 * ectoplasm that pass within MIRROR_RADIUS back on them (and shatters
 * potions harmlessly).
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
 * Tiles within which a cursed mirror turns shots back.
 */
export const MIRROR_RADIUS = 1.6;

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
 * An offering at a sacrificial altar: the health it takes and the blood it
 * gives (plus one per level). Monsters that die this close to an altar
 * bleed twice as much.
 */
export const ALTAR_HP_COST = 2;

/**
 * Blood an offering gives at level 0.
 */
export const ALTAR_BLOOD = 3;

/**
 * Tiles from an altar within which dying monsters bleed twice as much.
 */
export const ALTAR_RADIUS = 4;

/**
 * Ghosts can't drift closer than this (tiles) to a silver bell, plus half
 * a tile per level.
 */
export const BELL_RADIUS = 3.5;
