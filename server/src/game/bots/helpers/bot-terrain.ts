// Local Imports
import { SIDES } from '../config/bot';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Step } from '../../pathing/types/path';
import type { BotView } from '../types/bot';

/**
 * The tile the test player stands on.
 * @param v What it knows.
 * @returns Its tile.
 */
export function botTile(v: BotView): Step {
  return { tx: Math.floor(v.x), ty: Math.floor(v.y) };
}

/**
 * The test player's path cost: any open tile it can step onto costs 1.
 * @param map The world map.
 * @returns The cost of entering (tx, ty) from (fx, fy).
 */
export function stepCost(map: WorldMap): (tx: number, ty: number, fx: number, fy: number) => number {
  return (tx: number, ty: number, fx: number, fy: number): number => (!map.isSolid(tx, ty) && map.canStep(fx, fy, tx, ty) ? 1 : Infinity);
}

/**
 * Which tiles the test player's paths may cut the corner of.
 * @param map The world map.
 * @returns Whether a tile is open.
 */
export function isOpen(map: WorldMap): (tx: number, ty: number) => boolean {
  return (tx: number, ty: number): boolean => !map.isSolid(tx, ty);
}

/**
 * How many tiles `from` can walk to, moving only straight (so a stricter
 * count than the 8-way pathing), with `block` treated as solid.
 * @param map The world map.
 * @param from Where the walk starts.
 * @param block A tile to treat as solid.
 * @returns The count, `from` included.
 */
export function reachable(map: WorldMap, from: Step, block?: Step): number {
  const seen = new Uint8Array(map.width * map.height);
  const queue = [from];
  seen[from.ty * map.width + from.tx] = 1;
  for (let i = 0; i < queue.length; i++) {
    const { tx, ty } = queue[i];
    for (const [dx, dy] of SIDES) {
      const nx = tx + dx;
      const ny = ty + dy;
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height || seen[ny * map.width + nx] || (block && nx === block.tx && ny === block.ty) || map.isSolid(nx, ny) || !map.canStep(tx, ty, nx, ny)) {
        continue;
      }
      seen[ny * map.width + nx] = 1;
      queue.push({ tx: nx, ty: ny });
    }
  }
  return queue.length;
}
