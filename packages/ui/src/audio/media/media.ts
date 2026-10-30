// Types
import type { MediaManifest } from '@halloween/shared/audio/media';

/**
 * The manifest request, shared by every caller (cleared after a failure so the next call retries).
 */
let manifest: Promise<MediaManifest> | null = null;

/**
 * The server's media folder (songs, sound effect mp3s, ambience), fetched
 * once per page. Empty if the server can't be reached.
 *
 * @returns The manifest of songs, sound effect overrides, and ambience.
 */
export function loadMedia(): Promise<MediaManifest> {
  manifest ??= fetch('/api/media')
    .then((res: Response): Promise<MediaManifest> => (res.ok ? res.json() as Promise<MediaManifest> : Promise.reject(new Error(String(res.status)))))
    .catch((): MediaManifest => {
      manifest = null;
      return { songs: [], sfx: [], ambience: [] };
    });
  return manifest;
}
