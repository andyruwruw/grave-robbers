/**
 * The tile a player at (x, y) facing `facing` acts on: just past their
 * hitbox edge, so it's the neighbor they're pressed against.
 *
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param facing Radians.
 * @returns The tile acted on.
 */
export function facingTile(x: number, y: number, facing: number): { tx: number; ty: number } {
  return { tx: Math.floor(x + Math.cos(facing) * 0.8), ty: Math.floor(y + Math.sin(facing) * 0.8) };
}

/**
 * Where a player at (x, y) facing `facing` builds: the facing tile, or if
 * their hitbox (`radius`) still overlaps it, the next tile on past them,
 * so nothing is ever built on top of whoever builds it.
 *
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param facing Radians.
 * @param radius Their hitbox's half-size.
 * @returns The tile built on.
 */
export function placeTile(x: number, y: number, facing: number, radius: number): { tx: number; ty: number } {
  for (const reach of [0.8, 1.3, 1.8]) {
    const tx = Math.floor(x + Math.cos(facing) * reach);
    const ty = Math.floor(y + Math.sin(facing) * reach);
    if (!(x + radius > tx && x - radius < tx + 1 && y + radius > ty && y - radius < ty + 1)) {
      return { tx, ty };
    }
  }
  return facingTile(x, y, facing);
}

/**
 * How far (tiles, from a player's middle) a structure can be placed when
 * aimed with the mouse.
 */
export const BUILD_REACH = 2.5;

/**
 * Where a player at (x, y) builds: toward tile-space point `toward` (the
 * mouse on /play) the tile under it, or if it's past BUILD_REACH the
 * furthest tile they can reach that way, pushed on past them if their
 * hitbox (`radius`) overlaps it. With no point (a phone or controller),
 * the facing tile (`placeTile`).
 *
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param facing Radians.
 * @param radius Their hitbox's half-size.
 * @param toward The tile-space point aimed at, or null.
 * @returns The tile built on.
 */
export function buildTarget(x: number, y: number, facing: number, radius: number, toward: { x: number; y: number } | null): { tx: number; ty: number } {
  const d = toward ? Math.hypot(toward.x - x, toward.y - y) : 0;
  if (!toward || d < 0.3) {
    return placeTile(x, y, facing, radius);
  }
  const ux = (toward.x - x) / d;
  const uy = (toward.y - y) / d;
  for (let reach = Math.min(d, BUILD_REACH); reach <= BUILD_REACH + 1; reach += 0.25) {
    const tx = Math.floor(x + ux * reach);
    const ty = Math.floor(y + uy * reach);
    if (!(x + radius > tx && x - radius < tx + 1 && y + radius > ty && y - radius < ty + 1)) {
      return { tx, ty };
    }
  }
  return placeTile(x, y, Math.atan2(uy, ux), radius);
}
