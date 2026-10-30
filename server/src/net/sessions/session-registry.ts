// Packages
import { WebSocket } from 'ws';

// Local Imports
import { HubPart } from '../core/hub-part';
import { isTv } from '../helpers/session';

// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { ServerMessage } from '@halloween/shared/protocol/messages/server-message';
import type { Session } from '../types/session';

/**
 * Every socket's session, and which socket each phone's token is on. Each
 * phone owns at most one socket: a newer socket for the same token
 * replaces the older one.
 */
export class SessionRegistry extends HubPart {
  /**
   * Each open socket's session.
   */
  readonly sockets = new Map<WebSocket, Session>();

  /**
   * The socket each phone's token is on.
   */
  readonly controllers = new Map<string, WebSocket>();

  /**
   * Sends to one socket, if it's still open.
   * @param ws The socket.
   * @param msg The message.
   */
  send(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Sends to every display (TVs, admin pages, and /play views), or only
   * TVs (`false`) or only admin pages (`true`).
   * @param msg The message.
   * @param admin Only admin pages (`true`) or only TVs (`false`).
   */
  broadcastToDisplays(msg: DisplayMessage, admin?: boolean): void {
    const data = JSON.stringify(msg);
    this.stats.countSent(data.length);
    for (const [ws, session] of this.sockets) {
      if (session.role === 'display' && (admin === undefined ? true : admin ? session.admin : isTv(session)) && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  /**
   * The players some /play screen is following, so the TV leaves them out
   * of its split screen.
   * @returns Their ids.
   */
  watchedByViewers(): string[] {
    const ids = new Set<string>();
    for (const session of this.sockets.values()) {
      if (session.role === 'display' && session.viewer) {
        session.watch.forEach((id): void => void ids.add(id));
      }
    }
    return [...ids];
  }

  /**
   * Binds a token to this socket, closing any older socket holding it.
   * @param ws The socket.
   * @param token The phone's token.
   */
  claimToken(ws: WebSocket, token: string): void {
    const previous = this.controllers.get(token);
    if (previous && previous !== ws) {
      const prevSession = this.sockets.get(previous);
      if (prevSession?.role === 'controller') {
        prevSession.token = null;
      }
      previous.close(4000, 'Replaced by a newer connection');
    }
    this.controllers.set(token, ws);
  }
}
