import { createLogger, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const GAME_SERVER = 'ws://localhost:3021';
const GAME_SERVER_HTTP = 'http://localhost:3021';

/**
 * Vite logs a full stack trace for every proxied socket that drops while the
 * game server restarts (ECONNRESET) or is down (ECONNREFUSED), and the
 * clients retry every few seconds. Collapse those into one line per outage.
 */
const logger = createLogger();
const logError = logger.error.bind(logger);
let lastDropNotice = 0;
logger.error = (msg, options) => {
  if (msg.includes('ws proxy') && /ECONNRESET|ECONNREFUSED/.test(msg)) {
    if (Date.now() - lastDropNotice > 10_000) {
      lastDropNotice = Date.now();
      logger.warn(`game server at ${GAME_SERVER} unreachable or restarting; clients will reconnect`, { timestamp: true });
    }
    return;
  }
  logError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  server: {
    port: 5181,
    strictPort: true,
    host: true,
    proxy: {
      '/ws': {
        target: GAME_SERVER,
        ws: true,
      },
      '/api': GAME_SERVER_HTTP,
      '/auth': GAME_SERVER_HTTP,
      '/media': GAME_SERVER_HTTP,
    },
  },
});
