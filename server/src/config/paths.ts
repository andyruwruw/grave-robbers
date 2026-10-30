// Packages
import { fileURLToPath } from 'node:url';

/**
 * Where the world is saved; `WORLD_SAVE` overrides it (e.g. for a second
 * server that shouldn't touch the main save).
 */
export const WORLD_SAVE_PATH = process.env.WORLD_SAVE ?? fileURLToPath(new URL('../../data/world.json', import.meta.url));

/**
 * Where presets live (`PRESET_DIR` overrides, for tests).
 */
export const PRESET_DIR = process.env.PRESET_DIR ?? fileURLToPath(new URL('../../presets/', import.meta.url));

/**
 * Big audio and art the clients fetch from the server instead of shipping
 * in the client bundle: `music/` (a folder per song with one mp3 per part
 * and `cover.jpg` or `art.jpg`, and optionally a `meta.json` with its
 * title and artist, or a plain mp3), `sfx/<name>.mp3` (replaces
 * that synthesized sound), and `ambience/*.mp3` (looped under everything on
 * the TV). `MEDIA_DIR` overrides where it lives.
 */
export const MEDIA_DIR = process.env.MEDIA_DIR ?? fileURLToPath(new URL('../../media', import.meta.url));

/**
 * Where the linked Spotify account's refresh token is kept (gitignored,
 * next to the world save); `SPOTIFY_SAVE` overrides it.
 */
export const SPOTIFY_SESSION_PATH = process.env.SPOTIFY_SAVE ?? fileURLToPath(new URL('../../data/spotify.json', import.meta.url));

/**
 * The repo's `apps/` folder; each app's build is served from
 * `<APPS_DIR>/<name>/dist`.
 */
export const APPS_DIR = fileURLToPath(new URL('../../../apps/', import.meta.url));
