// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { walkerBlocked } from '@halloween/shared/world/collision';
import { PASSABLE } from '@halloween/shared/world/tiles';

// Types
import type { Blocked } from '@halloween/shared/world/collision';
import type { World } from '../../world/world';

/**
 * What stops a monster at (x, y): solid tiles, doors, and anything too
 * high to step up. With `noDrop` (fleeing or circling), also any
 * neighboring tile it couldn't climb back up from, so it never escapes
 * down a cliff; chasing still hops down to reach its prey. `intoChasm`
 * lets a knockback carry it over a chasm's edge (it falls, and is gone).
 * @param world The world.
 * @param m Where the monster stands.
 * @param noDrop Also block drops it couldn't climb back from.
 * @param intoChasm Let it go over a chasm's edge.
 * @returns The blocked test.
 */
export function monsterBlocked(world: World, m: { x: number; y: number }, noDrop = false, intoChasm = false): Blocked {
  const cx = Math.floor(m.x);
  const cy = Math.floor(m.y);
  return walkerBlocked(world.map, m.x, m.y, MONSTER_RADIUS, (tx: number, ty: number): boolean =>
    world.map.get(tx, ty) === 'door' || (noDrop && (tx !== cx || ty !== cy) && !world.map.canStep(tx, ty, cx, cy)), intoChasm);
}

/**
 * Tiles monsters may path through at all (heights are checked per step).
 * @param world The world.
 * @returns The walkable test.
 */
export function monsterWalkable(world: World): (tx: number, ty: number) => boolean {
  return (tx: number, ty: number): boolean => (!world.map.isSolid(tx, ty) || PASSABLE.has(world.map.get(tx, ty))) && world.map.get(tx, ty) !== 'door';
}
