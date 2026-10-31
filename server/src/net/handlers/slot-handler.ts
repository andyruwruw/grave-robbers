// Local Imports
import { worldMessage } from '../helpers/world-message';
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Session } from '../types/session';

/**
 * The messages this handler takes.
 */
type SlotMessage = 'world-slots' | 'slot-create' | 'slot-open' | 'slot-delete' | 'character-release';

/**
 * The admin's Worlds page: listing, making, playing, and deleting world
 * slots, and releasing characters.
 */
export class SlotHandler extends MessageHandler<SlotMessage> {
  /**
   * Acts on a Worlds page message (from the admin only), then sends the
   * admins the slots as they now are.
   * @param _ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(_ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: SlotMessage }>): void {
    if (session.role !== 'display' || !session.admin) {
      return;
    }
    const saves = this._hub.saves;
    switch (msg.t) {
      case 'slot-create':
        if (typeof msg.name === 'string') {
          saves.slots.create(msg.name);
        }
        break;
      case 'slot-open':
        if (typeof msg.id === 'string') {
          const playing = [...this.game.roster.players.keys()];
          if (saves.switchTo(msg.id)) {
            this.dropControllers(playing);
            this.sessions.broadcastToDisplays(worldMessage(this.game));
          }
        }
        break;
      case 'slot-delete':
        if (typeof msg.id === 'string') {
          saves.slots.remove(msg.id);
        }
        break;
      case 'character-release':
        if (typeof msg.id === 'string') {
          const token = this.game.joining.release(msg.id);
          if (token) {
            this.dropControllers([token]);
            saves.save();
          }
        }
        break;
      case 'world-slots':
        break;
    }
    this.sessions.broadcastToDisplays({ t: 'world-slots', slots: saves.list(), characters: saves.characters() }, true);
  }

  /**
   * Sends phones whose players are gone back to the join form.
   * @param tokens The players' tokens.
   */
  private dropControllers(tokens: string[]): void {
    for (const token of tokens) {
      const ws = this.sessions.controllers.get(token);
      this.pads.releasePads(token);
      this.sessions.controllers.delete(token);
      if (ws) {
        const session = this.sessions.sockets.get(ws);
        if (session?.role === 'controller') {
          session.token = null;
        }
        this.sessions.send(ws, { t: 'left' });
      }
    }
    this.pads.padsChanged();
  }
}
