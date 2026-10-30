// Local Imports
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { Session } from '../types/session';

/**
 * Answers to the server's pings, from any socket.
 */
export class PongHandler extends MessageHandler<'pong'> {
  /**
   * Hands the pong to the ping tracker.
   * @param ws The socket it came from.
   * @param session That socket's session.
   */
  handle(ws: WebSocket, session: Session): void {
    this.pings.pong(ws, session);
  }
}
