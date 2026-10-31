// Packages
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import { WebSocketServer } from 'ws';
import { SOCKET_PATH, TICK_RATE } from '@halloween/shared/protocol/network';

// Local Imports
import { APPS_DIR } from './config/paths';
import { APPS, MAX_CATCH_UP, PORT, SAVE_INTERVAL_MS } from './config/server';
import { guard, logCaught } from './game/helpers/guard';
import { BACKUP_EVERY_MIN } from './game/storage/config/save';
import { SaveKeeper } from './game/storage/save-keeper';
import { ConnectionHub } from './net/connection-hub';
import { mountMedia } from './net/media/media-routes';
import { mountSpotify } from './net/spotify/spotify-routes';

/**
 * The HTTP app: Spotify and media routes, then each built app.
 */
const app = express();
mountSpotify(app);
mountMedia(app);
for (const [route, name] of APPS) {
  const dist = join(APPS_DIR, name, 'dist');
  if (!existsSync(dist)) {
    continue;
  }
  app.use(route, express.static(dist));
  app.get(route === '/' ? '/{*splat}' : [route, `${route}/{*splat}`], (_req, res) => res.sendFile('index.html', { root: dist }));
}

/**
 * The HTTP server the app and the WebSocket server share.
 */
const server = createServer(app);
/**
 * The WebSocket server. It compresses messages over 1 KB (the per-tick
 * state), cheaply: it's JSON, so even the fastest level shrinks it several
 * times.
 */
const wss = new WebSocketServer({ server, path: SOCKET_PATH, perMessageDeflate: { threshold: 1024, zlibDeflateOptions: { level: 1 } } });
/**
 * The saved worlds, and the one game played from the active one.
 */
const saves = new SaveKeeper();

/**
 * The one game.
 */
const game = saves.game;
saves.save();

/**
 * The connection hub that routes every socket to the game.
 */
const hub = new ConnectionHub(wss, game, saves);
setInterval((): void => saves.save(), SAVE_INTERVAL_MS);
setInterval((): void => saves.backup('hourly'), BACKUP_EVERY_MIN * 60_000);

/**
 * One fixed step, in seconds. Timers are coarse (about 15.6ms on Windows),
 * so the loop wakes often and runs however many fixed steps real time
 * calls for.
 */
const dt = 1 / TICK_RATE;

/**
 * When the loop last woke (performance.now ms).
 */
let last = performance.now();

/**
 * Real time (s) not yet covered by fixed steps.
 */
let behind = 0;
setInterval((): void => {
  const now = performance.now();
  behind = Math.min(behind + (now - last) / 1000, MAX_CATCH_UP * dt);
  last = now;
  let steps = 0;
  while (behind >= dt) {
    guard('step', (): void => game.step(dt));
    behind -= dt;
    steps++;
  }
  if (steps > 0) {
    const ms = performance.now() - now;
    game.governor.observe(ms, steps, dt);
    guard('broadcast', (): void => hub.broadcastState(steps, ms));
  }
}, 1000 / TICK_RATE / 4);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, (): void => {
    saves.save();
    process.exit(0);
  });
}
process.on('uncaughtException', (err: Error): void => logCaught('uncaught', err));
process.on('unhandledRejection', (err: unknown): void => logCaught('unhandled rejection', err));

server.on('error', (err: Error): void => {
  console.error(`[server] can't listen on :${PORT}`, err.message);
  process.exit(1);
});
server.listen(PORT, (): void => {
  console.log(`[server] listening on :${PORT} (ws ${SOCKET_PATH}), world seed ${game.world.seed}`);
});
