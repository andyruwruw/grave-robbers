// Local Imports
import { CLIENT_ID, CLIENT_SECRET } from './config/spotify';
import { SpotifyAccount } from './spotify-account';
import { fetchPlaylists } from './spotify-playlists';

// Types
import type {
  Express,
  Request,
  Response,
} from 'express';

/**
 * Spotify account linking for the TV's music player. The server holds the
 * client secret and refresh token (from SPOTIFY_REFRESH_TOKEN, or a login
 * started on the TV); the TV only ever gets short-lived access tokens for
 * the Web Playback SDK. Call it once: it loads the linked account.
 *
 * - `GET /api/spotify/status`: whether Spotify is configured and linked.
 * - `GET /auth/spotify/login?return=<url>`: starts the login, then comes back to `return`.
 * - `GET /auth/spotify/callback`: Spotify's redirect target.
 * - `GET /api/spotify/token`: a fresh access token.
 * - `GET /api/spotify/playlists`: the linked account's playlists.
 * - `POST /api/spotify/logout`: forgets the account.
 * @param app The server's Express app.
 */
export function mountSpotify(app: Express): void {
  const account = new SpotifyAccount();

  app.get('/api/spotify/status', (_req: Request, res: Response): void => {
    res.json(account.status());
  });

  app.get('/auth/spotify/login', (req: Request, res: Response): void => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      res.status(500).send('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for the server first.');
      return;
    }
    res.redirect(account.beginLogin(req.query.return));
  });

  app.get('/auth/spotify/callback', async (req: Request, res: Response): Promise<void> => {
    res.redirect(await account.finishLogin(String(req.query.state ?? ''), req.query.code));
  });

  app.get('/api/spotify/token', async (_req: Request, res: Response): Promise<void> => {
    try {
      const token = await account.accessToken();
      if (token) {
        res.json({ accessToken: token });
      } else {
        res.status(404).json({ error: 'Spotify is not linked.' });
      }
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      res.status(502).json({ error: 'Could not refresh the Spotify token.' });
    }
  });

  app.get('/api/spotify/playlists', async (_req: Request, res: Response): Promise<void> => {
    try {
      const token = await account.accessToken();
      if (!token) {
        res.status(404).json({ error: 'Spotify is not linked.' });
        return;
      }
      res.json(await fetchPlaylists(token));
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      res.status(502).json({ error: 'Could not load playlists.' });
    }
  });

  app.post('/api/spotify/logout', (_req: Request, res: Response): void => {
    account.logout();
    res.status(204).end();
  });
}
