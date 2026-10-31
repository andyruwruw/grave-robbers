// Packages
import { createLogger, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Types
import type { UserConfigFnObject } from 'vite';

/**
 * The game server the dev servers proxy to (`GAME_PORT`, 3021 by default).
 */
const GAME_PORT = Number(process.env.GAME_PORT ?? 3021);
const GAME_SERVER = `ws://localhost:${GAME_PORT}`;
const GAME_SERVER_HTTP = `http://localhost:${GAME_PORT}`;
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * Each app's dev server port, counting up from `APPS_PORT` (5181 by
 * default). The phone app's passes /tv, /play, and /admin through to the
 * others, so every screen is still opened from one address (and the TV's
 * join QR points at it).
 */
const FIRST_PORT = Number(process.env.APPS_PORT ?? 5181);
export const APP_PORTS = { mobile: FIRST_PORT, tv: FIRST_PORT + 1, play: FIRST_PORT + 2, admin: FIRST_PORT + 3 };

/**
 * Packages every app may import, as `@halloween/<name>/<path>`.
 */
const PACKAGES = ['ui', 'renderer', 'game-ui', 'controls'];

/**
 * Vite logs a full stack trace for every proxied socket that drops while the
 * game server restarts (ECONNRESET) or is down (ECONNREFUSED), and the
 * clients retry every few seconds. Collapse those into one line per outage.
 */
function quietLogger(): ReturnType<typeof createLogger> {
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
  return logger;
}

/**
 * One app's Vite config: served under `base` (its route in production) on
 * its port, with the game server proxied and the shared packages aliased.
 * `__PHONE_PORT__` is the phone app's dev port while serving (the TV's join
 * QR points there) and null in a build, where every app shares one port.
 *
 * @param options - The app's route and which app it is.
 * @returns The Vite config.
 */
export function appConfig({ base, app }: { base: string; app: keyof typeof APP_PORTS }): UserConfigFnObject {
  const port = APP_PORTS[app];
  const others = base === '/'
    ? Object.fromEntries((['tv', 'play', 'admin'] as const).map((app) => [`^/${app}(/|$)`, {
      target: `http://localhost:${APP_PORTS[app]}`,
      rewrite: (path: string): string => (path === `/${app}` ? `/${app}/` : path),
    }]))
    : {};
  return defineConfig(({ command }) => ({
    base,
    define: { __PHONE_PORT__: JSON.stringify(command === 'serve' ? APP_PORTS.mobile : null) },
    customLogger: quietLogger(),
    plugins: [react()],
    resolve: {
      alias: PACKAGES.map((name) => ({ find: `@halloween/${name}`, replacement: fileURLToPath(new URL(`../packages/${name}/src`, import.meta.url)) })),
    },
    server: {
      port,
      strictPort: true,
      host: true,
      hmr: { clientPort: port },
      fs: { allow: [REPO_ROOT] },
      proxy: {
        ...others,
        '/ws': { target: GAME_SERVER, ws: true },
        '/api': GAME_SERVER_HTTP,
        '/auth': GAME_SERVER_HTTP,
        '/media': GAME_SERVER_HTTP,
      },
    },
  }));
}
