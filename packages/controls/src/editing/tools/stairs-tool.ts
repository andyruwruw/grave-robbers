// Packages
import { RAMP_DIRS } from '@halloween/shared/world/ramps';

// Local Imports
import { STAIRS_EDGE } from '../../config/map-editor';
import { EditTool } from './edit-tool';

// Types
import type React from 'react';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type {
  StairsPlacement,
  TileHit,
  TileRef,
} from '../../types/map-editor';
import type { MapEditController } from '../map-edit-controller';

/**
 * Stairs, a click each: a see-through flight shows where they'd go and
 * which way they'd climb; left places them (or deletes stairs already
 * there), right turns them (or the shown flight, before placing; the way
 * picked carries on to the next tiles where it leads up).
 */
export class StairsTool extends EditTool {
  /**
   * The tool's id.
   */
  readonly id = 'stairs';

  /**
   * The ring covers one tile.
   *
   * @returns 1.
   */
  override cursorSize(): number {
    return 1;
  }

  /**
   * Near the back edge of a block, picks the stairs climbing up to it
   * (seen almost edge on) instead of the block.
   *
   * @param hit - The tile hit along the line of sight.
   * @param r - The renderer, for looking at the map.
   * @returns The tile.
   */
  override resolveTile(hit: TileHit, r: WorldRenderer): TileRef {
    if (r.tileKind(hit.tx, hit.ty) !== 'stairs') {
      for (const [i, [ux, uy]] of RAMP_DIRS.entries()) {
        const sx = hit.tx - ux;
        const sy = hit.ty - uy;
        const edge = ux > 0 ? hit.x - hit.tx : ux < 0 ? hit.tx + 1 - hit.x : uy > 0 ? hit.y - hit.ty : hit.ty + 1 - hit.y;
        if (edge < STAIRS_EDGE && r.tileKind(sx, sy) === 'stairs' && r.rampDir(sx, sy) === i) {
          return { tx: sx, ty: sy };
        }
      }
    }
    return { tx: hit.tx, ty: hit.ty };
  }

  /**
   * The flight that would go on a tile without stairs: the way last picked
   * if it works there, or else the first that does.
   *
   * @param r - The renderer, for the ways stairs could go.
   * @param tile - The tile under the cursor.
   * @param stairsDir - The way last picked with a right click, if any.
   * @returns The placement, or null.
   */
  override ghost(r: WorldRenderer, tile: TileRef, stairsDir: number | null): StairsPlacement | null {
    if (r.tileKind(tile.tx, tile.ty) !== 'stairs') {
      const options = r.stairsOptions(tile.tx, tile.ty);
      return options.find((o) => o.dir === stairsDir) ?? options[0] ?? null;
    }
    return null;
  }

  /**
   * Left deletes or places, right turns or cycles, then sends at once.
   *
   * @param ctrl - The editor's mouse.
   * @param e - The pointer event.
   * @param tile - The tile under the cursor.
   */
  press(ctrl: MapEditController, e: React.PointerEvent<HTMLDivElement>, tile: TileRef): void {
    const { tx, ty } = tile;
    const onStairs = ctrl.renderer.tileKind(tx, ty) === 'stairs';
    if (e.button === 0 && onStairs) {
      ctrl.batcher.push({ op: 'erase', tx, ty, size: 1 });
    } else if (e.button === 0 && ctrl.placing) {
      ctrl.batcher.push({ op: 'stairs', ...ctrl.placing });
      ctrl.placing = null;
      ctrl.renderer.setStairsGhost(null);
    } else if (e.button === 2 && onStairs) {
      ctrl.batcher.push({ op: 'stairs', tx, ty });
    } else if (e.button === 2) {
      const options = ctrl.renderer.stairsOptions(tx, ty);
      const at = options.findIndex((o) => o.tx === ctrl.placing?.tx && o.ty === ctrl.placing?.ty && o.dir === ctrl.placing?.dir);
      if (options.length > 0) {
        ctrl.stairsDir = options[(at + 1) % options.length].dir;
        ctrl.showCursor(e.clientX, e.clientY);
      }
    }
    ctrl.batcher.flush();
  }
}
