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

  /**
   * Weight of the custom songs against the playlist (see `spotifyWeight`).
   */
  customWeight: number;

  /**
   * Spotify playlist URI.
   */
  playlist: string | null;

  /**
   * Music volume, 0 to 1.
   */
  musicVolume: number;

  /**
   * Sound effects volume, 0 to 1.
   */
  sfxVolume: number;

  /**
   * Ambience loop volume, 0 to 1.
   */
  ambienceVolume: number;
}

/**
 * The settings a TV starts with before any are saved.
 */
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
