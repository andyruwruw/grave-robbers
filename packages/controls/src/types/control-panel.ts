// Types
import type { LucideIcon } from 'lucide-react';
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { MusicStatus } from '@halloween/shared/audio/music-status';
import type { IncognitoLook } from './incognito-look';

/**
 * The control panel's tabs.
 */
export type ControlTab = 'overview' | 'music' | 'game';

/**
 * One tab button, for a tab bar whose tabs are `K`.
 */
export interface TabInfo<K extends string> {
  /**
   * The tab it opens.
   */
  key: K;

  /**
   * Its name on the button.
   */
  label: string;

  /**
   * Its icon.
   */
  icon: LucideIcon;
}

/**
 * One of the control panel's tab buttons.
 */
export type ControlTabInfo = TabInfo<ControlTab>;

/**
 * Everything the Music tab works: the music choices, what's playing, and
 * incognito and its look.
 */
export interface MusicControls {
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
  onAudio: (settings: AudioSettings) => void;

  /**
   * Plays or pauses.
   */
  onToggle: () => void;

  /**
   * Skips to the next song.
   */
  onNext: () => void;

  /**
   * Takes a song out of, or moves it in, what's up next (its index there
   * and its id).
   */
  onRemove: (index: number, id: string) => void;

  /**
   * Moves a song in what's up next (its index there, its id, and which way).
   */
  onMove: (index: number, id: string, delta: -1 | 1) => void;

  /**
   * Set while another TV plays the music: takes it back.
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

  /**
   * How the graveyard looks behind the Incognito screen.
   */
  look: IncognitoLook;

  /**
   * Called with the full updated look.
   */
  onLook: (look: IncognitoLook) => void;

  /**
   * The largest pixel the TV's zoom may grow to, in screen pixels.
   */
  pixelSize: number;

  /**
   * Called with the new pixel size.
   */
  onPixelSize: (size: number) => void;
}
