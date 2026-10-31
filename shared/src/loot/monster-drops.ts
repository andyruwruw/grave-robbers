// Types
import type { Material } from '../goods/goods';
import type { MonsterKind } from '../monsters/monster-kinds';

/**
 * Blood a dead monster leaves behind.
 */
export const MONSTER_BLOOD: Record<MonsterKind, number> = { zombie: 2, vampire: 6, ghost: 0, brute: 6, skeleton: 0, witch: 4, ghoul: 2, demon: 16, bloater: 8, necromancer: 5, werewolf: 14 };

/**
 * Bones a dead monster leaves with its blood.
 */
export const MONSTER_BONES: Record<MonsterKind, number> = { zombie: 1, vampire: 2, ghost: 0, brute: 3, skeleton: 4, witch: 1, ghoul: 2, demon: 1, bloater: 1, necromancer: 4, werewolf: 3 };

/**
 * Ectoplasm a dead monster leaves (only ghosts, however they go).
 */
export const MONSTER_ECTOPLASM: Record<MonsterKind, number> = { zombie: 0, vampire: 0, ghost: 1, brute: 0, skeleton: 0, witch: 0, ghoul: 0, demon: 0, bloater: 0, necromancer: 0, werewolf: 0 };

/**
 * The essence a dead monster may leave for infusions (see
 * `docs/infusions.md`), and the chance it does: a brute always leaves a
 * tendon, a ghoul a fang a little over a third of the time, a witch a hex
 * shard half the time, a demon always leaves brimstone, a necromancer a
 * hex shard every time, and a werewolf always leaves a fang. Ghosts leave
 * ectoplasm (MONSTER_ECTOPLASM); holy water is crafted.
 */
export const MONSTER_ESSENCE: Partial<Record<MonsterKind, { goods: Material; chance: number }>> = {
  brute: { goods: 'brute-tendon', chance: 1 },
  ghoul: { goods: 'ghoul-fang', chance: 0.35 },
  witch: { goods: 'hex-shard', chance: 0.5 },
  demon: { goods: 'brimstone', chance: 1 },
  necromancer: { goods: 'hex-shard', chance: 1 },
  werewolf: { goods: 'ghoul-fang', chance: 1 },
};
