// Local Imports
import {
  playTrack,
  skipToQueued,
  transferPlayback,
} from '../spotify/spotify-api';
import { spotifyStatus, spotifyToken } from '../spotify/spotify-account';
import { loadSpotifySdk } from '../spotify/spotify-sdk';
import { MusicSource } from './music-source';

// Types
import type { SpotifySourceHooks } from '../../types/music';
import type {
  SpotifyPlaybackState,
  SpotifyPlayer,
  SpotifyTrack,
} from '../../types/spotify';

/**
 * Plays Spotify tracks one at a time on the Web Playback SDK device
 * (Spotify Premium). The music player reads and writes its fields directly
 * as it keeps Spotify and the custom songs from playing at once.
 */
export class SpotifySource extends MusicSource {
  /**
   * The SDK player, once connecting has started.
   */
  player: SpotifyPlayer | null = null;

  /**
   * The connection in progress or made, shared by everyone who asks.
   */
  connecting: Promise<void> | null = null;

  /**
   * The SDK device, once it's ready.
   */
  deviceId: string | null = null;

  /**
   * Whether the account's playback is on this device.
   */
  deviceActive = false;

  /**
   * The last Spotify state and when it came, to tell how far into the
   * track it is now.
   */
  state: { state: SpotifyPlaybackState; at: number } | null = null;

  /**
   * A track asked for but not yet reported playing, and since when.
   */
  pending: { uri: string; at: number } | null = null;

  /**
   * The end-of-track fade, 0..1.
   */
  fade = 1;

  /**
   * Until when (seconds) Spotify reporting it plays isn't taken as someone
   * starting it from a phone: right after the player paused it itself.
   */
  quietUntil = 0;

  /**
   * Makes the source for one music player.
   *
   * @param _hooks - What it asks of the player.
   */
  constructor(private readonly _hooks: SpotifySourceHooks) {
    super();
  }

  /**
   * Connects the SDK player once (again after a failure or a release).
   *
   * @returns Resolves once connected, or once connecting failed (the error is shown).
   */
  connect(): Promise<void> {
    if (!this._hooks.isEnabled()) {
      return Promise.resolve();
    }
    this.connecting ??= (async (): Promise<void> => {
      const { linked } = await spotifyStatus();
      if (!linked) {
        this.connecting = null;
        throw new Error('Connect a Spotify account first.');
      }
      const Spotify = await loadSpotifySdk();
      const player = new Spotify.Player({
        name: 'Graveyard TV',
        volume: this._hooks.volume(),
        getOAuthToken: (cb: (token: string) => void): void => {
          void spotifyToken().then((token: string | null): void => {
            if (token) {
              cb(token);
            }
          });
        },
      });
      const ready = new Promise<void>((resolve): void => {
        player.addListener('ready', ({ device_id }): void => {
          this.deviceId = device_id;
          resolve();
        });
      });
      player.addListener('not_ready', (): void => {
        this.deviceId = null;
        this.deviceActive = false;
      });
      player.addListener('player_state_changed', (state: SpotifyPlaybackState | null): void => this._hooks.onState(state));
      for (const event of ['initialization_error', 'authentication_error', 'account_error', 'playback_error'] as const) {
        player.addListener(event, ({ message }): void => {
          this._hooks.fail(event === 'account_error' ? 'Spotify playback needs a Premium account.' : message);
        });
      }
      this.player = player;
      await player.connect();
      await ready;
      if (this._hooks.isDisposed() || this.player !== player) {
        player.disconnect();
      }
    })().catch((err: Error): void => {
      this._hooks.fail(err.message);
      this._hooks.publish();
    });
    return this.connecting;
  }

  /**
   * Pauses Spotify unless it's known to be paused already. A track asked
   * for may not have reported in yet, so not knowing counts as playing
   * (the error an empty player reports is ignored).
   */
  pause(): void {
    if (!this.player || this.state?.state.paused) {
      return;
    }
    this.pending = null;
    this.quietUntil = performance.now() / 1000 + 2;
    void this.player.pause().catch((): void => {});
  }

  /**
   * Resumes Spotify.
   */
  resume(): void {
    void this.player?.resume().catch((): void => {});
  }

  /**
   * Unlocks the SDK's audio element from a user gesture.
   */
  activate(): void {
    void this.player?.activateElement();
  }

  /**
   * Plays one track on the device.
   *
   * @param uri - The track.
   * @param isStale - Whether the track stopped being wanted while connecting.
   */
  async playUri(uri: string, isStale: () => boolean): Promise<void> {
    this.pending = { uri, at: performance.now() / 1000 };
    this.fade = 1;
    this._hooks.applyVolume();
    try {
      await this.connect();
      if (!this.deviceId) {
        throw new Error('The Spotify player isn’t ready.');
      }
      if (isStale()) {
        return;
      }
      await playTrack(this.deviceId, uri);
      this._hooks.clearError();
    } catch (err) {
      this.pending = null;
      this._hooks.fail((err as Error).message);
      this._hooks.publish();
    }
  }

  /**
   * Plays the head of the account's queue by skipping to it, which also
   * takes it off the queue.
   *
   * @param track - That track, already taken off the player's copy of the queue.
   */
  async playQueued(track: SpotifyTrack): Promise<void> {
    this.pending = { uri: track.uri, at: performance.now() / 1000 };
    this.fade = 1;
    this._hooks.applyVolume();
    this._hooks.publish();
    try {
      await this.connect();
      if (!this.deviceId) {
        throw new Error('The Spotify player isn’t ready.');
      }
      if (!this.deviceActive) {
        await transferPlayback(this.deviceId);
      }
      await skipToQueued(this.deviceId);
      await this.player?.resume();
    } catch (err) {
      this.pending = null;
      this._hooks.fail((err as Error).message);
      this._hooks.publish();
    }
  }

  /**
   * Pauses, lets go of the device, and forgets the connection, for when
   * another TV page takes the music.
   */
  release(): void {
    this.pending = null;
    if (this.player) {
      void this.player.pause().catch((): void => {});
      this.player.disconnect();
    }
    this.player = null;
    this.state = null;
    this.connecting = null;
    this.deviceId = null;
    this.deviceActive = false;
  }

  /**
   * Applies the music volume, under the end-of-track fade.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): void {
    void this.player?.setVolume(Math.max(0.0001, volume * this.fade)).catch((): void => {});
  }

  /**
   * Pauses and disconnects for good.
   */
  dispose(): void {
    if (this.player) {
      void this.player.pause().catch((): void => {});
      this.player.disconnect();
    }
  }
}
