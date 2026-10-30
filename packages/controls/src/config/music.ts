// Types
import type { QueueSource } from '@halloween/shared/audio/music-status';
import type { MusicSourceOption } from '../types/music';

/**
 * The checkboxes for what to play, and the weight each shuffled source
 * gets against the other.
 */
export const SOURCES: MusicSourceOption[] = [
  { key: 'live', label: 'Spotify playback', hint: 'Songs queued on your Spotify (your phone or a Jam) play first, in Spotify’s order' },
  { key: 'spotify', label: 'Spotify playlist', hint: 'Shuffles the playlist picked below', weight: 'spotifyWeight' },
  { key: 'custom', label: 'Custom songs', hint: 'From server/media/music, shuffled in; their parts follow the game', weight: 'customWeight' },
];

/**
 * What each queue source is called on a song's row.
 */
export const SOURCE_LABELS: Record<QueueSource, string> = { queue: 'Queued', playlist: 'Playlist', custom: 'Custom' };
