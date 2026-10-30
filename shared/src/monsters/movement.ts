/**
 * Collision radius in tiles (zombies and vampires; ghosts drift through
 * everything).
 */
export const MONSTER_RADIUS = 0.3;

/**
 * Zombies and vampires walk at this fraction of their speed through a
 * tree's trunk.
 */
export const MONSTER_TREE_SLOW = 0.7;

/**
 * How far (tiles each way) a monster's path search reaches, so pathing
 * stays cheap on a huge map.
 */
export const MONSTER_SEARCH = 48;
