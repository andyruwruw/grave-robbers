// Packages
import React from 'react';
import { Disc3 } from 'lucide-react';
import Button from '@halloween/ui/components/ui/controls/button';
import { Caption } from '@halloween/ui/components/typography/typography';

// Local Imports
import PlaylistPicker from './playlist-picker';
import SectionCard from './section-card';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { SpotifyAccount } from '../../hooks/use-spotify-account';

/**
 * Props for the SpotifyCard component.
 */
interface SpotifyCardProps {
  /**
   * The account's status and playlists, and login and logout.
   */
  account: SpotifyAccount;

  /**
   * Saved music choices.
   */
  settings: AudioSettings;

  /**
   * Called with the full updated settings.
   */
  onChange: (settings: AudioSettings) => void;
}

/**
 * The Spotify account (connect or disconnect) and its playlist, picked
 * from a searchable menu with covers.
 *
 * @param {SpotifyCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function SpotifyCard({ account, settings, onChange }: SpotifyCardProps): React.JSX.Element {
  const { spotify, playlists, login, logout } = account;

  return (
    <SectionCard
      icon={Disc3}
      title='Spotify'>
      {!spotify && <Caption>Checking Spotify...</Caption>}
      {spotify && !spotify.configured && <Caption>Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for the server to use Spotify (see the README).</Caption>}
      {spotify?.configured && !spotify.linked && (
        <Button
          variant='outline'
          size='sm'
          onClick={login}>
          Connect Spotify
        </Button>
      )}
      {spotify?.linked && (
        <>
          <PlaylistPicker
            playlists={playlists}
            value={settings.playlist}
            onChange={(playlist: string): void => onChange({ ...settings, playlist })} />
          <Button
            variant='ghost'
            size='sm'
            onClick={logout}>
            Disconnect Spotify
          </Button>
        </>
      )}
    </SectionCard>
  );
}

export default SpotifyCard;
