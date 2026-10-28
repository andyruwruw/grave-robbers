/**
 * Sounds the server asks one phone to play for its own player's actions.
 * (Hurt, death, and respawn come from the phone's vitals instead.)
 */
export type PhoneSound = 'chop' | 'mine' | 'dig' | 'hit' | 'build' | 'craft' | 'pickup' | 'candy' | 'drop' | 'refuel' | 'equip' | 'shoot' | 'break' | 'unlock' | 'drink' | 'error';

/**
 * Whether the server has Spotify credentials and a linked account.
 */
export interface SpotifyStatus {
  configured: boolean;
  linked: boolean;
}

/**
 * One of the linked account's playlists, for the TV's picker.
 */
export interface SpotifyPlaylist {
  name: string;
  uri: string;

  /**
   * A small cover image, if it has one.
   */
  image: string | null;
}

/**
 * One bundled song from the server's media folder: an mp3 per part (or one
 * `full` mp3), played together, and its cover art if it has any.
 */
export interface MediaSong {
  id: string;
  parts: { name: string; url: string }[];
  art: string | null;

  /**
   * Title and artist from the song folder's `meta.json`, which win over the
   * mp3's ID3 tags (for songs tagged wrong or not at all).
   */
  title: string | null;
  artist: string | null;
}

/**
 * Everything in the server's media folder: songs, mp3s that replace
 * synthesized sound effects, and ambience loops for the TV.
 */
export interface MediaManifest {
  songs: MediaSong[];
  sfx: { name: string; url: string }[];
  ambience: string[];
}

/**
 * The TV's saved music choices: what to play (the linked account's live
 * Spotify queue first, then the chosen playlist shuffled with custom songs
 * shuffled in), and the three volumes.
 */
export interface AudioSettings {
  /**
   * Play what's queued on the Spotify account (from a phone or a Jam)
   * before anything else.
   */
  live: boolean;

  /**
   * Shuffle the chosen Spotify playlist.
   */
  spotify: boolean;

  /**
   * Shuffle in the custom songs from the server's media folder.
   */
  custom: boolean;

  /**
   * How often the playlist and the custom songs are picked against each
   * other (0..1 each, only their ratio matters).
   */
  spotifyWeight: number;
  customWeight: number;

  /**
   * Spotify playlist URI.
   */
  playlist: string | null;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
}

export const DEFAULT_AUDIO: AudioSettings = {
  live: false,
  spotify: false,
  custom: true,
  spotifyWeight: 0.75,
  customWeight: 0.25,
  playlist: null,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  ambienceVolume: 0.35,
};

/**
 * Where a queued song came from: queued on the Spotify account (plays
 * first), the playlist, or the custom songs.
 */
export type QueueSource = 'queue' | 'playlist' | 'custom';

/**
 * One song in the TV's queue, as the panels show it.
 */
export interface QueueEntry {
  id: string;
  title: string;
  artist: string | null;
  art: string | null;
  source: QueueSource;
}

/**
 * What the music player is doing, for the panels and Incognito.
 */
export interface MusicStatus {
  playing: boolean;
  current: QueueEntry | null;
  upNext: QueueEntry[];
  error: string | null;
}

export const IDLE_MUSIC: MusicStatus = { playing: false, current: null, upNext: [], error: null };

/**
 * What the admin page asks the TV to do with its music.
 */
export type TvControl =
  | { kind: 'audio'; settings: AudioSettings }
  | { kind: 'toggle' }
  | { kind: 'next' }
  | { kind: 'remove'; index: number; id: string }
  | { kind: 'move'; index: number; id: string; delta: -1 | 1 }
  | { kind: 'incognito'; on: boolean };

/**
 * The TV's music as the admin page shows it.
 */
export interface TvStatus {
  audio: AudioSettings;
  music: MusicStatus;
  incognito: boolean;
}
