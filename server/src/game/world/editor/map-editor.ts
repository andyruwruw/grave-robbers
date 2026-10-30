// Packages
import { BUILDABLE_FLOORS } from '@halloween/shared/structures/placement';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { RAMP_DIRS } from '@halloween/shared/world/ramps';
import { BLEND_TILES, blendKey, cleanBlend } from '@halloween/shared/map-editor/blend/blend';
import { packBlends } from '@halloween/shared/map-editor/blend/blend-areas';
import { blendMatches, blendTile } from '@halloween/shared/map-editor/blend/blend-tiles';
import { brushTiles } from '@halloween/shared/map-editor/brush';
import { EDIT_TILES } from '@halloween/shared/map-editor/palette';

// Local Imports
import { eraseUnder } from '../items/pile-lookup';
import { WorldFeature } from '../world-feature';

// Types
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { MapEdit } from '@halloween/shared/map-editor/map-edit';
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldLights } from '../structures/features/world-lights';
import type { WorldSite } from '../types/site';

/**
 * The TV's map editor: painting tiles, levels, Mix blends, and stairs.
 */
export class MapEditor extends WorldFeature {
  /**
   * Sets the editor up.
   * @param site What every part of the world shares.
   * @param _lights The world's lights, to keep placed lights lit for good.
   * @param _blends The map editor's Mix setting last painted on each tile, by index.
   */
  constructor(site: WorldSite, private readonly _lights: WorldLights, private readonly _blends: Map<number, string>) {
    super(site);
  }

  /**
   * The map editor's remembered Mix settings, for saves, presets, and the
   * TV's picker.
   * @returns The blends, packed by setting.
   */
  blendAreas(): BlendAreas {
    return packBlends(this._blends);
  }

  /**
   * One change from the TV's map editor (see `MapEdit`). Whatever stood on
   * a repainted tile goes (a built structure, a part-chopped tree's count,
   * a mound's timer); a new built structure starts fresh. The fence stays.
   * @param e The change.
   */
  edit(e: MapEdit): void {
    if (!Number.isInteger(e.tx) || !Number.isInteger(e.ty)) {
      return;
    }
    if (e.op === 'stairs') {
      this.editStairs(e);
      return;
    }
    if (e.op === 'blend') {
      this.editBlend(e);
      return;
    }
    this.editPaint(e);
  }

  /**
   * Puts stairs down on a tile, or turns stairs already there to face the
   * next higher neighbor.
   * @param e The stairs change.
   */
  private editStairs(e: Extract<MapEdit, { op: 'stairs' }>): void {
    const map = this.map;
    const { tx, ty } = e;
    if (tx <= 0 || ty <= 0 || tx >= this.map.width - 1 || ty >= this.map.height - 1) {
      return;
    }
    if (map.get(tx, ty) !== 'stairs') {
      this.clearTile(tx, ty);
      map.set(tx, ty, 'stairs');
      if (Number.isInteger(e.dir) && e.dir! >= 0 && e.dir! < RAMP_DIRS.length) {
        map.setRamp(tx, ty, e.dir!);
      }
      return;
    }
    const own = map.base(tx, ty);
    const ways = RAMP_DIRS.flatMap(([dx, dy], i: number): number[] => (!map.isSolid(tx + dx, ty + dy) && map.base(tx + dx, ty + dy) > own ? [i] : []));
    const up = map.rampUp(tx, ty);
    const now = up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : -1;
    if (ways.length > 0) {
      map.setRamp(tx, ty, ways[(ways.indexOf(now) + 1) % ways.length]);
    }
  }

  /**
   * Paints the Mix brush: remembers the setting on each tile and swaps any
   * blend tile that no longer matches it.
   * @param e The blend change.
   */
  private editBlend(e: Extract<MapEdit, { op: 'blend' }>): void {
    const map = this.map;
    const blend = cleanBlend(e.blend);
    const key = blendKey(blend);
    for (const [x, y] of brushTiles(e.tx, e.ty, e.size, this.map.width, this.map.height)) {
      if (key) {
        this._blends.set(y * this.map.width + x, key);
      } else {
        this._blends.delete(y * this.map.width + x);
      }
      const now = map.get(x, y);
      const want = blendTile(map, blend, x, y);
      if (BLEND_TILES.has(now) && !blendMatches(now, want)) {
        this.clearTile(x, y);
        map.set(x, y, want);
      }
    }
  }

  /**
   * Paints levels or tiles (optionally a scattered mix), or erases back to
   * grass, over the brush.
   * @param e The level, tile, or erase change.
   */
  private editPaint(e: Exclude<MapEdit, { op: 'stairs' | 'blend' }>): void {
    const map = this.map;
    const paints = e.op === 'tile' ? (Array.isArray(e.mix) && e.mix.length > 0 ? e.mix.slice(0, 8) : [e.tile]) : [];
    if (e.op === 'tile' && !paints.every((t: Tile): boolean => EDIT_TILES.has(t))) {
      return;
    }
    const scatter = e.op === 'tile' && typeof e.scatter === 'number' ? Math.min(1, Math.max(0, e.scatter)) : 1;
    if (e.op === 'erase') {
      eraseUnder(this.items, brushTiles(e.tx, e.ty, e.size, this.map.width, this.map.height));
    }
    for (const [x, y] of brushTiles(e.tx, e.ty, e.size, this.map.width, this.map.height)) {
      if (e.op === 'level') {
        if (Number.isInteger(e.level) && (typeof e.from !== 'number' || map.level(x, y) === e.from)) {
          map.setLevel(x, y, e.level);
        }
        continue;
      }
      if (e.op === 'tile' && Math.random() >= scatter) {
        continue;
      }
      const paint = e.op === 'tile' ? paints[Math.floor(Math.random() * paints.length)] : null;
      this._blends.delete(y * this.map.width + x);
      const wasStructure = isStructure(map.get(x, y));
      this.clearTile(x, y);
      if (e.op === 'erase') {
        if (!wasStructure) {
          map.set(x, y, 'grass');
        }
        continue;
      }
      if (!paint) {
        continue;
      }
      if (isStructure(paint)) {
        if (!BUILDABLE_FLOORS.has(map.get(x, y))) {
          map.set(x, y, 'grass');
        }
        this.structures.place(x, y, paint, 0);
        this._lights.eternal(x, y);
      } else {
        map.set(x, y, paint);
      }
    }
  }

  /**
   * Forgets everything about a tile's contents for the editor: a built
   * structure comes down to its floor, and growth, dig, and rob timers go.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  private clearTile(tx: number, ty: number): void {
    const i = ty * this.map.width + tx;
    const s = this.structures.get(i);
    if (s) {
      this.structures.delete(i);
      this.map.set(tx, ty, s.floor);
    }
    this.timers.forget(i);
  }
}
