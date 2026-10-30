// Packages
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';

/**
 * Whether a player's hitbox at (x, y) overlaps tile (tx, ty).
 * @param x Where the player stands (tiles).
 * @param y Where the player stands (tiles).
 * @param tx The tile's column.
 * @param ty The tile's row.
 * @returns True if they overlap.
 */
export function overlapsTile(x: number, y: number, tx: number, ty: number): boolean {
  return x + PLAYER_RADIUS > tx && x - PLAYER_RADIUS < tx + 1 && y + PLAYER_RADIUS > ty && y - PLAYER_RADIUS < ty + 1;
}
