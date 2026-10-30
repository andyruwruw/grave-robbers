// Packages
import { useEffect, useState } from 'react';
import {
  spotifyLogout,
  spotifyPlaylists,
  spotifyStatus,
} from '@halloween/ui/audio/spotify/spotify-account';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { SpotifyPlaylist, SpotifyStatus } from '@halloween/shared/audio/spotify';

/**
 * What `useSpotifyAccount` gives the Music tab.
 */
export interface SpotifyAccount {
  /**
   * Whether the server can use Spotify and an account is linked, or null
   * while checking.
   */
  spotify: SpotifyStatus | null;

  /**
   * The linked account's playlists.
   */
  playlists: SpotifyPlaylist[];

  /**
   * Sends the browser to Spotify's login, coming back to this page.
   */
  login: () => void;

  /**
   * Unlinks the account and turns its sources off.
   */
  logout: () => void;
}

/**
 * The Spotify account behind the Music tab: checks it (and loads its
 * playlists) once, picks the first playlist when the playlist source is on
 * without one, and logs in or out.
 *
 * @param {AudioSettings} settings - The saved music choices.
 * @param {(settings: AudioSettings) => void} onChange - Called with the full updated settings.
 * @returns {SpotifyAccount} The account's status and playlists, and login and logout.
 */
export function useSpotifyAccount(settings: AudioSettings, onChange: (settings: AudioSettings) => void): SpotifyAccount {
  const [spotify, setSpotify] = useState<SpotifyStatus | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);

  useEffect(() => {
    let live = true;
    void spotifyStatus().then(async (next: SpotifyStatus): Promise<void> => {
      if (!live) {
        return;
      }
      setSpotify(next);
      if (next.linked) {
        const lists = await spotifyPlaylists();
        if (live) {
          setPlaylists(lists);
        }
      }
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (settings.spotify && !settings.playlist && playlists.length > 0) {
      onChange({ ...settings, playlist: playlists[0].uri });
    }
  }, [settings, playlists, onChange]);

  /**
   * Sends the browser to the Spotify login, coming back to this page.
   */
  const login = (): void => {
    const back = `${window.location.origin}${window.location.pathname}`;
    window.location.href = `/auth/spotify/login?return=${encodeURIComponent(back)}`;
  };

  /**
   * Unlinks Spotify and turns off live Spotify music.
   */
  const logout = (): void => {
    void spotifyLogout().then((): void => {
      setSpotify((s: SpotifyStatus | null): SpotifyStatus | null => (s ? { ...s, linked: false } : s));
      setPlaylists([]);
      onChange({ ...settings, live: false, spotify: false, playlist: null });
    });
  };

  return { spotify, playlists, login, logout };
}
