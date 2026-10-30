// Packages
import { useRef, useState } from 'react';

// Local Imports
import { DEFAULT_EDITOR_STATE } from '../config/map-editor';

// Types
import type { EditorState } from '../types/map-editor';

/**
 * What `useEditorState` gives the page.
 */
export interface EditorStateControls {
  /**
   * The map editor's state, or null while it's closed.
   */
  editor: EditorState | null;

  /**
   * Changes the open editor's state, and remembers it for next time.
   */
  changeEditor: (next: EditorState) => void;

  /**
   * Opens the editor as it was last left.
   */
  open: () => void;

  /**
   * Closes the editor.
   */
  close: () => void;
}

/**
 * The map editor's open state: closed at first, and reopening as it was
 * last left (`DEFAULT_EDITOR_STATE` the first time).
 *
 * @returns {EditorStateControls} The state and ways to change it.
 */
export function useEditorState(): EditorStateControls {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const lastEditor = useRef<EditorState>(DEFAULT_EDITOR_STATE);

  /**
   * Sets the editor state and remembers it for the next open.
   * @param next The new state.
   */
  const changeEditor = (next: EditorState): void => {
    lastEditor.current = next;
    setEditor(next);
  };

  /**
   * Opens the editor with its last state.
   */
  const open = (): void => setEditor(lastEditor.current);
  /**
   * Closes the editor.
   */
  const close = (): void => setEditor(null);

  return { editor, changeEditor, open, close };
}
