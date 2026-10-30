// Types
import type { MonsterKind } from '../monsters/monster-kinds';

/**
 * Blood a dead monster leaves behind.
 */
export const MONSTER_BLOOD: Record<MonsterKind, number> = { zombie: 2, vampire: 6, ghost: 0, brute: 6, skeleton: 0, witch: 4, ghoul: 2, demon: 16 };

/**
 * Bones a dead monster leaves with its blood.
 */
export const MONSTER_BONES: Record<MonsterKind, number> = { zombie: 1, vampire: 2, ghost: 0, brute: 3, skeleton: 4, witch: 1, ghoul: 2, demon: 1 };

/**
 * Ectoplasm a dead monster leaves (only ghosts, however they go).
 */
export const MONSTER_ECTOPLASM: Record<MonsterKind, number> = { zombie: 0, vampire: 0, ghost: 1, brute: 0, skeleton: 0, witch: 0, ghoul: 0, demon: 0 };
