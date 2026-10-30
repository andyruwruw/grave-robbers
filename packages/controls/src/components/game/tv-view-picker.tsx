// Packages
import React from 'react';

// Local Imports
import { TV_VIEWS } from '../../config/tv-view';

// Types
import type { TvView } from '../../types/tv-view';

/**
 * Props for the TvViewPicker component.
 */
interface TvViewPickerProps {
  /**
   * The TV's view preset for huge worlds.
   */
  tvView: TvView;

  /**
   * Picks another preset.
   */
  onTvView: (view: TvView) => void;
}

/**
 * The TV view presets (`TV_VIEWS`): how much ground each pane of a huge
 * world shows.
 *
 * @param {TvViewPickerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered picker.
 */
function TvViewPicker({ tvView, onTvView }: TvViewPickerProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      <span className='text-xs font-medium text-foreground'>TV view</span>
      <span className='text-xs text-foreground-muted'>How much ground each player's view shows on a huge map</span>
      <div className='grid grid-cols-2 gap-xsm'>
        {TV_VIEWS.map(({ id, label, hint }) => (
          <button
            key={id}
            type='button'
            aria-pressed={tvView === id}
            className={`flex flex-col items-start rounded-md border px-sm py-xsm text-left ${tvView === id ? 'border-brand bg-brand-muted' : 'border-border hover:bg-muted'}`}
            onClick={(): void => onTvView(id)}>
            <span className='text-xs text-foreground'>{label}</span>
            <span className='text-[11px] text-foreground-subtle'>{hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TvViewPicker;
