// Packages
import React from 'react';
import { EDIT_SCATTER } from '@halloween/shared/map-editor/map-edit';

// Types
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the ScatterPicker component.
 */
interface ScatterPickerProps {
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
 * The Fill buttons: how much of the brush Paint fills.
 *
 * @param {ScatterPickerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered buttons.
 */
function ScatterPicker({ state, onChange }: ScatterPickerProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-xsm'>
      <span className='text-[11px] text-foreground-subtle'>Fill</span>
      {EDIT_SCATTER.map((share: number) => (
        <button
          key={share}
          type='button'
          aria-pressed={state.scatter === share}
          className={`h-7 rounded-md border px-sm text-xs ${state.scatter === share ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted hover:text-foreground'}`}
          onClick={(): void => onChange({ ...state, scatter: share })}>
          {share === 1 ? 'All' : `${Math.round(share * 100)}%`}
        </button>
      ))}
    </div>
  );
}

export default ScatterPicker;
