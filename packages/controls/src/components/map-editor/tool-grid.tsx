// Packages
import React from 'react';

// Local Imports
import { TOOL_INFO } from '../../config/map-editor';

// Types
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the ToolGrid component.
 */
interface ToolGridProps {
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
 * The tool buttons (`TOOL_INFO`), the picked one highlighted.
 *
 * @param {ToolGridProps} props - Component props.
 * @returns {React.JSX.Element} The rendered grid.
 */
function ToolGrid({ state, onChange }: ToolGridProps): React.JSX.Element {
  return (
    <div className='grid grid-cols-3 gap-xsm'>
      {TOOL_INFO.map(({ tool, label, icon: Icon }) => (
        <button
          key={tool}
          type='button'
          aria-pressed={state.tool === tool}
          className={`flex flex-col items-center gap-0.5 rounded-md border px-xsm py-xsm text-[11px] transition-colors ${state.tool === tool ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground-muted hover:text-foreground'}`}
          onClick={(): void => onChange({ ...state, tool })}>
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default ToolGrid;
