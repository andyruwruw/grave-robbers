// Packages
import { Mesh } from 'three';
import { CARDINAL_DIRS } from '@halloween/shared/world/ramps';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { buildTile } from '../../graveyard/graveyard-builder';
import { WALL_GHOST_OPACITY } from './config/build-preview-shapes';

// Types
import type { Group, Material } from 'three';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Previews of walls as they'll stand: the wall itself, in its look and
 * turned, joined to the walls beside the spot, a little see-through. Each
 * is painted once (by the wall's own painter on a small map) and kept.
 */
export class WallGhosts {
  /**
   * The previews painted so far, by look, way, and what's beside.
   */
  private readonly _ghosts = new Map<string, Group>();

  /**
   * The preview showing, if any.
   */
  private _shown: Group | null = null;

  /**
   * Creates the previews' holder.
   * @param _parent What the previews hang on (the build marker).
   */
  constructor(private readonly _parent: Group) {}

  /**
   * Shows the preview of a wall, or hides it (null).
   * @param wall What to preview: the wall, its look, its way (an index
   *   into RAMP_DIRS), and the tiles beside it (east, west, south, north).
   */
  show(wall: { kind: StructureKind; style: number; dir: number; beside: Tile[] } | null): void {
    const ghost = wall ? this.ghost(wall.kind, wall.style, wall.dir, wall.beside) : null;
    if (this._shown && this._shown !== ghost) {
      this._shown.visible = false;
    }
    if (ghost) {
      ghost.visible = true;
    }
    this._shown = ghost;
  }

  /**
   * Frees every preview.
   */
  dispose(): void {
    for (const ghost of this._ghosts.values()) {
      ghost.traverse((o): void => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (o.material as Material).dispose();
        }
      });
    }
    this._ghosts.clear();
  }

  /**
   * A wall's preview, painted the first time it's asked for.
   * @param kind The wall.
   * @param style Its look.
   * @param dir Its way.
   * @param beside The tiles beside it.
   * @returns The preview.
   */
  private ghost(kind: StructureKind, style: number, dir: number, beside: Tile[]): Group {
    const key = `${kind}:${style}:${dir}:${beside.join(',')}`;
    let ghost = this._ghosts.get(key);
    if (!ghost) {
      const map = WorldMap.filled('grass', 5, 5);
      map.set(2, 2, kind);
      map.setRamp(2, 2, dir, style);
      CARDINAL_DIRS.forEach(([dx, dy]: [number, number], i: number): void => map.set(2 + dx, 2 + dy, beside[i] ?? 'grass'));
      ghost = buildTile(map, 1, 2, 2);
      ghost.traverse((o): void => {
        if (o instanceof Mesh) {
          const material = o.material as Material;
          material.transparent = true;
          material.opacity = WALL_GHOST_OPACITY;
        }
        o.castShadow = false;
      });
      ghost.visible = false;
      this._parent.add(ghost);
      this._ghosts.set(key, ghost);
    }
    return ghost;
  }
}
