// Packages
import { spawnWeights } from '@halloween/shared/difficulty/horde-scaling';
import { MAX_DEMONS } from '@halloween/shared/monsters/kinds/demon';
import { MONSTER_KINDS } from '@halloween/shared/monsters/monster-kinds';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * The trickle's next kind, rolled by `spawnWeights` among the kinds still
 * under their share of the cap (its weight's share of the total, times the
 * cap, rounded up, at least 1), so the mix holds in what's out as well as
 * in what spawns: the kinds that live longest (vampires keep up with
 * players and shrug off blood weapons) can't crowd out the rest. No demon
 * past MAX_DEMONS out anywhere; a zombie when every kind is full.
 * World events add weight on top (a blood moon's werewolves).
 * @param level The world level.
 * @param cap How many walkers may be out where this one spawns.
 * @param out The walkers out there.
 * @param demons Demons out in the whole world.
 * @param extra Weight world events add (`EventModifiers.spawnMix`).
 * @returns The kind to spawn.
 */
export function pickKind(level: number, cap: number, out: readonly { kind: MonsterKind }[], demons: number, extra: Partial<Record<MonsterKind, number>>): MonsterKind {
  const weights = spawnWeights(level, extra);
  const total = MONSTER_KINDS.reduce((sum: number, k: MonsterKind): number => sum + weights[k], 0);
  const count = (k: MonsterKind): number => out.filter((m: { kind: MonsterKind }): boolean => m.kind === k).length;
  const open = MONSTER_KINDS.filter((k: MonsterKind): boolean => weights[k] > 0
    && count(k) < Math.max(1, Math.ceil((cap * weights[k]) / total))
    && (k !== 'demon' || demons < MAX_DEMONS));
  let roll = Math.random() * open.reduce((sum: number, k: MonsterKind): number => sum + weights[k], 0);
  return open.find((k: MonsterKind): boolean => (roll -= weights[k]) < 0) ?? 'zombie';
}
