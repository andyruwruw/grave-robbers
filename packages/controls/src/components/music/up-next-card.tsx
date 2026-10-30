// Packages
import React from 'react';
import { ListMusic } from 'lucide-react';

// Local Imports
import SectionCard from './section-card';
import UpNextRow from './up-next-row';

// Types
import type { QueueEntry } from '@halloween/shared/audio/music-status';

/**
 * Props for the UpNextCard component.
 */
interface UpNextCardProps {
  /**
   * The songs up next, in order.
   */
  upNext: QueueEntry[];

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
 * What's up next: the Spotify queue's songs first, then the rest, each of
 * the player's own songs able to move up or down or come out.
 *
 * @param {UpNextCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function UpNextCard({ upNext, onRemove, onMove }: UpNextCardProps): React.JSX.Element {
  const queued = upNext.filter((e: QueueEntry): boolean => e.source === 'queue').length;

  return (
    <SectionCard
      icon={ListMusic}
      title='Up next'>
      <div className='flex flex-col gap-xsm'>
        {upNext.map((entry: QueueEntry, i: number) => (
          <UpNextRow
            key={`${entry.id}-${i}`}
            entry={entry}
            index={i}
            queued={queued}
            count={upNext.length}
            onRemove={onRemove}
            onMove={onMove} />
        ))}
      </div>
    </SectionCard>
  );
}

export default UpNextCard;
