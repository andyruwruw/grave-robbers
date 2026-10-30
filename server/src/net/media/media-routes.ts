// Packages
import express from 'express';

// Local Imports
import { MEDIA_DIR } from '../../config/paths';
import { readManifest } from './media-manifest';

// Types
import type { Express } from 'express';

/**
 * Serves the media folder at `/media` (cached a day; mp3s stream in by
 * range) and its manifest at `/api/media`.
 * @param app The server's Express app.
 */
export function mountMedia(app: Express): void {
  app.use('/media', express.static(MEDIA_DIR, { maxAge: '1d' }));
  app.get('/api/media', (_req, res) => {
    res.json(readManifest());
  });
}
