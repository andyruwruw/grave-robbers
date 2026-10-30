// Local Imports
import { UP_NEXT } from '../../config/audio';
import { readId3 } from '../media/id3';

// Types
import type { QueueEntry } from '@halloween/shared/audio/music-status';
import type { QueueItem, SongTags } from '../../types/music';

/**
 * The custom songs' ID3 tags, read once per file, and the entries the
 * music status lists them by.
 */
export class TrackTags {
  /**
   * Each mp3's tag read, by URL.
   */
  private _tags = new Map<string, Promise<SongTags>>();

  /**
   * Each read tag's title and artist, by URL, for naming entries.
   */
  private _titles = new Map<string, { title: string | null; artist: string | null }>();

  /**
   * An mp3's ID3 title, artist, and album art (as an object URL), read once
   * per file. Fetches only the tag: its 10 byte header says how long it is.
   *
   * @param url - The mp3.
   * @returns Its tags, all null if it has none or can't be read.
   */
  trackTags(url: string): Promise<SongTags> {
    let tags = this._tags.get(url);
    if (!tags) {
      /**
       * Fetches the file's first bytes with a Range request.
       * @param end Last byte to fetch, inclusive.
       * @returns The bytes.
       */
      const bytes = async (end: number): Promise<ArrayBuffer> => (await fetch(url, { headers: { Range: `bytes=0-${end}` } })).arrayBuffer();
      tags = bytes(9)
        .then((head: ArrayBuffer): Promise<ArrayBuffer> => {
          const b = new Uint8Array(head);
          return bytes(10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]));
        })
        .then((buffer: ArrayBuffer) => {
          const { title, artist, art } = readId3(buffer);
          this._titles.set(url, { title, artist });
          return { title, artist, art: art ? URL.createObjectURL(art) : null };
        })
        .catch(() => ({ title: null, artist: null, art: null }));
      this._tags.set(url, tags);
    }
    return tags;
  }

  /**
   * Reads the tags of the custom songs coming up soon, for their names in
   * the list.
   *
   * @param upcoming - The player's own queue.
   * @param onLoaded - Called as each tag comes in.
   */
  loadTitles(upcoming: readonly QueueItem[], onLoaded: () => void): void {
    for (const item of upcoming.slice(0, UP_NEXT)) {
      if (item.kind === 'custom' && !this._tags.has(item.song.tagUrl)) {
        void this.trackTags(item.song.tagUrl).then((): void => onLoaded());
      }
    }
  }

  /**
   * How the status lists a queue item, named by its tag once it's read.
   *
   * @param item - The queue item.
   * @param big - Whether to use the big cover (now playing) or the thumbnail.
   * @returns The listed entry.
   */
  entry(item: QueueItem, big: boolean): QueueEntry {
    if (item.kind === 'spotify') {
      return { id: item.track.uri, title: item.track.title, artist: item.track.artist, art: big ? item.track.art : item.track.thumb, source: item.source };
    }
    const tags = this._titles.get(item.song.tagUrl);
    return { id: item.song.tagUrl, title: item.song.fixedTitle ?? tags?.title ?? item.song.title, artist: item.song.artist ?? tags?.artist ?? null, art: item.song.art, source: 'custom' };
  }
}
