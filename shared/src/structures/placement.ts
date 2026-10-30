// Local Imports
import { DIGGER_FLOORS } from './automation';

// Types
import type { Tile } from '../world/tiles';
import type { StructureKind } from './types/structures';

/**
 * Structures a player places facing a way, kept as the tile's turn.
 */
export const TURNED: ReadonlySet<StructureKind> = new Set<StructureKind>(['belt']);

/**
 * Structures that raise the ground: a platform's deck stands a level up,
 * and steps ramp up to whatever higher tile they lead to. Both are walked
 * on, so nobody may stand on the tile while one is built.
 */
export const RAISED: ReadonlySet<StructureKind> = new Set<StructureKind>(['platform', 'steps']);

/**
 * Tiles a structure can be placed on.
 */
export const BUILDABLE_FLOORS: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'cobble', 'flagstone', 'mound']);

/**
 * Whether a structure may go on a floor tile: a bone digger only on a
 * grave, pumpkin seeds only on grass, everything else on BUILDABLE_FLOORS.
 *
 * @param kind The structure to place.
 * @param floor The tile under it.
 * @returns True when it may go there.
 */
export function canBuildOn(kind: StructureKind, floor: Tile): boolean {
  if (kind === 'digger') {
    return DIGGER_FLOORS.has(floor);
  }
  return kind === 'seeds' ? floor === 'grass' : BUILDABLE_FLOORS.has(floor);
}
