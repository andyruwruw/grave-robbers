// Packages
import { GRAVE_TILES } from '@halloween/shared/loot/graves';

// Local Imports
import { GRAVE_HEAT_RADIUS, GRAVE_HEAT_REFRESH, PLAYER_HEAT_MEMORY } from '../config/heat';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';
import type { Lure } from '../types/monster';

/**
 * Where players have been lately and where the graves cluster, per tile:
 * what lured zombies wander toward.
 */
export class HeatMap {
  /**
   * Player heat per tile, fading over time.
   */
  private _playerHeat = new Float32Array(0);

  /**
   * Grave heat per tile, recounted now and then.
   */
  private _graveHeat = new Float32Array(0);

  /**
   * When grave heat was last recounted.
   */
  private _graveHeatAt = -Infinity;

  /**
   * The map's width, which the grids are made for.
   */
  private _width = 0;

  /**
   * The map's height, which the grids are made for.
   */
  private _height = 0;

  /**
   * Makes the grids fit the world's map (a new world can bring a new size).
   * @param map The world's map.
   */
  fit(map: WorldMap): void {
    if (this._width !== map.width || this._height !== map.height) {
      this._width = map.width;
      this._height = map.height;
      this._playerHeat = new Float32Array(map.size);
      this._graveHeat = new Float32Array(map.size);
      this._graveHeatAt = -Infinity;
    }
  }

  /**
   * The grid a lure draws toward.
   * @param lure The lure.
   * @returns Player heat for 'players', else grave heat.
   */
  heatFor(lure: Lure): Float32Array {
    return lure === 'players' ? this._playerHeat : this._graveHeat;
  }

  /**
   * Fades the heat players leave where they've been and adds this tick's,
   * spread a little around each, and every so often recounts the graves
   * around each tile.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   */
  update<P extends Target>(dt: number, world: World, present: P[]): void {
    const fade = Math.exp(-dt / PLAYER_HEAT_MEMORY);
    const heat = this._playerHeat;
    for (let i = 0; i < heat.length; i++) {
      heat[i] *= fade;
    }
    for (const p of present) {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x >= 0 && y >= 0 && x < world.map.width && y < world.map.height) {
            heat[y * world.map.width + x] += dt / (1 + dx * dx + dy * dy);
          }
        }
      }
    }
    if (world.time - this._graveHeatAt < GRAVE_HEAT_REFRESH && world.time >= this._graveHeatAt) {
      return;
    }
    this._graveHeatAt = world.time;
    this._graveHeat.fill(0);
    const r = GRAVE_HEAT_RADIUS;
    for (let ty = 0; ty < world.map.height; ty++) {
      for (let tx = 0; tx < world.map.width; tx++) {
        const tile = world.map.get(tx, ty);
        if (!GRAVE_TILES.has(tile) && tile !== 'mound') {
          continue;
        }
        for (let y = Math.max(0, ty - r); y <= Math.min(world.map.height - 1, ty + r); y++) {
          for (let x = Math.max(0, tx - r); x <= Math.min(world.map.width - 1, tx + r); x++) {
            const d = Math.hypot(x - tx, y - ty);
            if (d <= r) {
              this._graveHeat[y * world.map.width + x] += 1 - d / (r + 1);
            }
          }
        }
      }
    }
  }
}
