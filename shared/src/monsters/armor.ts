/**
 * What zombies and brutes wear: a helmet or a plate, each multiplying the
 * damage they take.
 */
export type MonsterArmor = 'helmet' | 'plate';

/**
 * What each kind of armor multiplies a monster's damage taken by.
 */
export const MONSTER_ARMOR_GUARD: Record<MonsterArmor, number> = { helmet: 0.75, plate: 0.55 };

/**
 * Chance an armored monster leaves a piece of iron when it dies.
 */
export const ARMOR_SCRAP: Record<MonsterArmor, number> = { helmet: 0.3, plate: 0.8 };
