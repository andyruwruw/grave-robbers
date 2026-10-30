// Types
import type { AudioSettings } from './audio-settings';
import type { MusicStatus } from './music-status';

/**
 * What the admin page asks the TV to do with its music.
 */
export type TvControl =
  /**
   * Saves new music settings.
   */
  | { kind: 'audio'; settings: AudioSettings }
  /**
   * Pauses or resumes the music.
   */
  | { kind: 'toggle' }
  /**
   * Skips to the next song.
   */
  | { kind: 'next' }
  /**
   * Removes the song at `index` of the queue, if it's still `id`.
   */
  | { kind: 'remove'; index: number; id: string }
  /**
   * Moves the song at `index` of the queue (if it's still `id`) one place up
   * or down.
   */
  | { kind: 'move'; index: number; id: string; delta: -1 | 1 }
  /**
   * Turns Incognito (the screen that hides the game) on or off.
   */
  | { kind: 'incognito'; on: boolean };

/**
 * The TV's music as the admin page shows it.
 */
export interface TvStatus {
  /**
   * The TV's saved music settings.
   */
  audio: AudioSettings;

  /**
   * What its music player is doing.
   */
  music: MusicStatus;

  /**
   * Whether Incognito is showing.
   */
  incognito: boolean;
}
