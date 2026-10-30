// Packages
import React, { useEffect, useRef, useState } from 'react';
import { IDLE_MUSIC } from '@halloween/shared/audio/music-status';
import { loadMedia } from '@halloween/ui/audio/media/media';
import { MusicPlayer } from '@halloween/ui/audio/music/music-player';
import { sfx } from '@halloween/ui/audio/sfx/sfx';
import { AUDIO_STORAGE_KEY } from '@halloween/ui/config/storage-keys';
import { writeStorage } from '@halloween/ui/helpers/storage';

// Local Imports
import { SoundDirector } from '../audio/sound-director';
import { loadAudio, SPOTIFY_RETURN } from '../helpers/audio-settings';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { MusicStatus } from '@halloween/shared/audio/music-status';
import type { TvControl } from '@halloween/shared/audio/tv-control';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { MusicControls } from '@halloween/controls/types/control-panel';

/**
 * What `useTvMusic` gives the TV page.
 */
export interface TvMusic {
  /**
   * The saved music choices, playlist, and volumes.
   */
  audio: AudioSettings;

  /**
   * What's playing and what's next.
   */
  musicStatus: MusicStatus;

  /**
   * Whether this TV plays the music (another TV may have taken it).
   */
  musicHere: boolean;

  /**
   * Whether the browser has let sound play yet.
   */
  soundOn: boolean;

  /**
   * Turns the game feed into sound.
   */
  director: React.RefObject<SoundDirector>;

  /**
   * Does what the admin page asked.
   */
  applyControl: (control: TvControl) => void;

  /**
   * Takes whether this TV now owns the music.
   */
  onOwner: (owner: boolean) => void;

  /**
   * Everything the Music tab works.
   */
  buildControls: (send: (msg: ClientMessage) => void, closeSidebar: () => void) => MusicControls;
}

/**
 * The TV's music and sound: the music player and the sound director, the
 * saved audio settings (applied and kept as they change), unlocking sound on
 * the first click or key, the ambience, and what the admin page and the
 * Music tab ask of the music.
 *
 * @param incognito - Whether the TV is showing just the now-playing screen (it silences the game).
 * @param setIncognito - Turns incognito on or off.
 * @returns The music's state and controls.
 */
export function useTvMusic(incognito: boolean, setIncognito: (on: boolean) => void): TvMusic {
  const [audio, setAudio] = useState<AudioSettings>(loadAudio);
  const [musicStatus, setMusicStatus] = useState<MusicStatus>(IDLE_MUSIC);
  const [musicHere, setMusicHere] = useState(true);
  const [soundOn, setSoundOn] = useState(sfx.unlocked);
  const music = useRef<MusicPlayer | null>(null);
  music.current ??= new MusicPlayer(setMusicStatus);
  const director = useRef(new SoundDirector(sfx, music.current));

  useEffect(() => {
    const player = music.current!;
    /**
     * Resumes music and unlocks sound on the first gesture.
     */
    const unlock = (): void => {
      player.resume();
      void sfx.unlock().then((): void => setSoundOn(true));
    };
    if (SPOTIFY_RETURN) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    music.current!.setOptions(audio);
    music.current!.setVolume(audio.musicVolume);
    writeStorage(AUDIO_STORAGE_KEY, JSON.stringify(audio));
  }, [audio]);

  useEffect(() => {
    sfx.setVolume(incognito ? 0 : audio.sfxVolume);
  }, [audio.sfxVolume, incognito]);

  useEffect(() => {
    let live = true;
    void loadMedia().then(({ ambience }): void => {
      if (live) {
        sfx.setAmbience(ambience, audio.ambienceVolume);
      }
    });
    return () => {
      live = false;
    };
  }, [audio.ambienceVolume]);

  /**
   * Applies a music or audio control sent from a phone.
   *
   * @param control - The control.
   */
  const applyControl = (control: TvControl): void => {
    if (control.kind === 'audio') {
      setAudio(control.settings);
    } else if (control.kind === 'toggle') {
      music.current!.toggle();
    } else if (control.kind === 'next') {
      music.current!.next();
    } else if (control.kind === 'remove') {
      music.current!.remove(control.index, control.id);
    } else if (control.kind === 'move') {
      music.current!.move(control.index, control.id, control.delta);
    } else {
      setIncognito(control.on);
    }
  };

  /**
   * Turns music on here when this TV owns it, off otherwise.
   *
   * @param owner - Whether this TV plays the music.
   */
  const onOwner = (owner: boolean): void => {
    music.current!.setEnabled(owner);
    setMusicHere(owner);
  };

  /**
   * The music controls for the sidebar.
   *
   * @param send - Sends a message to the server.
   * @param closeSidebar - Closes the sidebar.
   * @returns The controls.
   */
  const buildControls = (send: (msg: ClientMessage) => void, closeSidebar: () => void): MusicControls => ({
    settings: audio,
    status: musicStatus,
    onAudio: setAudio,
    onToggle: (): void => music.current!.toggle(),
    onNext: (): void => music.current!.next(),
    onClaimMusic: musicHere ? undefined : (): void => send({ t: 'claim-music' }),
    onRemove: (index: number, id: string): void => music.current!.remove(index, id),
    onMove: (index: number, id: string, delta: -1 | 1): void => music.current!.move(index, id, delta),
    incognito,
    onIncognito: (on: boolean): void => {
      setIncognito(on);
      if (on) {
        closeSidebar();
      }
    },
  });

  return { audio, musicStatus, musicHere, soundOn, director, applyControl, onOwner, buildControls };
}
