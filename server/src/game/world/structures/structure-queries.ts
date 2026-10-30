// Local Imports
import { WorldFeature } from '../world-feature';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { TilePoint } from '../types/structures';

/**
 * Questions about built structures: where they are and how strong.
 */
export class StructureQueries extends WorldFeature {
  /**
   * Builder's skill level of the structure on a tile (0 if none).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns The level.
   */
  level(tx: number, ty: number): number {
    return this.structures.get(ty * this.map.width + tx)?.level ?? 0;
  }

  /**
   * Hit points left on a built structure, or null if there isn't one.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns The hit points, or null.
   */
  hp(tx: number, ty: number): number | null {
    return this.structures.get(ty * this.map.width + tx)?.hp ?? null;
  }

  /**
   * Tiles holding a structure of this kind.
   * @param kind The kind of structure.
   * @returns Their tiles, in build order.
   */
  structuresOf(kind: StructureKind): TilePoint[] {
    const found: TilePoint[] = [];
    for (const i of this.structures.keys()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      if (this.map.get(tx, ty) === kind) {
        found.push({ tx, ty });
      }
    }
    return found;
  }

  /**
   * The highest builder level among structures of `kind` within `radius`
   * of (x, y), or null if there are none.
   * @param kind The kind of structure.
   * @param x Where across, in tiles.
   * @param y Where down, in tiles.
   * @param radius How far to look, in tiles.
   * @returns The highest level, or null.
   */
  levelNear(kind: StructureKind, x: number, y: number, radius: number): number | null {
    const levels = this.structuresOf(kind)
      .filter(({ tx, ty }): boolean => Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= radius)
      .map(({ tx, ty }): number => this.level(tx, ty));
    return levels.length > 0 ? Math.max(...levels) : null;
  }

  /**
   * Whether the middle of a structure of this kind is within `radius` of
   * (x, y).
   * @param kind The kind of structure.
   * @param x Where across, in tiles.
   * @param y Where down, in tiles.
   * @param radius How far to look, in tiles.
   * @returns Whether one is that close.
   */
  nearStructure(kind: StructureKind, x: number, y: number, radius: number): boolean {
    return this.structuresOf(kind).some(({ tx, ty }): boolean => Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= radius);
  }

  /**
   * The coffin a player rises from, if they built one that still stands.
   * @param owner The player's id.
   * @returns The coffin's tile, or null.
   */
  coffinOf(owner: string): TilePoint | null {
    for (const [i, s] of this.structures.entries()) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      if (s.owner === owner && this.map.get(tx, ty) === 'coffin') {
        return { tx, ty };
      }
    }
    return null;
  }
}
