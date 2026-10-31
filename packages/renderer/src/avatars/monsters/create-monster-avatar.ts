// Local Imports
import { BloaterAvatar } from './kinds/bloater-avatar';
import { BruteAvatar } from './kinds/brute-avatar';
import { DemonAvatar } from './kinds/demon-avatar';
import { GhostAvatar } from './kinds/ghost-avatar';
import { GhoulAvatar } from './kinds/ghoul-avatar';
import { NecromancerAvatar } from './kinds/necromancer-avatar';
import { SkeletonAvatar } from './kinds/skeleton-avatar';
import { VampireAvatar } from './kinds/vampire-avatar';
import { WerewolfAvatar } from './kinds/werewolf-avatar';
import { WitchAvatar } from './kinds/witch-avatar';
import { ZombieAvatar } from './kinds/zombie-avatar';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { MonsterAvatar } from './monster-avatar';

/**
 * The avatar class for each monster kind.
 */
const MONSTER_AVATARS: Record<MonsterKind, new (state: MonsterState) => MonsterAvatar> = {
  zombie: ZombieAvatar,
  vampire: VampireAvatar,
  ghost: GhostAvatar,
  brute: BruteAvatar,
  skeleton: SkeletonAvatar,
  witch: WitchAvatar,
  ghoul: GhoulAvatar,
  demon: DemonAvatar,
  bloater: BloaterAvatar,
  necromancer: NecromancerAvatar,
  werewolf: WerewolfAvatar,
};

/**
 * Makes and builds the avatar for a monster. Building runs after `new`,
 * once the kind's own fields exist.
 * @param state The monster's first server state.
 * @returns The built avatar.
 */
export function createMonsterAvatar(state: MonsterState): MonsterAvatar {
  const avatar = new MONSTER_AVATARS[state.kind](state);
  avatar.assemble();
  return avatar;
}
