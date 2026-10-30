// Packages
import { LIT_FRACTION } from '@halloween/shared/monsters/sight';
import { CURSOR_LIGHT } from '@halloween/shared/structures/lights';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { World } from '../../world/world';
import type { ActiveLight } from '../../world/types/lights';
import type { Target } from '../types/hooks';

/**
 * Which tiles are inside the bright part of any light this tick, for
 * vampires, ghosts and spawning.
 */
export class LightField {
  /**
   * Every light that counts this tick: burning structures, the TV's cursor
   * light, and lights players carry.
   */
  lights: ActiveLight[] = [];

  /**
   * 1 for each lit tile.
   */
  private _lit = new Uint8Array(0);

  /**
   * The map's width, which the grid is made for.
   */
  private _width = 0;

  /**
   * The map's height, which the grid is made for.
   */
  private _height = 0;

  /**
   * Makes the grid fit the world's map (a new world can bring a new size).
   * @param map The world's map.
   */
  fit(map: WorldMap): void {
    if (this._width !== map.width || this._height !== map.height) {
      this._width = map.width;
      this._height = map.height;
      this._lit = new Uint8Array(map.size);
    }
  }

  /**
   * Marks tiles inside the bright part of any light.
   * @param world The world.
   * @param players Every player.
   * @param dark Every light counts as out.
   * @param cursorLight The light the TV's mouse carries, if any.
   */
  update<P extends Target>(world: World, players: P[], dark: boolean, cursorLight: { x: number; y: number } | null): void {
    this.lights = dark ? [] : world.lights.activeLights();
    if (cursorLight) {
      this.lights.push({ tx: Math.floor(cursorLight.x), ty: Math.floor(cursorLight.y), radius: CURSOR_LIGHT.radius, structure: false });
    }
    for (const p of players) {
      if (p.light > 0 && !p.dead && !dark) {
        this.lights.push({ tx: Math.floor(p.x), ty: Math.floor(p.y), radius: p.light, structure: false });
      }
    }
    this._lit.fill(0);
    for (const l of this.lights) {
      const r = l.radius * LIT_FRACTION;
      for (let ty = Math.max(0, Math.floor(l.ty - r)); ty <= Math.min(world.map.height - 1, Math.ceil(l.ty + r)); ty++) {
        for (let tx = Math.max(0, Math.floor(l.tx - r)); tx <= Math.min(world.map.width - 1, Math.ceil(l.tx + r)); tx++) {
          if (Math.hypot(tx - l.tx, ty - l.ty) <= r) {
            this._lit[ty * world.map.width + tx] = 1;
          }
        }
      }
    }
  }

  /**
   * Whether a tile is lit this tick.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns True when lit.
   */
  isLit(tx: number, ty: number): boolean {
    return this._lit[ty * this._width + tx] === 1;
  }

  /**
   * How many structure lights are burning (for the ghost cap).
   * @returns The count.
   */
  burning(): number {
    return this.lights.filter((l: ActiveLight): boolean => l.structure).length;
  }
}
