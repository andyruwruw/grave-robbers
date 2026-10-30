// Local Imports
import { ControllerHandler } from './controller-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession } from '../types/session';

/**
 * Messages this family handles.
 */
type IntentMessage = 'input' | 'action' | 'block' | 'aim' | 'turn' | 'panic' | 'drop';

/**
 * What a joined phone's controls ask for: moving, acting, blocking,
 * aiming, turning, panicking and dropping goods.
 */
export class IntentHandler extends ControllerHandler<IntentMessage> {
  /**
   * Hands a control to the game.
   * @param _ws The phone's socket.
   * @param _session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected handleFor(_ws: WebSocket, _session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: IntentMessage }>): void {
    switch (msg.t) {
      case 'input':
        this.game.controls.setInput(token, Number(msg.x), Number(msg.y));
        return;
      case 'action':
        this.game.controls.setAction(token, msg.down === true);
        return;
      case 'block':
        this.game.controls.setBlock(token, msg.down === true);
        return;
      case 'aim':
        this.game.controls.setAim(token, msg.x, msg.y);
        return;
      case 'drop':
        this.game.drops.drop(token, msg.resource);
        return;
      case 'panic':
        this.game.panics.panic(token);
        return;
      case 'turn':
        if (msg.dir === 1 || msg.dir === -1) {
          this.game.controls.turn(token, msg.dir);
        }
        return;
    }
  }
}
