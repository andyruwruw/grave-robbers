// Packages
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Local Imports
import { MEDIA_DIR } from '../../config/paths';

// Types
import type { Dirent } from 'node:fs';
import type { MediaManifest, MediaSong } from '@halloween/shared/audio/media';

/**
 * A folder's entries, or none if it's missing.
 * @param dir The folder.
 * @returns Its entries.
 */
function listDir(dir: string): Dirent[] {
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
}

/**
 * The mp3 files directly in a folder.
 * @param dir The folder.
 * @returns Their file names.
 */
const mp3s = (dir: string): string[] => listDir(dir).filter((f) => f.isFile() && f.name.endsWith('.mp3')).map((f) => f.name);

/**
 * Where the server serves a file in the media folder.
 * @param parts The path inside the media folder, one segment each.
 * @returns The URL path.
 */
const mediaUrl = (...parts: string[]): string => `/media/${parts.map(encodeURIComponent).join('/')}`;

/**
 * A song folder's `meta.json` (`{ "title": ..., "artist": ... }`, either
 * optional), if it has one.
 * @param dir The song folder.
 * @returns Its title and artist, null where missing.
 */
function songMeta(dir: string): { title: string | null; artist: string | null } {
  try {
    const { title, artist } = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as { title?: unknown; artist?: unknown };
    return { title: typeof title === 'string' ? title : null, artist: typeof artist === 'string' ? artist : null };
  } catch {
    return { title: null, artist: null };
  }
}

/**
 * What's in the media folder right now, read fresh each time so new files
 * show up without a restart.
 * @returns The songs, sound effects, and ambience tracks.
 */
export function readManifest(): MediaManifest {
  const music = join(MEDIA_DIR, 'music');
  const songs: MediaSong[] = [
    ...mp3s(music).map((file: string): MediaSong => ({ id: file.replace(/\.mp3$/, ''), parts: [{ name: 'full', url: mediaUrl('music', file) }], art: null, title: null, artist: null })),
    ...listDir(music).filter((d) => d.isDirectory()).map((d): MediaSong => {
      const files = listDir(join(music, d.name)).map((f) => f.name);
      const art = ['cover.jpg', 'art.jpg', 'cover.png', 'art.png'].find((f: string): boolean => files.includes(f));
      return {
        id: d.name,
        parts: mp3s(join(music, d.name)).map((file: string) => ({ name: file.replace(/\.mp3$/, ''), url: mediaUrl('music', d.name, file) })),
        art: art ? mediaUrl('music', d.name, art) : null,
        ...songMeta(join(music, d.name)),
      };
    }).filter((song: MediaSong): boolean => song.parts.length > 0),
  ];
  return {
    songs,
    sfx: mp3s(join(MEDIA_DIR, 'sfx')).map((file: string) => ({ name: file.replace(/\.mp3$/, ''), url: mediaUrl('sfx', file) })),
    ambience: mp3s(join(MEDIA_DIR, 'ambience')).map((file: string): string => mediaUrl('ambience', file)),
  };
}
