// Local Imports
import { ControllerHandler } from './controller-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession } from '../types/session';

/**
 * Messages this family handles.
 */
type UseMessage = 'use' | 'use-close' | 'use-feed' | 'use-collect' | 'use-route';

/**
 * A joined phone's USE button and the digger or station panel it opens.
 */
export class UseHandler extends ControllerHandler<UseMessage> {
  /**
   * Hands a USE request to the game.
   * @param _ws The phone's socket.
   * @param _session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected handleFor(_ws: WebSocket, _session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: UseMessage }>): void {
    switch (msg.t) {
      case 'use':
        this.game.use.use(token, msg.at && Number.isFinite(msg.at.x) && Number.isFinite(msg.at.y) ? { x: msg.at.x, y: msg.at.y } : null);
        return;
      case 'use-close':
        this.game.use.close(token);
        return;
      case 'use-feed':
        this.game.use.feed(token, msg.all === true);
        return;
      case 'use-collect':
        this.game.use.collect(token);
        return;
      case 'use-route':
        if (typeof msg.side === 'string' && (msg.item === null || typeof msg.item === 'string')) {
          this.game.use.route(token, msg.side, msg.item);
        }
        return;
    }
  }
}
