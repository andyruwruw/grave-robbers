// Local Imports
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Session } from '../types/session';

/**
 * A phone (or /play) saying hello, joining, and leaving for good.
 */
export class ControllerSessionHandler extends MessageHandler<'hello-controller' | 'join' | 'leave'> {
  /**
   * Acts on `hello-controller`, `join` or `leave`.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: 'hello-controller' | 'join' | 'leave' }>): void {
    switch (msg.t) {
      case 'hello-controller': {
        const identity = typeof msg.token === 'string' ? this.game.joining.resume(msg.token) : null;
        this.sessions.sockets.set(ws, { role: 'controller', token: identity?.token ?? null });
        if (identity) {
          this.sessions.claimToken(ws, identity.token);
        }
        this.sessions.send(ws, { t: 'controller-welcome', identity });
        this.sendPrivateState(ws, identity?.token ?? null);
        return;
      }
      case 'join': {
        if (session.role !== 'controller' || session.token) {
          return;
        }
        const result = this.game.joining.join(String(msg.name ?? ''), String(msg.color ?? ''));
        if (!result.ok) {
          this.sessions.send(ws, { t: 'join-error', error: result.error });
          return;
        }
        session.token = result.identity.token;
        this.sessions.claimToken(ws, result.identity.token);
        this.sessions.send(ws, { t: 'joined', identity: result.identity });
        this.sendPrivateState(ws, result.identity.token);
        return;
      }
      case 'leave':
        if (session.role === 'controller' && session.token) {
          this.pads.releasePads(session.token);
          this.game.joining.leave(session.token);
          this.pads.padsChanged();
          this.sessions.controllers.delete(session.token);
          session.token = null;
          this.sessions.send(ws, { t: 'left' });
        }
        return;
    }
  }

  /**
   * Brings a freshly attached phone up to date: inventory, gear, what's in
   * reach, and vitals.
   * @param ws The phone's socket.
   * @param token Its player's token, or null before it joins.
   */
  private sendPrivateState(ws: WebSocket, token: string | null): void {
    const carried = token ? this.game.views.inventoryOf(token) : null;
    const vitals = token ? this.game.views.vitalsOf(token) : null;
    if (token && carried) {
      this.sessions.send(ws, { t: 'inventory', ...carried });
    }
    if (vitals) {
      this.sessions.send(ws, { t: 'vitals', vitals });
    }
    if (token) {
      this.sessions.send(ws, { t: 'pads', pads: this.pads.padList(token) });
    }
  }
}
