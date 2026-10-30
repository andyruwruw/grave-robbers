// Types
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { TileHit } from '../types/map-editor';

/**
 * Picks the tile under the mouse, or one further back along the line of
 * sight after scrolling: the depth resets whenever the nearest tile under
 * the mouse changes.
 */
export class TilePicker {
  /**
   * The nearest tile's key (`ty * 1000 + tx`, -1 for none) and how many
   * tiles back the brush is.
   */
  private _depth: { front: number; at: number } = { front: -1, at: 0 };

  /**
   * The tile at the current depth under a point.
   *
   * @param renderer - The renderer to pick through.
   * @param clientX - The point's x on the page.
   * @param clientY - The point's y on the page.
   * @returns The hit, or undefined over nothing.
   */
  pick(renderer: WorldRenderer, clientX: number, clientY: number): TileHit | undefined {
    const hits = renderer.pickTiles(clientX, clientY);
    const front = hits[0] ? hits[0].ty * 1000 + hits[0].tx : -1;
    if (front !== this._depth.front) {
      this._depth = { front, at: 0 };
    }
    return hits[Math.min(this._depth.at, hits.length - 1)];
  }

  /**
   * Steps one tile deeper (scrolling down) or nearer (up) under a point.
   *
   * @param renderer - The renderer to pick through.
   * @param clientX - The point's x on the page.
   * @param clientY - The point's y on the page.
   * @param deltaY - The wheel's movement.
   */
  step(renderer: WorldRenderer, clientX: number, clientY: number, deltaY: number): void {
    const hits = renderer.pickTiles(clientX, clientY);
    this._depth.at = Math.max(0, Math.min(hits.length - 1, this._depth.at + (deltaY > 0 ? 1 : -1)));
  }
}
