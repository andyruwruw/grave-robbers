// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * One kind of thing that can be done to the facing tile. `TileJobSystem`
 * tries its jobs on a swing, and `UseSystem` its own on USE, each in order
 * until one takes it.
 */
export abstract class TileJob extends GameSystem {
  /**
   * Does this job's work if the tile is one for it.
   * @param p The player swinging.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing (false lets the next job try).
   */
  abstract tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean;
}
