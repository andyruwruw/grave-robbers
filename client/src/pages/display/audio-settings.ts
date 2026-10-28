// Packages
import { DEFAULT_AUDIO } from '@halloween/shared/audio';

// Local Imports
import { AUDIO_STORAGE_KEY } from '../../config';
import { readStorage } from '../../helpers/storage';

// Types
import type { AudioSettings } from '@halloween/shared/audio';

/**
 * Set when this page load is the return from the Spotify login.
 */
export const SPOTIFY_RETURN = new URLSearchParams(window.location.search).has('spotify');

/**
 * The TV's saved audio settings, filling in anything an older save lacks
 * (it may still say `source: 'mp3' | 'spotify'`). Coming back from the
 * Spotify login turns the playlist on.
 */
export function loadAudio(): AudioSettings {
  let saved: Partial<AudioSettings> & { source?: string } = {};
  try {
    saved = JSON.parse(readStorage(AUDIO_STORAGE_KEY) ?? '{}') as Partial<AudioSettings>;
  } catch {
    // Unreadable: fall back to the defaults.
  }
  const { source, ...rest } = saved;
  const migrated = source !== undefined && rest.spotify === undefined ? { spotify: source === 'spotify', custom: source === 'mp3' } : {};
  const settings = { ...DEFAULT_AUDIO, ...rest, ...migrated, ...(SPOTIFY_RETURN ? { spotify: true } : {}) };
  return {
    live: settings.live,
    spotify: settings.spotify,
    custom: settings.custom,
    spotifyWeight: settings.spotifyWeight,
    customWeight: settings.customWeight,
    playlist: settings.playlist,
    musicVolume: settings.musicVolume,
    sfxVolume: settings.sfxVolume,
    ambienceVolume: settings.ambienceVolume,
  };
}
