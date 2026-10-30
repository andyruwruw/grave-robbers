// Local Imports
import { UP_NEXT } from '../../config/audio';
import { queueItemId } from '../../helpers/music';
import { shuffled } from '../../helpers/shuffle';

// Types
import type {
  MusicOptions,
  QueueItem,
  Song,
} from '../../types/music';
import type { SpotifyTrack } from '../../types/spotify';

/**
 * What plays next: the account's queue (`userQueue`, read from Spotify)
 * ahead of the player's own queue (`upcoming`).
 */
export class MusicQueue {
  /**
   * The player's own queue, refilled by `rebuild`.
   */
  upcoming: QueueItem[] = [];

  /**
   * What's queued on the Spotify account, in the account's order.
   */
  userQueue: SpotifyTrack[] = [];

  /**
   * Refills the queue: the playlist shuffled, with each song after drawn
   * from the playlist or the custom songs at random by their weights (the
   * custom songs go around again if the playlist outlasts them), or either
   * one alone.
   *
   * @param options - The Music tab's choices.
   * @param playlist - The loaded playlist, if any.
   * @param songs - The custom songs.
   */
  rebuild(options: MusicOptions, playlist: { uri: string; tracks: SpotifyTrack[] } | null, songs: Song[]): void {
    const tracks: QueueItem[] = options.spotify && playlist && playlist.uri === options.playlist
      ? shuffled(playlist.tracks).map((track: SpotifyTrack): QueueItem => ({ kind: 'spotify', track, source: 'playlist' }))
      : [];
    const customs: QueueItem[] = options.custom ? shuffled(songs).map((song: Song): QueueItem => ({ kind: 'custom', song })) : [];
    if (tracks.length === 0 || customs.length === 0) {
      this.upcoming = tracks.length > 0 ? tracks : customs;
    } else {
      const { spotifyWeight, customWeight } = options;
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
  }

  /**
   * Where an up-next entry sits in the player's own queue, or null if it's
   * one of the account's queued songs or the list changed.
   *
   * @param index - Its place in the published list.
   * @param id - Its published id, which guards against the list having moved on.
   * @param live - Whether the account's queue is listed first.
   * @returns Its index in `upcoming`, or null.
   */
  ownIndex(index: number, id: string, live: boolean): number | null {
    const at = index - (live ? this.userQueue.length : 0);
    const item = this.upcoming[at];
    return item && queueItemId(item) === id ? at : null;
  }

  /**
   * Takes a song out of the player's own queue.
   *
   * @param at - Its index in `upcoming`.
   */
  remove(at: number): void {
    this.upcoming.splice(at, 1);
  }

  /**
   * Swaps a song with the one before or after it.
   *
   * @param at - Its index in `upcoming`, or null when it isn't there.
   * @param delta - -1 for earlier, 1 for later.
   * @returns Whether it moved.
   */
  move(at: number | null, delta: -1 | 1): boolean {
    const to = at === null ? -1 : at + delta;
    if (at === null || to < 0 || to >= this.upcoming.length) {
      return false;
    }
    [this.upcoming[at], this.upcoming[to]] = [this.upcoming[to], this.upcoming[at]];
    return true;
  }

  /**
   * Takes the next song off the player's own queue.
   *
   * @returns That song, or null when the queue is empty.
   */
  shift(): QueueItem | null {
    return this.upcoming.shift() ?? null;
  }

  /**
   * What's up next as listed: the account's queue first (when live), then
   * the player's own, cut to UP_NEXT.
   *
   * @param live - Whether the account's queue plays first.
   * @returns The listed items, in order.
   */
  upNextItems(live: boolean): QueueItem[] {
    return [
      ...(live ? this.userQueue.map((track: SpotifyTrack): QueueItem => ({ kind: 'spotify', track, source: 'queue' })) : []),
      ...this.upcoming,
    ].slice(0, UP_NEXT);
  }
}
