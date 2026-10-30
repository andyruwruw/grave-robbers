// Packages
import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  X,
} from 'lucide-react';

// Local Imports
import { SOURCE_LABELS } from '../../config/music';
import RowButton from './row-button';
import SongArt from './song-art';

// Types
import type { QueueEntry } from '@halloween/shared/audio/music-status';

/**
 * Props for the UpNextRow component.
 */
interface UpNextRowProps {
  /**
   * The song.
   */
  entry: QueueEntry;

  /**
   * Its place in what's up next.
   */
  index: number;

  /**
   * How many songs from the Spotify queue come first (a song can't move
   * above them).
   */
  queued: number;

  /**
   * How many songs are up next.
   */
  count: number;

  /**
   * Takes a song out of what's up next.
   */
  onRemove: (index: number, id: string) => void;

  /**
   * Moves a song in what's up next.
   */
  onMove: (index: number, id: string, delta: -1 | 1) => void;
}

/**
 * One song up next: its cover, title, artist, and source, and (for the
 * player's own songs) move up, move down, and remove.
 *
 * @param {UpNextRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function UpNextRow({
  entry,
  index: i,
  queued,
  count,
  onRemove,
  onMove,
}: UpNextRowProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-sm'>
      <SongArt
        src={entry.art}
        size={28} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <span className='truncate text-xs text-foreground'>{entry.title}</span>
        <span className='truncate text-[11px] text-foreground-subtle'>
          {entry.artist ? `${entry.artist} · ` : ''}
          <span className={entry.source === 'queue' ? 'text-brand' : ''}>{SOURCE_LABELS[entry.source]}</span>
        </span>
      </div>
      {entry.source !== 'queue' && (
        <div className='flex shrink-0 items-center'>
          <RowButton
            label='Move up'
            disabled={i <= queued}
            onClick={(): void => onMove(i, entry.id, -1)}>
            <ArrowUp size={13} />
          </RowButton>
          <RowButton
            label='Move down'
            disabled={i === count - 1}
            onClick={(): void => onMove(i, entry.id, 1)}>
            <ArrowDown size={13} />
          </RowButton>
          <RowButton
            label='Remove'
            onClick={(): void => onRemove(i, entry.id)}>
            <X size={13} />
          </RowButton>
        </div>
      )}
    </div>
  );
}

export default UpNextRow;
