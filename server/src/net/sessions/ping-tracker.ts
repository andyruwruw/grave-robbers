// Packages
import { WebSocket } from 'ws';

// Local Imports
import { PING_SMOOTHING } from '../config/ping';
import { HubPart } from '../core/hub-part';

// Types
import type { Session } from '../types/session';
import type { Ping } from './types/ping';

/**
 * Each socket's ping in flight (when it was sent) and smoothed round trip
 * (ms), for `rtt` replies, players' `ping`, and the melee rewind.
 */
export class PingTracker extends HubPart {
  /**
   * Each open socket's ping state.
   */
  private _pings = new Map<WebSocket, Ping>();

  /**
   * Starts tracking a new socket.
   * @param ws The socket.
   */
  add(ws: WebSocket): void {
    this._pings.set(ws, { sentAt: null, rtt: null });
  }

  /**
   * Stops tracking a closed socket.
   * @param ws The socket.
   */
  remove(ws: WebSocket): void {
    this._pings.delete(ws);
  }

  /**
   * Pings every socket once a second (one in flight at a time); see `pong`.
   */
  pingAll(): void {
    const now = Date.now();
    for (const [ws, ping] of this._pings) {
      if (ping.sentAt === null && ws.readyState === WebSocket.OPEN) {
        ping.sentAt = now;
        ws.send(JSON.stringify({ t: 'ping' }));
      }
    }
  }

  /**
   * A socket answered its ping: smooths its round trip, tells it, and
   * hands a phone's to its player.
   * @param ws The socket.
   * @param session Its session.
   */
  pong(ws: WebSocket, session: Session): void {
    const ping = this._pings.get(ws);
    if (ping?.sentAt != null) {
      const sample = Date.now() - ping.sentAt;
      ping.rtt = ping.rtt === null ? sample : ping.rtt * (1 - PING_SMOOTHING) + sample * PING_SMOOTHING;
      ping.sentAt = null;
      this.sessions.send(ws, { t: 'rtt', ms: Math.round(ping.rtt) });
      if (session.role === 'controller' && session.token) {
        this.game.controls.setPing(session.token, ping.rtt);
      }
    }
  }
}
