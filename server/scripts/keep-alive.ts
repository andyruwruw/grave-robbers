// Packages
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Seconds to wait before restarting after the server exits.
 */
const RESTART_DELAY_S = 2;

/**
 * Seconds to wait instead once it has crashed CRASH_LIMIT times within
 * CRASH_WINDOW_S, so a crash on startup doesn't spin.
 */
const SLOW_RESTART_DELAY_S = 10;

/**
 * Crashes within CRASH_WINDOW_S that switch to SLOW_RESTART_DELAY_S.
 */
const CRASH_LIMIT = 5;

/**
 * Seconds over which crashes are counted.
 */
const CRASH_WINDOW_S = 60;

/**
 * The server package's folder (the server runs from there, like `npm start`).
 */
const SERVER_DIR = fileURLToPath(new URL('..', import.meta.url));

/**
 * When the server last exited, newest last.
 */
const crashes: number[] = [];

/**
 * Whether Ctrl+C (or a stop signal) asked everything to stop.
 */
let stopping = false;

/**
 * The running server, if any.
 */
let child: ReturnType<typeof spawn> | null = null;

/**
 * Starts the server the way `npm start` does, and starts it again a moment
 * after it exits for any reason, unless we're stopping. It saves every 30
 * seconds, so a restart loses at most that much.
 */
function run(): void {
  console.log('[keep-alive] starting the server');
  child = spawn('npx', ['tsx', '--env-file-if-exists=.env', 'src/server.ts'], { cwd: SERVER_DIR, stdio: 'inherit', shell: true });
  child.on('exit', (code: number | null, signal: string | null): void => {
    child = null;
    if (stopping) {
      process.exit(0);
    }
    const now = Date.now();
    crashes.push(now);
    while (crashes.length > 0 && now - crashes[0] > CRASH_WINDOW_S * 1000) {
      crashes.shift();
    }
    const wait = crashes.length >= CRASH_LIMIT ? SLOW_RESTART_DELAY_S : RESTART_DELAY_S;
    console.error(`[keep-alive] the server exited (${signal ?? `code ${code}`}); restarting in ${wait}s`);
    setTimeout(run, wait * 1000);
  });
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, (): void => {
    stopping = true;
    if (!child) {
      process.exit(0);
    }
    child.kill(signal);
  });
}

run();
