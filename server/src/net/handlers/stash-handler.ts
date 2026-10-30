// Local Imports
import { ControllerHandler } from './controller-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession } from '../types/session';

/**
 * Messages this family handles.
 */
type StashMessage = 'stash-move' | 'stash-close' | 'stash-take-down';

/**
 * A joined phone's open storage chest.
 */
export class StashHandler extends ControllerHandler<StashMessage> {
  /**
   * Hands a chest request to the game.
   * @param _ws The phone's socket.
   * @param _session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected handleFor(_ws: WebSocket, _session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: StashMessage }>): void {
    switch (msg.t) {
      case 'stash-move':
        if (msg.from === 'bag' || msg.from === 'stash') {
          this.game.stash.stashMove(token, msg.from, msg.index);
        }
        return;
      case 'stash-close':
        this.game.stash.stashClose(token);
        return;
      case 'stash-take-down':
        this.game.stash.stashTakeDown(token);
        return;
    }
  }
}
