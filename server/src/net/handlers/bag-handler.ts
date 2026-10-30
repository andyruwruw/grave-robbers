// Local Imports
import { ControllerHandler } from './controller-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession } from '../types/session';

/**
 * Messages this family handles.
 */
type BagMessage = 'equip' | 'drink' | 'unequip' | 'drop-gear' | 'move-item' | 'craft' | 'upgrade';

/**
 * A joined phone's bag, crafting and skill tree.
 */
export class BagHandler extends ControllerHandler<BagMessage> {
  /**
   * Hands a bag, craft or upgrade request to the game.
   * @param _ws The phone's socket.
   * @param _session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected handleFor(_ws: WebSocket, _session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: BagMessage }>): void {
    switch (msg.t) {
      case 'equip':
        this.game.hands.equip(token, msg.bag);
        return;
      case 'drink':
        this.game.life.drink(token, msg.bag);
        return;
      case 'unequip':
        this.game.hands.unequip(token, msg.slot);
        return;
      case 'drop-gear':
        this.game.drops.dropGear(token, msg.from);
        return;
      case 'move-item':
        this.game.hands.moveItem(token, msg.from, msg.to);
        return;
      case 'craft':
        this.game.crafting.craft(token, msg.recipe, msg.count);
        return;
      case 'upgrade':
        this.game.crafting.upgrade(token, msg.node);
        return;
    }
  }
}
