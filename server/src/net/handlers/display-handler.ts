// Local Imports
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { DisplaySession, Session } from '../types/session';

/**
 * A family of messages only a display may send: anything else is ignored.
 * Extra admin, viewer and TV checks stay in each message's handling.
 */
export abstract class DisplayHandler<K extends ClientMessage['t']> extends MessageHandler<K> {
  /**
   * Passes the message on if it came from a display.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: K }>): void {
    if (session.role === 'display') {
      this.handleFor(ws, session, msg);
    }
  }

  /**
   * Acts on a message from a display.
   * @param ws The display's socket.
   * @param session Its session.
   * @param msg The message.
   */
  protected abstract handleFor(ws: WebSocket, session: DisplaySession, msg: Extract<ClientMessage, { t: K }>): void;
}
