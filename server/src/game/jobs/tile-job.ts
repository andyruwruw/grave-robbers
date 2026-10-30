// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * One kind of thing a swing can do to the facing tile. `TileJobSystem`
 * tries each job in order until one takes the swing.
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
