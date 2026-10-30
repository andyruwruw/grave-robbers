// Local Imports
import { HubPart } from '../core/hub-part';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Session } from '../types/session';

/**
 * Handles one family of client messages, the ones whose `t` is in `K`.
 * The hub's route table sends each message to its family's handler.
 */
export abstract class MessageHandler<K extends ClientMessage['t'] = ClientMessage['t']> extends HubPart {
  /**
   * Acts on one message from a socket that has a session.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  abstract handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: K }>): void;
}
