// Packages
import React from 'react';
import KillFeed from '@halloween/controls/components/feed/kill-feed';
import MapEditor from '@halloween/controls/components/map-editor/map-editor';
import WorldView from '@halloween/renderer/world/world-view';

// Types
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { KillEntry } from '@halloween/controls/types/feed';
import type { EditorState } from '@halloween/controls/types/map-editor';
import type { TvMouseHandlers } from '@halloween/controls/types/mouse';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * Props for AdminWorld.
 */
interface AdminWorldProps {
  /**
   * The mouse handlers over the map (the editor's while it's open).
   */
  mouse: TvMouseHandlers;

  /**
   * Set to the world view's renderer.
   */
  rendererRef: React.RefObject<WorldRenderer | null>;

  /**
   * The world so far, for a new renderer.
   */
  cache: WorldCache;

  /**
   * The interpolation delay for a new renderer.
   */
  interp: number;

  /**
   * Points the camera as it should be now.
   */
  aimRef: React.RefObject<() => void>;

  /**
   * The kill feed's entries.
   */
  kills: KillEntry[];

  /**
   * The map editor's state, or null while it's closed.
   */
  editor: EditorState | null;

  /**
   * Changes the open editor's state.
   */
  onEditorChange: (next: EditorState) => void;

  /**
   * Saves the map as a preset.
   */
  onSavePreset: (name: string) => void;

  /**
   * Closes the map editor.
   */
  onCloseEditor: () => void;
}

/**
 * The admin console's world pane: the world view, with the kill feed and,
 * while it's open, the map editor over it.
 *
 * @param {AdminWorldProps} props - What the pane shows and works.
 * @returns {React.JSX.Element} The rendered pane.
 */
function AdminWorld({ mouse, rendererRef, cache, interp, aimRef, kills, editor, onEditorChange, onSavePreset, onCloseEditor }: AdminWorldProps): React.JSX.Element {
  return (
    <div
      className='relative h-[45dvh] shrink-0 md:h-auto md:flex-1'
      {...mouse}>
      <WorldView
        className='h-full w-full'
        onReady={(renderer: WorldRenderer | null): void => {
          rendererRef.current = renderer;
          if (!renderer) {
            return;
          }
          cache.prime(renderer);
          renderer.setInterpolation(interp);
          aimRef.current();
        }} />
      <KillFeed kills={kills} />
      {editor && (
        <MapEditor
          state={editor}
          onChange={onEditorChange}
          onSave={onSavePreset}
          onClose={onCloseEditor} />
      )}
    </div>
  );
}

export default AdminWorld;
