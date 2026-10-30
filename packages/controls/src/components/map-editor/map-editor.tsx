// Packages
import React, { useState } from 'react';

// Local Imports
import { TOOL_INFO } from '../../config/map-editor';
import BlendSliders from './blend-sliders';
import BrushSize from './brush-size';
import CollapsedEditorButton from './collapsed-editor-button';
import EditorHeader from './editor-header';
import SavePreset from './save-preset';
import ScatterPicker from './scatter-picker';
import TilePalette from './tile-palette';
import ToolGrid from './tool-grid';
import ViewSwitches from './view-switches';

// Types
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the MapEditor component.
 */
interface MapEditorProps {
  /**
   * The editor's state.
   */
  state: EditorState;

  /**
   * Changes the editor's state.
   */
  onChange: (state: EditorState) => void;

  /**
   * Saves the map as it is now as a preset under this name.
   */
  onSave: (name: string) => void;

  /**
   * Closes the map editor.
   */
  onClose: () => void;
}

/**
 * The TV's map editor panel, down the left edge of the screen while editing:
 * a flat-lighting and hide-monsters view, tools (raise, lower, stairs,
 * paint, mix, pick, erase), brush size, how much of the brush paint fills,
 * the Mix brush's shares, the
 * palette of tiles to paint, and saving the map as a preset (an existing name is
 * replaced). Edits change the live world straight away.
 *
 * @param {MapEditorProps} props - Component props.
 * @returns {React.JSX.Element} The rendered toolbar.
 */
function MapEditor({
  state,
  onChange,
  onSave,
  onClose,
}: MapEditorProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const hint = TOOL_INFO.find((t) => t.tool === state.tool)?.hint ?? '';

  if (hidden) {
    return <CollapsedEditorButton onShow={(): void => setHidden(false)} />;
  }

  return (
    <div className='absolute inset-y-sm left-sm flex w-64 flex-col gap-sm rounded-lg border border-border bg-surface p-md'>
      <EditorHeader
        onHide={(): void => setHidden(true)}
        onClose={onClose} />
      <ViewSwitches
        state={state}
        onChange={onChange} />
      <ToolGrid
        state={state}
        onChange={onChange} />
      {state.tool !== 'stairs' && (
        <BrushSize
          state={state}
          onChange={onChange} />
      )}
      {state.tool === 'paint' && (
        <ScatterPicker
          state={state}
          onChange={onChange} />
      )}
      {state.tool === 'mix' && (
        <BlendSliders
          state={state}
          onChange={onChange} />
      )}
      <span className='text-[11px] leading-snug text-foreground-subtle'>{hint}.</span>
      {state.tool === 'paint' && (
        <TilePalette
          state={state}
          onChange={onChange} />
      )}
      <SavePreset
        name={name}
        saved={saved}
        onName={(next: string): void => {
          setName(next);
          setSaved(null);
        }}
        onSave={(): void => {
          onSave(name.trim());
          setSaved(name.trim());
        }} />
    </div>
  );
}

export default MapEditor;
