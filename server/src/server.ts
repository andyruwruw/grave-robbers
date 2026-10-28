// Packages
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { SOCKET_PATH } from '@halloween/shared/protocol';
import { TICK_RATE } from '@halloween/shared/world';

// Local Imports
import { Game } from './game/game';
import { loadWorld, saveWorld } from './game/world-store';
import { ConnectionHub } from './net/connection-hub';
import { mountMedia } from './net/media';
import { mountSpotify } from './net/spotify';

const PORT = Number(process.env.PORT ?? 3021);
const SAVE_INTERVAL_MS = 30_000;
const CLIENT_DIST = fileURLToPath(new URL('../../client/dist', import.meta.url));

const app = express();
mountSpotify(app);
mountMedia(app);
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('/{*splat}', (_req, res) => res.sendFile('index.html', { root: CLIENT_DIST }));
}

const server = createServer(app);
const wss = new WebSocketServer({ server, path: SOCKET_PATH });
const game = new Game(loadWorld());
const save = (): void => saveWorld(game.world.save());
save();
const hub = new ConnectionHub(wss, game, save);
setInterval(save, SAVE_INTERVAL_MS);

// Timers are coarse (about 15.6ms on Windows), so the loop wakes often and
// runs however many fixed steps real time calls for.
const dt = 1 / TICK_RATE;
const MAX_CATCH_UP = 4;
let last = performance.now();
let behind = 0;
setInterval((): void => {
  const now = performance.now();
  behind = Math.min(behind + (now - last) / 1000, MAX_CATCH_UP * dt);
  last = now;
  let steps = 0;
  while (behind >= dt) {
    game.step(dt);
    behind -= dt;
    steps++;
  }
  if (steps > 0) {
    hub.broadcastState(steps, performance.now() - now);
  }
}, 1000 / TICK_RATE / 4);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, (): void => {
    save();
    process.exit(0);
  });
}
process.on('uncaughtException', (err: Error): void => console.error('[uncaught]', err));

server.on('error', (err: Error): void => {
  console.error(`[server] can't listen on :${PORT}`, err.message);
  process.exit(1);
});
server.listen(PORT, (): void => {
  console.log(`[server] listening on :${PORT} (ws ${SOCKET_PATH}), world seed ${game.world.seed}`);
});
