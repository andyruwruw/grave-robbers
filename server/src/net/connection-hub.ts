// Local Imports
import { StateBroadcaster } from './broadcast/state-broadcaster';
import { StatsWindow } from './broadcast/stats-window';
import { guard } from '../game/helpers/guard';
import { PING_INTERVAL_MS } from './config/ping';
import { buildRoutes } from './handlers/routes';
import { PadRegistry } from './pads/pad-registry';
import { MusicOwner } from './sessions/music-owner';
import { PingTracker } from './sessions/ping-tracker';
import { SessionRegistry } from './sessions/session-registry';

// Types
import type { WebSocket, WebSocketServer, RawData } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Game } from '../game/game';
import type { SaveKeeper } from '../game/storage/save-keeper';
import type { MessageHandler } from './handlers/message-handler';

/**
 * Routes socket traffic into the Game and broadcasts state to displays.
 * Each phone owns at most one socket: a newer socket for the same token
 * replaces the older one. The work lives in its parts; the hub wires
 * sockets to them and sends each message to its family's handler.
 */
export class ConnectionHub {
  /**
   * The TV's per-second stats and the bytes sent to displays.
   */
  readonly stats = new StatsWindow(this);

  /**
   * Every socket's session.
   */
  readonly sessions = new SessionRegistry(this);

  /**
   * Every socket's round trip.
   */
  readonly pings = new PingTracker(this);

  /**
   * Which TV page plays the music.
   */
  readonly music = new MusicOwner(this);

  /**
   * The game controllers plugged into TV pages.
   */
  readonly pads = new PadRegistry(this);

  /**
   * The per-tick fan-out to displays and phones.
   */
  readonly broadcaster = new StateBroadcaster(this);

  /**
   * The handler for each message type.
   */
  private readonly _routes = buildRoutes(this);

  /**
   * Starts listening for sockets and pinging them.
   * @param wss The WebSocket server.
   * @param game The game to route into.
   * @param saves Keeps the game saved, and its world slots.
   */
  constructor(
    wss: WebSocketServer,
    readonly game: Game,
    readonly saves: SaveKeeper,
  ) {
    wss.on('connection', (ws: WebSocket): void => this.handleConnection(ws));
    setInterval((): void => {
      guard('ping', (): void => this.pings.pingAll());
    }, PING_INTERVAL_MS);
  }

  /**
   * Sends this tick's tile changes (if any) and state to every display, and
   * changed inventories to their phones. `steps` ticks just ran, taking
   * `stepMs` in all; both feed the stats shown on the TV each second.
   * @param steps Ticks that just ran.
   * @param stepMs Time (ms) they took in all.
   */
  broadcastState(steps: number, stepMs: number): void {
    this.broadcaster.broadcastState(steps, stepMs);
  }

  /**
   * Starts a session for a new socket and listens to it.
   * @param ws The socket.
   */
  private handleConnection(ws: WebSocket): void {
    this.sessions.sockets.set(ws, { role: 'unknown' });
    this.pings.add(ws);
    ws.on('message', (raw: RawData): void => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      guard(`message ${typeof msg?.t === 'string' ? msg.t : '?'}`, (): void => this.handleMessage(ws, msg));
    });
    ws.on('close', (): void => {
      guard('close', (): void => this.handleClose(ws));
    });
    ws.on('error', (err: Error): void => console.error('[socket]', err.message));
  }

  /**
   * Sends a message to its family's handler. Unknown types are ignored.
   * @param ws The socket it came from.
   * @param msg The message.
   */
  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    const session = this.sessions.sockets.get(ws);
    if (!session) {
      return;
    }
    const route: MessageHandler | undefined = this._routes[msg.t];
    route?.handle(ws, session, msg);
  }

  /**
   * Forgets a closed socket: hands on its music, slumps its player unless
   * a pad still plays them, and forgets its TV page's pads.
   * @param ws The socket.
   */
  private handleClose(ws: WebSocket): void {
    const session = this.sessions.sockets.get(ws);
    this.sessions.sockets.delete(ws);
    this.pings.remove(ws);
    this.music.handOff(ws);
    if (session?.role === 'controller' && session.token && this.sessions.controllers.get(session.token) === ws) {
      this.sessions.controllers.delete(session.token);
      if (!this.pads.heldBy(session.token)) {
        this.game.joining.disconnect(session.token);
      }
    }
    if (session?.role === 'display') {
      this.pads.dropTv(ws);
    }
  }
}
