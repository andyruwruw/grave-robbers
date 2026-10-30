// Packages
import { parseBlendKey } from '@halloween/shared/map-editor/blend/blend';
import { measureBlend } from '@halloween/shared/map-editor/blend/blend-tiles';
import { brushTiles } from '@halloween/shared/map-editor/brush';
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { PICK_SIZE } from '../../config/map-editor';
import { EditTool } from './edit-tool';

// Types
import type React from 'react';
import type { EditorState, TileRef } from '../../types/map-editor';
import type { MapEditController } from '../map-edit-controller';

/**
 * Pick: a click copies an area's mix into the Mix brush (the mix it was
 * painted with, or else what grows there now) and switches to Mix.
 */
export class PickTool extends EditTool {
  /**
   * The tool's id.
   */
  readonly id = 'pick';

  /**
   * The ring shows the area measured: at least `PICK_SIZE` across.
   *
   * @param state - The editor's state.
   * @returns The ring's size.
   */
  override cursorSize(state: EditorState): number {
    return Math.max(PICK_SIZE, state.size);
  }

  /**
   * Copies the mix under a left click.
   *
   * @param ctrl - The editor's mouse.
   * @param e - The pointer event.
   * @param tile - The tile under the cursor.
   */
  press(ctrl: MapEditController, e: React.PointerEvent<HTMLDivElement>, tile: TileRef): void {
    if (e.button !== 0) {
      return;
    }
    const { tx, ty } = tile;
    const editor = ctrl.editor!;
    const map = ctrl.renderer.worldMap();
    const key = Object.entries(ctrl.blends.current ?? {}).find(([, list]) => list.includes(ty * (map?.width ?? MAP_WIDTH) + tx))?.[0];
    const blend = key !== undefined ? parseBlendKey(key) : map ? measureBlend(map, brushTiles(tx, ty, Math.max(PICK_SIZE, editor.size), map.width, map.height)) : {};
    ctrl.onChange({ ...editor, blend, tool: 'mix' });
  }
}
