// Packages
import { LIT_FRACTION } from '@halloween/shared/monsters/sight';
import { CURSOR_LIGHT } from '@halloween/shared/structures/lights';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { World } from '../../world/world';
import type { ActiveLight } from '../../world/types/lights';
import type { Monster } from '../monsters/monster';
import type { Target } from '../types/hooks';

/**
 * Which tiles are inside the bright part of any light this tick, for
 * vampires, ghosts and spawning. A monster burning with light lights the
 * tiles around it for everyone but itself, so its own glow never keeps a
 * vampire or demon from fighting.
 */
export class LightField {
  /**
   * Every light that counts this tick: burning structures, the TV's cursor
   * light, lights players carry, and monsters burning with light.
   */
  lights: ActiveLight[] = [];

  /**
   * 1 for each tile lit by anything but a glowing monster.
   */
  private _lit = new Uint8Array(0);

  /**
   * How many glowing monsters light each tile.
   */
  private _glow = new Uint8Array(0);

  /**
   * Each glowing monster's light this tick, by its id.
   */
  private readonly _glows = new Map<number, ActiveLight>();

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
      this._glow = new Uint8Array(map.size);
    }
  }

  /**
   * Marks tiles inside the bright part of any light.
   * @param world The world.
   * @param players Every player.
   * @param dark Every light counts as out.
   * @param cursorLight The light the TV's mouse carries, if any.
   * @param monsters Every monster (one burning with light, from Hell's
   * Edge or Infernal Mandate, gives off its `burning.light`).
   */
  update<P extends Target>(world: World, players: P[], dark: boolean, cursorLight: { x: number; y: number } | null, monsters: Iterable<Monster<P>> = []): void {
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
    this._glow.fill(0);
    this._glows.clear();
    for (const l of this.lights) {
      this.mark(l, (i: number): void => {
        this._lit[i] = 1;
      });
    }
    for (const m of monsters) {
      if (m.burning.light > 0 && m.burning.active(world.time) && !dark) {
        const glow = { tx: Math.floor(m.x), ty: Math.floor(m.y), radius: m.burning.light, structure: false };
        this.lights.push(glow);
        this._glows.set(m.id, glow);
        this.mark(glow, (i: number): void => {
          this._glow[i] = Math.min(255, this._glow[i] + 1);
        });
      }
    }
  }

  /**
   * Calls `each` with the grid index of every tile inside a light's
   * bright part.
   * @param l The light.
   * @param each What to do with each tile's index.
   */
  private mark(l: ActiveLight, each: (i: number) => void): void {
    const r = l.radius * LIT_FRACTION;
    for (let ty = Math.max(0, Math.floor(l.ty - r)); ty <= Math.min(this._height - 1, Math.ceil(l.ty + r)); ty++) {
      for (let tx = Math.max(0, Math.floor(l.tx - r)); tx <= Math.min(this._width - 1, Math.ceil(l.tx + r)); tx++) {
        if (this.inside(l, tx, ty)) {
          each(ty * this._width + tx);
        }
      }
    }
  }

  /**
   * Whether a tile is inside a light's bright part.
   * @param l The light.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns True when it is.
   */
  private inside(l: ActiveLight, tx: number, ty: number): boolean {
    return Math.hypot(tx - l.tx, ty - l.ty) <= l.radius * LIT_FRACTION;
  }

  /**
   * Whether a tile is lit this tick, as monster `self` sees it (its own
   * glow doesn't count).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param self The id of the monster asking, if one is.
   * @returns True when lit.
   */
  isLit(tx: number, ty: number, self?: number): boolean {
    const i = ty * this._width + tx;
    if (this._lit[i] === 1) {
      return true;
    }
    const own = self === undefined ? undefined : this._glows.get(self);
    return this._glow[i] > (own && this.inside(own, tx, ty) ? 1 : 0);
  }

  /**
   * How many structure lights are burning (for the ghost cap).
   * @returns The count.
   */
  burning(): number {
    return this.lights.filter((l: ActiveLight): boolean => l.structure).length;
  }
}
