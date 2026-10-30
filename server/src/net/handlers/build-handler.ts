// Local Imports
import { ControllerHandler } from './controller-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ControllerSession } from '../types/session';

/**
 * Messages this family handles.
 */
type BuildMessage = 'build-select' | 'build-aim' | 'build-place';

/**
 * A joined phone building: picking a structure, aiming it, and placing it.
 */
export class BuildHandler extends ControllerHandler<BuildMessage> {
  /**
   * Hands a build request to the game, telling the phone why a placement
   * failed.
   * @param ws The phone's socket.
   * @param _session Its session.
   * @param token Its player's token.
   * @param msg The message.
   */
  protected handleFor(ws: WebSocket, _session: ControllerSession, token: string, msg: Extract<ClientMessage, { t: BuildMessage }>): void {
    switch (msg.t) {
      case 'build-select':
        this.game.building.selectBuild(token, msg.slot);
        return;
      case 'build-aim':
        this.game.building.aimBuild(token, msg.at && Number.isFinite(msg.at.x) && Number.isFinite(msg.at.y) ? { x: msg.at.x, y: msg.at.y } : null);
        return;
      case 'build-place': {
        const error = this.game.building.placeBuild(token);
        if (error) {
          this.sessions.send(ws, { t: 'build-error', error });
        }
        return;
      }
    }
  }
}
