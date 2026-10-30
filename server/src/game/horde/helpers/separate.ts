// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { moveWithCollision } from '@halloween/shared/world/collision';

// Local Imports
import { SEPARATION } from '../config/ai';
import { distance } from './geometry';
import { monsterBlocked } from './terrain';

// Types
import type { World } from '../../world/world';
import type { MonsterRoster } from '../monster-roster';
import type { Target } from '../types/hooks';

/**
 * Nudges overlapping walkers apart so a crowd doesn't stack on one spot.
 * @param world The world.
 * @param roster Every monster.
 */
export function separateWalkers<P extends Target>(world: World, roster: MonsterRoster<P>): void {
  const walkers = roster.bodies();
  for (let i = 0; i < walkers.length; i++) {
    for (let j = i + 1; j < walkers.length; j++) {
      const a = walkers[i];
      const b = walkers[j];
      const d = distance(a, b);
      if (d >= SEPARATION || d === 0) {
        continue;
      }
      const push = (SEPARATION - d) / 2;
      const nx = (b.x - a.x) / d;
      const ny = (b.y - a.y) / d;
      Object.assign(a, moveWithCollision(monsterBlocked(world, a), a.x, a.y, -nx * push, -ny * push, MONSTER_RADIUS));
      Object.assign(b, moveWithCollision(monsterBlocked(world, b), b.x, b.y, nx * push, ny * push, MONSTER_RADIUS));
    }
  }
}
