// Packages
import { useEffect } from 'react';

// Types
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { EditorState } from '../types/map-editor';

/**
 * Puts the map editor's view on the page's renderers whenever it changes:
 * flat light, monsters hidden, the top view, and x-ray for the tools that
 * shape the ground (raise, lower, stairs). All off while it's closed.
 *
 * @param {EditorState | null} editor - The editor's state, or null while it's closed.
 * @param {(f: (renderer: WorldRenderer) => void) => void} each - Runs a function on each of the page's renderers.
 */
export function useEditorView(editor: EditorState | null, each: (f: (renderer: WorldRenderer) => void) => void): void {
  useEffect(() => {
    each((renderer: WorldRenderer): void => {
      renderer.setFlatLight(editor?.flat ?? false);
      renderer.setMonstersHidden(editor?.hideMonsters ?? false);
      renderer.setTopView(editor?.topView ?? false);
      renderer.setXray(editor !== null && (editor.tool === 'raise' || editor.tool === 'lower' || editor.tool === 'stairs'));
    });
  }, [editor]);
}
