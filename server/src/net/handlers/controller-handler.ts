// Local Imports
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession, Session } from '../types/session';

/**
 * A family of messages only a phone that has joined may send: anything
 * else is ignored.
 */
export abstract class ControllerHandler<K extends ClientMessage['t']> extends MessageHandler<K> {
  /**
   * Passes the message on if it came from a joined phone.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: K }>): void {
    if (session.role === 'controller' && session.token) {
      this.handleFor(ws, session, session.token, msg);
    }
  }

  /**
   * Acts on a message from a joined phone.
   * @param ws The phone's socket.
   * @param session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected abstract handleFor(ws: WebSocket, session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: K }>): void;
}
