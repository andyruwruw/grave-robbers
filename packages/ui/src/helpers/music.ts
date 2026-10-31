// Types
import type { MediaSong } from '@halloween/shared/audio/media';
import type {
  MusicMood,
  QueueItem,
  Song,
} from '../types/music';

/**
 * A song from the server's media folder, named by its `meta.json`, else its
 * ID3 tag (read from the instruments part, which carries the most tags),
 * else its file or folder name in title case until the tag loads.
 *
 * @param song - The song as the media manifest lists it.
 * @returns The song as the player plays it.
 */
export function toSong({ id, parts, art, title, artist }: MediaSong): Song {
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
 * Each part's level for a mood. With nobody playing everything plays. Once
 * people are around, exploring keeps the bed (instruments and bass) with the
 * melody hushed, and the drums and full melody come in for a fight (a
 * world event can keep some drums going). Single mp3s and unknown parts always
 * play in full.
 *
 * @param part - The part's name.
 * @param mood - What the game is doing.
 * @returns The part's level, 0..1.
 */
export function partLevel(part: string, mood: MusicMood): number {
  if (!mood.players) {
    return 1;
  }
  if (part === 'drums') {
    return mood.fight ? 1 : mood.drums;
  }
  if (part === 'melody') {
    return mood.fight ? 1 : 0.4;
  }
  return 1;
}

/**
 * The id a queue item is published under: the track's URI or the song's
 * tag file.
 *
 * @param item - The queue item.
 * @returns Its up-next id.
 */
export const queueItemId = (item: QueueItem): string => (item.kind === 'spotify' ? item.track.uri : item.song.tagUrl);
