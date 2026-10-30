// Packages
import React from 'react';
import { EDIT_SIZE_MAX, EDIT_SIZE_MIN } from '@halloween/shared/map-editor/map-edit';

// Types
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the BrushSize component.
 */
interface BrushSizeProps {
  /**
   * The editor's state.
   */
  state: EditorState;

  /**
   * Changes the editor's state.
   */
  onChange: (state: EditorState) => void;
}

/**
 * The brush size slider.
 *
 * @param {BrushSizeProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slider.
 */
function BrushSize({ state, onChange }: BrushSizeProps): React.JSX.Element {
  return (
    <label className='flex flex-col gap-xsm'>
      <span className='flex justify-between text-xs text-foreground'>
        Brush
        <span className='text-foreground-subtle'>{state.size === 1 ? '1 tile' : `${state.size} tiles across`}</span>
      </span>
      <input
        type='range'
        min={EDIT_SIZE_MIN}
        max={EDIT_SIZE_MAX}
        step={1}
        value={state.size}
        className='w-full accent-brand'
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ ...state, size: Number(e.target.value) })} />
    </label>
  );
}

export default BrushSize;
