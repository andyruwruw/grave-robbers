// Packages
import React from 'react';
import {
  EyeOff,
  Music,
  Pause,
  Play,
  SkipForward,
} from 'lucide-react';
import Button from '@halloween/ui/components/ui/controls/button';

// Local Imports
import { SOURCE_LABELS } from '../../config/music';
import SectionCard from './section-card';
import SongArt from './song-art';

// Types
import type { MusicStatus } from '@halloween/shared/audio/music-status';

/**
 * Props for the NowPlayingCard component.
 */
interface NowPlayingCardProps {
  /**
   * What's playing and what's next.
   */
  status: MusicStatus;

  /**
   * Plays or pauses.
   */
  onToggle: () => void;

  /**
   * Skips to the next song.
   */
  onNext: () => void;

  /**
   * Set while another TV page plays the music: takes it back.
   */
  onClaimMusic?: () => void;

  /**
   * Whether the TV is showing just the now-playing screen.
   */
  incognito: boolean;

  /**
   * Turns incognito on or off.
   */
  onIncognito: (on: boolean) => void;
}

/**
 * What's playing, with play/pause and skip, the last error, taking the
 * music back from another TV, and Incognito (which hides the game's chrome
 * behind a plain now-playing screen until someone joins).
 *
 * @param {NowPlayingCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function NowPlayingCard({
  status,
  onToggle,
  onNext,
  onClaimMusic,
  incognito,
  onIncognito,
}: NowPlayingCardProps): React.JSX.Element {
  const current = status.current;

  return (
    <SectionCard
      icon={Play}
      title='Now playing'>
      <div className='flex items-center gap-sm'>
        <SongArt
          src={current?.art ?? null}
          size={48} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='truncate text-sm text-foreground'>{current?.title ?? 'Nothing playing'}</span>
          {current?.artist && <span className='truncate text-xs text-foreground-subtle'>{current.artist}</span>}
          {current && <span className='text-[10px] uppercase tracking-wide text-foreground-subtle'>{SOURCE_LABELS[current.source]}</span>}
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label={status.playing ? 'Pause' : 'Play'}
          onClick={onToggle}>
          {status.playing ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Next song'
          onClick={onNext}>
          <SkipForward size={16} />
        </Button>
      </div>
      {status.error && <span className='text-xs text-danger'>{status.error}</span>}
      {onClaimMusic && (
        <Button
          variant='outline'
          size='sm'
          onClick={onClaimMusic}>
          <Music size={14} />
          Play music here
        </Button>
      )}
      <Button
        variant={incognito ? 'secondary' : 'outline'}
        size='sm'
        aria-pressed={incognito}
        onClick={(): void => onIncognito(!incognito)}>
        <EyeOff size={14} />
        Incognito
      </Button>
    </SectionCard>
  );
}

export default NowPlayingCard;
