// Packages
import React from 'react';
import { EDIT_PALETTE } from '@halloween/shared/map-editor/palette';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { EditorState } from '../../types/map-editor';

/**
 * Props for the TilePalette component.
 */
interface TilePaletteProps {
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
 * The palette of tiles Paint can lay (`EDIT_PALETTE`), by group.
 *
 * @param {TilePaletteProps} props - Component props.
 * @returns {React.JSX.Element} The rendered palette.
 */
function TilePalette({ state, onChange }: TilePaletteProps): React.JSX.Element {
  return (
    <div className='scrollbar-thin flex min-h-0 flex-1 flex-col gap-sm overflow-y-auto pr-xsm'>
      {EDIT_PALETTE.map(({ group, tiles }) => (
        <div
          key={group}
          className='flex flex-col gap-xsm'>
          <span className='text-[10px] uppercase tracking-wide text-foreground-subtle'>{group}</span>
          <div className='flex flex-wrap gap-xsm'>
            {tiles.map(({ tile, label, mix }: { tile: Tile; label: string; mix?: Tile[] }) => (
              <button
                key={label}
                type='button'
                aria-pressed={state.label === label}
                className={`rounded-sm border px-xsm py-0.5 text-[11px] ${state.tile === tile ? 'border-brand bg-brand-muted text-foreground' : 'border-transparent bg-muted text-foreground-muted hover:text-foreground'}`}
                onClick={(): void => onChange({ ...state, label, tile, mix })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TilePalette;
