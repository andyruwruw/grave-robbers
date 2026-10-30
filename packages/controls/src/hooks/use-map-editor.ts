// Packages
import React, { useEffect, useRef } from 'react';

// Local Imports
import { MapEditController } from '../editing/map-edit-controller';

// Types
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { EditorState } from '../types/map-editor';
import type { TvMouseHandlers } from '../types/mouse';

/**
 * The TV's mouse while the map editor is open (`MapEditController`): a ring
 * follows the tile under the cursor showing what the round brush covers,
 * and pressing (and dragging) edits the tiles under it. Raise and lower
 * only touch tiles at the level the stroke starts on, taking them one level
 * up or down. Stairs are a click each: a see-through flight shows where
 * they'd go and which way they'd climb; left places them (or deletes
 * stairs already there), right turns them. Clears the cursor and the
 * flight when the editor closes or leaves the Stairs tool.
 *
 * @param {React.RefObject<WorldRenderer | null>} renderer - The TV's renderer, for picking.
 * @param {EditorState | null} editor - The editor's tool, or null while it's closed.
 * @param {React.RefObject<BlendAreas | null>} blends - The Mix settings the map remembers, for the picker.
 * @param {(next: EditorState) => void} onChange - Changes the editor's state (the picker sets the Mix brush).
 * @param {(msg: ClientMessage) => void} send - Sends to the server.
 * @returns {TvMouseHandlers} Handlers for the element over the map.
 */
export function useMapEditor(
  renderer: React.RefObject<WorldRenderer | null>,
  editor: EditorState | null,
  blends: React.RefObject<BlendAreas | null>,
  onChange: (next: EditorState) => void,
  send: (msg: ClientMessage) => void,
): TvMouseHandlers {
  const controller = useRef<MapEditController | null>(null);
  controller.current ??= new MapEditController();
  controller.current.sync(renderer, editor, blends, onChange, send);

  useEffect(() => {
    if (!editor) {
      renderer.current?.setEditCursor(null);
    }
    if (editor?.tool !== 'stairs') {
      renderer.current?.setStairsGhost(null);
    }
  }, [editor, renderer]);

  useEffect(() => () => {
    controller.current!.dispose();
  }, []);

  return controller.current.handlers();
}
