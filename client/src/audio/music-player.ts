// Local Imports
import { readId3 } from './id3';
import { loadMedia } from './media';
import { SongPlayer } from './song-player';
import {
  loadSpotifySdk,
  playTrack,
  playlistTracks,
  skipToQueued,
  spotifyQueue,
  spotifyStatus,
  spotifyToken,
  toTrack,
  transferPlayback,
} from './spotify';

// Types
import type {
  AudioSettings,
  MediaSong,
  MusicStatus,
  QueueEntry,
} from '@halloween/shared/audio';
import type { Song } from './song-player';
import type {
  SpotifyPlaybackState,
  SpotifyPlayer,
  SpotifyTrack,
} from './spotify';

/**
 * A song from the server's media folder, named by its `meta.json`, else its
 * ID3 tag (read from the instruments part, which carries the most tags),
 * else its file or folder name in title case until the tag loads.
 */
function toSong({ id, parts, art, title, artist }: MediaSong): Song {
  return {
    title: id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c: string): string => c.toUpperCase()),
    fixedTitle: title,
    artist,
    parts,
    art,
    tagUrl: (parts.find((p) => p.name === 'instruments') ?? parts[0]).url,
  };
}

/**
 * What's going on in the game, which decides how much of each part plays.
 */
export interface MusicMood {
  /**
   * Someone's phone is connected.
   */
  players: boolean;
  fight: boolean;
  bloodMoon: boolean;
}

/**
 * Each part's level for a mood. With nobody playing everything plays. Once
 * people are around, exploring keeps the bed (instruments and bass) with the
 * melody hushed, and the drums and full melody come in for a fight (the
 * blood moon keeps some drums going). Single mp3s and unknown parts always
 * play in full.
 */
function partLevel(part: string, mood: MusicMood): number {
  if (!mood.players) {
    return 1;
  }
  if (part === 'drums') {
    return mood.fight ? 1 : mood.bloodMoon ? 0.5 : 0;
  }
  if (part === 'melody') {
    return mood.fight ? 1 : 0.4;
  }
  return 1;
}

/**
 * One song in the player's own queue: a Spotify track (queued on the
 * account, or from the playlist) or a custom song.
 */
type Item =
  | { kind: 'spotify'; track: SpotifyTrack; source: 'queue' | 'playlist' }
  | { kind: 'custom'; song: Song };

/**
 * A Spotify track fades out over its last FADE_OUT seconds and the next
 * song starts END_LEAD seconds before it would end.
 */
const FADE_OUT = 2.5;
const END_LEAD = 0.6;

/**
 * How often the player checks how far into a Spotify track it is, and how
 * often it reads the account's queue.
 */
const WATCH_MS = 200;
const QUEUE_POLL_MS = 4000;

/**
 * Seconds a requested Spotify track may take to start before the player
 * goes back to trusting what Spotify reports.
 */
const PENDING_TIMEOUT = 4;

/**
 * How many upcoming songs the status lists.
 */
const UP_NEXT = 12;

/**
 * Seconds a duck takes to come back up after its hold.
 */
const DUCK_RELEASE = 1;
const DUCK_STEPS = 10;

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The player playing now, so a new one can stop it. Kept on the page's
 * global object, not in this module, so a copy of this module loaded by a
 * hot reload still finds and stops the old one.
 */
const page = globalThis as typeof globalThis & { graveyardMusic?: { dispose(): void } | null };

if (import.meta.hot) {
  import.meta.hot.accept((): void => window.location.reload());
}

/**
 * Background music for the TV, with its own queue: what's queued on the
 * linked Spotify account (from a phone or a Jam) always plays first, in
 * the account's order, then the chosen playlist shuffled with custom songs
 * shuffled in. Spotify tracks play one at a time on the Web Playback SDK
 * device (Spotify Premium) and fade out at the end; Spotify pauses while a
 * custom song plays. Custom songs split into parts follow the game's mood.
 * Can dip under big sound effects.
 */
export class MusicPlayer {
  private options: Pick<AudioSettings, 'live' | 'spotify' | 'custom' | 'playlist' | 'spotifyWeight' | 'customWeight'> = {
    live: false,
    spotify: false,
    custom: false,
    playlist: null,
    spotifyWeight: 1,
    customWeight: 1,
  };
  private songs: Song[] = [];
  private playlist: { uri: string; tracks: SpotifyTrack[] } | null = null;
  private upcoming: Item[] = [];
  private userQueue: SpotifyTrack[] = [];
  private current: Item | null = null;
  private song: SongPlayer | null = null;
  private playing = false;
  private error: string | null = null;
  private tags = new Map<string, Promise<{ title: string | null; artist: string | null; art: string | null }>>();
  private titles = new Map<string, { title: string | null; artist: string | null }>();
  private mood: MusicMood = { players: false, fight: false, bloodMoon: false };
  private wantPlaying = true;
  private volume = 0.5;
  private duckLevel = 1;
  private duckTimers: ReturnType<typeof setTimeout>[] = [];
  private spotify: SpotifyPlayer | null = null;
  private connecting: Promise<void> | null = null;
  private deviceId: string | null = null;
  private deviceActive = false;

  /**
   * The last Spotify state and when it came, to tell how far into the
   * track it is now.
   */
  private spotifyState: { state: SpotifyPlaybackState; at: number } | null = null;

  /**
   * A track asked for but not yet reported playing, and since when.
   */
  private pending: { uri: string; at: number } | null = null;
  private ending = false;
  private spotifyFade = 1;

  /**
   * Until when (seconds) Spotify reporting it plays isn't taken as someone
   * starting it from a phone: right after the player paused it itself.
   */
  private quietUntil = 0;

  private timers: ReturnType<typeof setInterval>[] = [];
  private disposed = false;

  /**
   * Whether this TV page plays the music (the server picks one when
   * several are open).
   */
  private enabled = true;

  constructor(private onChange: (status: MusicStatus) => void) {
    page.graveyardMusic?.dispose();
    page.graveyardMusic = this;
    this.timers.push(
      setInterval((): void => this.watch(), WATCH_MS),
      setInterval((): void => void this.pollQueue(), QUEUE_POLL_MS),
    );
    void loadMedia().then(({ songs }): void => {
      if (this.disposed) {
        return;
      }
      this.songs = songs.map(toSong);
      this.rebuild();
      this.start();
    });
  }

  /**
   * Stops for good: its song, its Spotify connection, and its timers. Only
   * one player plays at a time; a new one disposes the last (the TV page
   * remounting, or a hot reload in dev).
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.timers.forEach(clearInterval);
    this.duckTimers.forEach(clearTimeout);
    this.stopSong();
    this.current = null;
    if (this.spotify) {
      void this.spotify.pause().catch((): void => {});
      this.spotify.disconnect();
    }
    if (page.graveyardMusic === this) {
      page.graveyardMusic = null;
    }
  }

  /**
   * Plays the music here, or goes quiet because another TV page has it:
   * the song stops, Spotify pauses and lets go of its device.
   */
  setEnabled(on: boolean): void {
    if (on === this.enabled) {
      return;
    }
    this.enabled = on;
    if (on) {
      this.error = null;
      if (this.options.live || this.options.spotify) {
        void this.connectSpotify();
      }
      this.start();
    } else {
      this.stopSong();
      this.current = null;
      this.playing = false;
      this.pending = null;
      if (this.spotify) {
        void this.spotify.pause().catch((): void => {});
        this.spotify.disconnect();
      }
      this.spotify = null;
      this.spotifyState = null;
      this.connecting = null;
      this.deviceId = null;
      this.deviceActive = false;
      this.error = 'Music is playing on another TV page.';
    }
    this.publish();
  }

  /**
   * Shows an error under the music, except the one the Spotify player
   * reports when asked to pause or resume with nothing loaded, which isn't
   * a problem.
   */
  private fail(message: string): void {
    if (/no list was loaded/i.test(message)) {
      return;
    }
    this.error = message;
    this.publish();
  }

  /**
   * What the game is doing, for songs split into parts.
   */
  setMood(mood: MusicMood): void {
    this.mood = mood;
  }

  /**
   * Applies the Music tab's choices: the account's queue first, the
   * playlist, the custom songs, or any mix. Whatever's playing keeps
   * playing unless its source was turned off.
   */
  setOptions({ live, spotify, custom, playlist, spotifyWeight, customWeight }: AudioSettings): void {
    const before = this.options;
    this.options = { live, spotify, custom, playlist, spotifyWeight, customWeight };
    if (!this.enabled) {
      return;
    }
    if (live || spotify) {
      void this.connectSpotify();
    } else {
      this.error = null;
    }
    if (live && !before.live) {
      void this.pollQueue();
    }
    if (!live) {
      this.userQueue = [];
    }
    const playlistWanted = spotify && playlist ? playlist : null;
    if (playlistWanted && this.playlist?.uri !== playlistWanted) {
      void this.loadPlaylist(playlistWanted);
    }
    if (spotify !== before.spotify || custom !== before.custom || playlist !== before.playlist || spotifyWeight !== before.spotifyWeight || customWeight !== before.customWeight) {
      this.rebuild();
    }
    const cur = this.current;
    const stale = cur && (cur.kind === 'custom' ? !custom : cur.source === 'queue' ? !live : !spotify || playlist !== before.playlist);
    if (stale) {
      this.advance();
    } else {
      this.start();
    }
    this.publish();
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.applyVolume();
  }

  toggle(): void {
    if (!this.enabled) {
      return;
    }
    this.wantPlaying = !this.playing;
    if (this.current?.kind === 'custom') {
      if (this.wantPlaying) {
        void this.song?.play();
      } else {
        this.song?.pause();
      }
    } else if (this.current?.kind === 'spotify') {
      if (this.wantPlaying) {
        void this.spotify?.resume().catch((): void => {});
      } else {
        this.pauseSpotify();
      }
    } else if (this.wantPlaying) {
      this.start();
    }
  }

  next(): void {
    if (!this.enabled) {
      return;
    }
    this.wantPlaying = true;
    this.pauseSpotify();
    this.advance();
  }

  /**
   * Takes a song out of what's up next. `index` is its place in the
   * published list and `id` guards against the list having moved on. Songs
   * queued on the Spotify account stay (Spotify can't unqueue them).
   */
  remove(index: number, id: string): void {
    const at = this.ownIndex(index, id);
    if (at !== null) {
      this.upcoming.splice(at, 1);
      this.loadTitles();
      this.publish();
    }
  }

  /**
   * Moves a song in what's up next one place earlier or later (never
   * ahead of what's queued on the Spotify account).
   */
  move(index: number, id: string, delta: -1 | 1): void {
    const at = this.ownIndex(index, id);
    const to = at === null ? -1 : at + delta;
    if (at === null || to < 0 || to >= this.upcoming.length) {
      return;
    }
    [this.upcoming[at], this.upcoming[to]] = [this.upcoming[to], this.upcoming[at]];
    this.loadTitles();
    this.publish();
  }

  /**
   * Where an up-next entry sits in the player's own queue, or null if it's
   * one of the account's queued songs or the list changed.
   */
  private ownIndex(index: number, id: string): number | null {
    const at = index - (this.options.live ? this.userQueue.length : 0);
    const item = this.upcoming[at];
    return item && this.entry(item, false).id === id ? at : null;
  }

  /**
   * Retries playback after a user gesture, since browsers block audio that
   * starts on its own.
   */
  resume(): void {
    if (!this.enabled) {
      return;
    }
    void this.spotify?.activateElement();
    if (this.song?.paused && this.wantPlaying) {
      void this.song.play();
    }
  }

  /**
   * Dips the music to `depth` of its volume for `hold` seconds, then fades
   * it back.
   */
  duck(depth = 0.35, hold = 1.5): void {
    this.duckTimers.forEach(clearTimeout);
    this.duckLevel = Math.min(this.duckLevel, depth);
    this.applyVolume();
    this.duckTimers = Array.from({ length: DUCK_STEPS }, (_, i: number) => setTimeout((): void => {
      this.duckLevel = depth + (1 - depth) * ((i + 1) / DUCK_STEPS);
      this.applyVolume();
    }, (hold + (DUCK_RELEASE * (i + 1)) / DUCK_STEPS) * 1000));
  }

  /**
   * Refills the queue: the playlist shuffled, with each song after drawn
   * from the playlist or the custom songs at random by their weights (the
   * custom songs go around again if the playlist outlasts them), or either
   * one alone.
   */
  private rebuild(): void {
    const tracks: Item[] = this.options.spotify && this.playlist && this.playlist.uri === this.options.playlist
      ? shuffled(this.playlist.tracks).map((track: SpotifyTrack): Item => ({ kind: 'spotify', track, source: 'playlist' }))
      : [];
    const customs: Item[] = this.options.custom ? shuffled(this.songs).map((song: Song): Item => ({ kind: 'custom', song })) : [];
    if (tracks.length === 0 || customs.length === 0) {
      this.upcoming = tracks.length > 0 ? tracks : customs;
    } else {
      const { spotifyWeight, customWeight } = this.options;
      const customChance = spotifyWeight + customWeight > 0 ? customWeight / (spotifyWeight + customWeight) : 0.5;
      if (customChance >= 1) {
        this.upcoming = customs;
      } else {
        this.upcoming = [];
        let c = 0;
        for (const track of tracks) {
          while (Math.random() < customChance) {
            this.upcoming.push(customs[c++ % customs.length]);
          }
          this.upcoming.push(track);
        }
      }
    }
    this.loadTitles();
    this.publish();
  }

  private async loadPlaylist(uri: string): Promise<void> {
    try {
      const tracks = await playlistTracks(uri);
      if (this.options.playlist !== uri) {
        return;
      }
      this.playlist = { uri, tracks };
      this.error = tracks.length === 0 ? 'That playlist has nothing Spotify will play here.' : null;
      this.rebuild();
      this.start();
    } catch (err) {
      this.fail((err as Error).message);
      this.publish();
    }
  }

  /**
   * Starts the next song if nothing is playing.
   */
  private start(): void {
    if (this.enabled && !this.current && this.wantPlaying && (this.upcoming.length > 0 || this.userQueue.length > 0)) {
      this.advance();
    }
  }

  /**
   * Moves on to the next song: the account's queue first, then the
   * player's own queue (refilled when it runs out).
   */
  private advance(): void {
    if (this.disposed || !this.enabled) {
      return;
    }
    this.stopSong();
    this.ending = false;
    if (this.options.live && this.userQueue.length > 0) {
      void this.playQueued();
      return;
    }
    if (this.upcoming.length === 0) {
      this.rebuild();
    }
    const next = this.upcoming.shift() ?? null;
    this.current = next;
    if (!next) {
      this.playing = false;
      this.pauseSpotify();
    } else if (next.kind === 'custom') {
      this.pauseSpotify();
      this.playSong(next.song);
    } else {
      void this.playSpotify(next.track.uri);
    }
    this.publish();
  }

  private playSong(song: Song): void {
    if (this.disposed) {
      return;
    }
    const player = new SongPlayer(
      song,
      (part: string): number => partLevel(part, this.mood),
      (): void => {
        if (this.song === player) {
          this.song = null;
          this.advance();
        }
      },
      (playing: boolean): void => {
        if (this.song === player) {
          this.playing = playing;
          this.publish();
        }
      },
    );
    this.song = player;
    this.applyVolume();
    if (this.wantPlaying) {
      void player.play();
    }
    void this.trackTags(song.tagUrl).then((): void => this.publish());
  }

  /**
   * Pauses Spotify unless it's known to be paused already. A track asked
   * for may not have reported in yet, so not knowing counts as playing
   * (the error an empty player reports is ignored).
   */
  private pauseSpotify(): void {
    if (!this.spotify || this.spotifyState?.state.paused) {
      return;
    }
    this.pending = null;
    this.quietUntil = performance.now() / 1000 + 2;
    void this.spotify.pause().catch((): void => {});
  }

  private stopSong(): void {
    this.song?.stop();
    this.song = null;
  }

  private async playSpotify(uri: string): Promise<void> {
    this.pending = { uri, at: performance.now() / 1000 };
    this.spotifyFade = 1;
    this.applyVolume();
    try {
      await this.connectSpotify();
      if (!this.deviceId) {
        throw new Error('The Spotify player isn’t ready.');
      }
      if (this.current?.kind !== 'spotify' || this.current.track.uri !== uri || !this.enabled) {
        return;
      }
      await playTrack(this.deviceId, uri);
      this.error = null;
    } catch (err) {
      this.pending = null;
      this.fail((err as Error).message);
      this.publish();
    }
  }

  /**
   * Plays the head of the account's queue by skipping to it, which also
   * takes it off the queue.
   */
  private async playQueued(): Promise<void> {
    const track = this.userQueue.shift()!;
    this.current = { kind: 'spotify', track, source: 'queue' };
    this.pending = { uri: track.uri, at: performance.now() / 1000 };
    this.spotifyFade = 1;
    this.applyVolume();
    this.publish();
    try {
      await this.connectSpotify();
      if (!this.deviceId) {
        throw new Error('The Spotify player isn’t ready.');
      }
      if (!this.deviceActive) {
        await transferPlayback(this.deviceId);
      }
      await skipToQueued(this.deviceId);
      await this.spotify?.resume();
    } catch (err) {
      this.pending = null;
      this.fail((err as Error).message);
      this.publish();
    }
  }

  /**
   * Fades a Spotify track out over its last seconds and starts the next
   * song just before it ends, unless something is queued on the account,
   * which Spotify plays next by itself.
   */
  private watch(): void {
    this.enforce();
    const cur = this.current;
    if (cur?.kind !== 'spotify' || !this.spotifyState || this.pending || this.ending) {
      return;
    }
    const { state, at } = this.spotifyState;
    if (state.paused || state.track_window.current_track?.uri !== cur.track.uri) {
      return;
    }
    const left = (state.duration - state.position - (performance.now() - at)) / 1000;
    const fade = this.options.live && this.userQueue.length > 0 ? 1 : Math.max(0, Math.min(1, (left - END_LEAD) / (FADE_OUT - END_LEAD)));
    if (fade !== this.spotifyFade) {
      this.spotifyFade = fade;
      this.applyVolume();
    }
    if (left < END_LEAD && fade < 1) {
      this.ending = true;
      this.pauseSpotify();
      this.advance();
    }
  }

  /**
   * Keeps one thing playing at most, whatever events were missed: no song
   * while Spotify has the turn, no Spotify while a song (or nothing) does,
   * and nothing at all while paused.
   */
  private enforce(): void {
    const cur = this.current;
    if (this.song && cur?.kind !== 'custom') {
      this.stopSong();
    }
    if (this.song && !this.wantPlaying && !this.song.paused) {
      this.song.pause();
    }
    const spotifyPlaying = this.spotifyState && !this.spotifyState.state.paused;
    const now = performance.now() / 1000;
    if (spotifyPlaying && !this.pending && now > this.quietUntil && cur?.kind !== 'spotify') {
      this.pauseSpotify();
    }
  }

  /**
   * Reads what's queued on the account. Its order wins, so moves and new
   * additions on a phone (or in a Jam) show up here and play first.
   */
  private async pollQueue(): Promise<void> {
    if (!this.options.live) {
      return;
    }
    try {
      const queue = await spotifyQueue();
      if (!this.options.live) {
        return;
      }
      this.userQueue = queue;
      this.publish();
      this.start();
    } catch {
      // Not linked or offline: try again next poll.
    }
  }

  private onSpotifyState(state: SpotifyPlaybackState | null): void {
    if (this.disposed) {
      return;
    }
    this.deviceActive = state !== null;
    if (!state) {
      return;
    }
    this.spotifyState = { state, at: performance.now() };
    const playing = state.track_window.current_track;
    const now = performance.now() / 1000;
    if (this.pending && (playing?.uri === this.pending.uri || now - this.pending.at > PENDING_TIMEOUT)) {
      this.pending = null;
    }
    if (this.pending || !playing) {
      return;
    }
    const cur = this.current;
    const ours = cur?.kind === 'spotify' && cur.track.uri === playing.uri;
    if (!ours && !state.paused && !this.ending && now > this.quietUntil) {
      const at = this.userQueue.findIndex((t: SpotifyTrack): boolean => t.uri === playing.uri);
      const track = at >= 0 ? this.userQueue.splice(at, 1)[0] : toTrack(playing);
      this.stopSong();
      this.current = { kind: 'spotify', track, source: 'queue' };
      this.spotifyFade = 1;
      this.applyVolume();
    }
    if (this.current?.kind === 'spotify') {
      this.playing = !state.paused;
    }
    this.publish();
  }

  private connectSpotify(): Promise<void> {
    if (!this.enabled) {
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
        volume: this.volume * this.duckLevel,
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
      player.addListener('player_state_changed', (state: SpotifyPlaybackState | null): void => this.onSpotifyState(state));
      for (const event of ['initialization_error', 'authentication_error', 'account_error', 'playback_error'] as const) {
        player.addListener(event, ({ message }): void => {
          this.fail(event === 'account_error' ? 'Spotify playback needs a Premium account.' : message);
        });
      }
      this.spotify = player;
      await player.connect();
      await ready;
      if (this.disposed || this.spotify !== player) {
        player.disconnect();
      }
    })().catch((err: Error): void => {
      this.fail(err.message);
      this.publish();
    });
    return this.connecting;
  }

  /**
   * An mp3's ID3 title, artist, and album art (as an object URL), read once
   * per file. Fetches only the tag: its 10 byte header says how long it is.
   */
  private trackTags(url: string): Promise<{ title: string | null; artist: string | null; art: string | null }> {
    let tags = this.tags.get(url);
    if (!tags) {
      const bytes = async (end: number): Promise<ArrayBuffer> => (await fetch(url, { headers: { Range: `bytes=0-${end}` } })).arrayBuffer();
      tags = bytes(9)
        .then((head: ArrayBuffer): Promise<ArrayBuffer> => {
          const b = new Uint8Array(head);
          return bytes(10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]));
        })
        .then((buffer: ArrayBuffer) => {
          const { title, artist, art } = readId3(buffer);
          this.titles.set(url, { title, artist });
          return { title, artist, art: art ? URL.createObjectURL(art) : null };
        })
        .catch(() => ({ title: null, artist: null, art: null }));
      this.tags.set(url, tags);
    }
    return tags;
  }

  /**
   * Reads the tags of the custom songs coming up soon, for their names in
   * the list.
   */
  private loadTitles(): void {
    for (const item of this.upcoming.slice(0, UP_NEXT)) {
      if (item.kind === 'custom' && !this.tags.has(item.song.tagUrl)) {
        void this.trackTags(item.song.tagUrl).then((): void => this.publish());
      }
    }
  }

  private entry(item: Item, big: boolean): QueueEntry {
    if (item.kind === 'spotify') {
      return { id: item.track.uri, title: item.track.title, artist: item.track.artist, art: big ? item.track.art : item.track.thumb, source: item.source };
    }
    const tags = this.titles.get(item.song.tagUrl);
    return { id: item.song.tagUrl, title: item.song.fixedTitle ?? tags?.title ?? item.song.title, artist: item.song.artist ?? tags?.artist ?? null, art: item.song.art, source: 'custom' };
  }

  private publish(): void {
    if (this.disposed) {
      return;
    }
    const upNext = [
      ...(this.options.live ? this.userQueue.map((track: SpotifyTrack): Item => ({ kind: 'spotify', track, source: 'queue' })) : []),
      ...this.upcoming,
    ].slice(0, UP_NEXT).map((item: Item): QueueEntry => this.entry(item, false));
    this.onChange({
      playing: this.playing,
      current: this.current ? this.entry(this.current, true) : null,
      upNext,
      error: this.error,
    });
  }

  private applyVolume(): void {
    const v = this.volume * this.duckLevel;
    this.song?.setVolume(v);
    void this.spotify?.setVolume(Math.max(0.0001, v * this.spotifyFade)).catch((): void => {});
  }
}
