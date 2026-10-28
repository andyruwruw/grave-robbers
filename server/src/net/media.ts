// Packages
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

// Types
import type { Express } from 'express';
import type { MediaManifest, MediaSong } from '@halloween/shared/audio';

/**
 * Big audio and art the clients fetch from the server instead of shipping
 * in the client bundle: `music/` (a folder per song with one mp3 per part
 * and `cover.jpg` or `art.jpg`, and optionally a `meta.json` with its
 * title and artist, or a plain mp3), `sfx/<name>.mp3` (replaces
 * that synthesized sound), and `ambience/*.mp3` (looped under everything on
 * the TV). `MEDIA_DIR` overrides where it lives.
 */
const MEDIA_DIR = process.env.MEDIA_DIR ?? fileURLToPath(new URL('../../media', import.meta.url));

function list(dir: string): import('node:fs').Dirent[] {
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
}

const mp3s = (dir: string): string[] => list(dir).filter((f) => f.isFile() && f.name.endsWith('.mp3')).map((f) => f.name);
const url = (...parts: string[]): string => `/media/${parts.map(encodeURIComponent).join('/')}`;

/**
 * A song folder's `meta.json` (`{ "title": ..., "artist": ... }`, either
 * optional), if it has one.
 */
function meta(dir: string): { title: string | null; artist: string | null } {
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
 */
function manifest(): MediaManifest {
  const music = join(MEDIA_DIR, 'music');
  const songs: MediaSong[] = [
    ...mp3s(music).map((file: string): MediaSong => ({ id: file.replace(/\.mp3$/, ''), parts: [{ name: 'full', url: url('music', file) }], art: null, title: null, artist: null })),
    ...list(music).filter((d) => d.isDirectory()).map((d): MediaSong => {
      const files = list(join(music, d.name)).map((f) => f.name);
      const art = ['cover.jpg', 'art.jpg', 'cover.png', 'art.png'].find((f: string): boolean => files.includes(f));
      return {
        id: d.name,
        parts: mp3s(join(music, d.name)).map((file: string) => ({ name: file.replace(/\.mp3$/, ''), url: url('music', d.name, file) })),
        art: art ? url('music', d.name, art) : null,
        ...meta(join(music, d.name)),
      };
    }).filter((song: MediaSong): boolean => song.parts.length > 0),
  ];
  return {
    songs,
    sfx: mp3s(join(MEDIA_DIR, 'sfx')).map((file: string) => ({ name: file.replace(/\.mp3$/, ''), url: url('sfx', file) })),
    ambience: mp3s(join(MEDIA_DIR, 'ambience')).map((file: string): string => url('ambience', file)),
  };
}

/**
 * Serves the media folder at `/media` (cached a day; mp3s stream in by
 * range) and its manifest at `/api/media`.
 */
export function mountMedia(app: Express): void {
  app.use('/media', express.static(MEDIA_DIR, { maxAge: '1d' }));
  app.get('/api/media', (_req, res) => {
    res.json(manifest());
  });
}
