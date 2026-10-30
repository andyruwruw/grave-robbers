// Packages
import React from 'react';

// Local Imports
import { useSpotifyAccount } from '../../hooks/use-spotify-account';
import MusicSourcesCard from './music-sources-card';
import NowPlayingCard from './now-playing-card';
import SpotifyCard from './spotify-card';
import UpNextCard from './up-next-card';
import VolumeCard from './volume-card';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { MusicStatus } from '@halloween/shared/audio/music-status';

/**
 * Props for the MusicPanel component.
 */
interface MusicPanelProps {
  /**
   * Saved music choices, playlist, and volumes.
   */
  settings: AudioSettings;

  /**
   * What's playing and what's next.
   */
  status: MusicStatus;

  /**
   * Called with the full updated settings.
   */
  onChange: (settings: AudioSettings) => void;

  /**
   * Plays or pauses.
   */
  onToggle: () => void;

  /**
   * Skips to the next song.
   */
  onNext: () => void;

  /**
   * Takes a song out of what's up next.
   */
  onRemove: (index: number, id: string) => void;

  /**
   * Moves a song in what's up next.
   */
  onMove: (index: number, id: string, delta: -1 | 1) => void;

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
 * Music controls for the TV, as cards: the music, ambience, and sound
 * effect volumes; what's playing (play/pause and skip, Incognito, which
 * hides the game's chrome behind a plain now-playing screen until someone
 * joins); what's up next (each of the player's own songs can move up or
 * down or come out); what to play (the Spotify account's queue first, a
 * Spotify playlist, the custom songs, in any mix, with a slider under each
 * shuffled source for how often it's picked against the other); and the
 * Spotify account and playlist (picked from a searchable menu with
 * covers).
 *
 * @param {MusicPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function MusicPanel({
  settings,
  status,
  onChange,
  onToggle,
  onNext,
  onRemove,
  onMove,
  onClaimMusic,
  incognito,
  onIncognito,
}: MusicPanelProps): React.JSX.Element {
  const account = useSpotifyAccount(settings, onChange);

  return (
    <div className='flex flex-col gap-lg'>
      <VolumeCard
        settings={settings}
        onChange={onChange} />

      <NowPlayingCard
        status={status}
        onToggle={onToggle}
        onNext={onNext}
        onClaimMusic={onClaimMusic}
        incognito={incognito}
        onIncognito={onIncognito} />

      {status.upNext.length > 0 && (
        <UpNextCard
          upNext={status.upNext}
          onRemove={onRemove}
          onMove={onMove} />
      )}

      <MusicSourcesCard
        settings={settings}
        onChange={onChange} />

      <SpotifyCard
        account={account}
        settings={settings}
        onChange={onChange} />
    </div>
  );
}

export default MusicPanel;
