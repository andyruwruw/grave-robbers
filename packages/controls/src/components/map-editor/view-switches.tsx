// Packages
import React from 'react';

// Local Imports
import { VIEW } from '../../config/map-editor';
import SwitchPill from '../ui/switch-pill';

// Types
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the ViewSwitches component.
 */
interface ViewSwitchesProps {
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
 * The editing view's switches (`VIEW`): top-down, flat lighting, and
 * hidden monsters.
 *
 * @param {ViewSwitchesProps} props - Component props.
 * @returns {React.JSX.Element} The rendered switches.
 */
function ViewSwitches({ state, onChange }: ViewSwitchesProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      {VIEW.map(({ key, label }) => (
        <button
          key={key}
          type='button'
          role='switch'
          aria-checked={state[key]}
          className='flex items-center gap-sm rounded-md px-xsm py-0.5 text-left text-xs text-foreground hover:bg-muted'
          onClick={(): void => onChange({ ...state, [key]: !state[key] })}>
          <span className='flex-1'>{label}</span>
          <SwitchPill on={state[key]} />
        </button>
      ))}
    </div>
  );
}

export default ViewSwitches;
