// Packages
import React from 'react';
import { Music } from 'lucide-react';

// Types
import type { MusicStatus } from '@halloween/shared/audio/music-status';

/**
 * Props for the IncognitoScreen component.
 */
interface IncognitoScreenProps {
  /**
   * Shown, or fading away.
   */
  on: boolean;

  /**
   * What's playing.
   */
  status: MusicStatus;
}

/**
 * A plain now-playing screen over the TV, so it passes for a music display
 * with an animated background: the album art big in the middle and the
 * title and artist below it, over the live graveyard.
 * Fades in and out.
 *
 * @param {IncognitoScreenProps} props - Component props.
 * @returns {React.JSX.Element} The rendered screen.
 */
function IncognitoScreen({
  on,
  status,
}: IncognitoScreenProps): React.JSX.Element {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden transition-opacity duration-[1500ms] ${on ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!on}>
      <div className='relative flex flex-col items-center gap-4'>
        {status.current?.art
          ? (
            <img
              src={status.current?.art}
              alt=''
              className='aspect-square h-[27vh] rounded-md object-cover shadow-[0_24px_80px_rgba(0,0,0,0.7)]' />
          )
          : (
            <div className='flex aspect-square h-[27vh] items-center justify-center rounded-md bg-muted text-foreground-subtle shadow-[0_24px_80px_rgba(0,0,0,0.7)]'>
              <Music size={60} />
            </div>
          )}
        <div className='flex max-w-[70vw] flex-col items-center gap-1 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'>
          <span className='truncate text-[2.6vh] font-semibold text-foreground'>{status.current?.title ?? 'Nothing playing'}</span>
          {status.current?.artist && <span className='truncate text-[1.9vh] text-foreground-muted'>{status.current.artist}</span>}
        </div>
      </div>
    </div>
  );
}

export default IncognitoScreen;
