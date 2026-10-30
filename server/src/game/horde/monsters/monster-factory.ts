// Local Imports
import { Brute } from './kinds/brute';
import { Demon } from './kinds/demon';
import { Ghost } from './kinds/ghost';
import { Ghoul } from './kinds/ghoul';
import { Skeleton } from './kinds/skeleton';
import { Vampire } from './kinds/vampire';
import { Witch } from './kinds/witch';
import { Zombie } from './kinds/zombie';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { HordeContext } from '../horde-context';
import type { Target } from '../types/hooks';
import type { MonsterInit } from '../types/monster';
import type { Monster } from './monster';

/**
 * Makes one kind of monster.
 */
type MonsterMaker = new <P extends Target>(init: MonsterInit, ctx: HordeContext<P>) => Monster<P>;

/**
 * The class behind each monster kind.
 */
const MONSTER_MAKERS: Record<MonsterKind, MonsterMaker> = {
  zombie: Zombie,
  vampire: Vampire,
  ghost: Ghost,
  brute: Brute,
  skeleton: Skeleton,
  witch: Witch,
  ghoul: Ghoul,
  demon: Demon,
};

/**
 * Makes a monster of its kind.
 * @param init Everything it's made with.
 * @param ctx What the horde's parts share.
 * @returns The monster.
 */
export function createMonster<P extends Target>(init: MonsterInit, ctx: HordeContext<P>): Monster<P> {
  return new MONSTER_MAKERS[init.kind]<P>(init, ctx);
}
