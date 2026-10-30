// Local Imports
import { DisplayHandler } from './display-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { DisplaySession } from '../types/session';

/**
 * Messages this family handles.
 */
type TvToolMessage = 'kill-monsters' | 'tv-lift' | 'tv-light' | 'force-blood-moon' | 'game-settings' | 'spawn';

/**
 * The TV's tools: killing monsters, the mouse's lift and light, the blood
 * moon, the Game tab's switches, and conjuring.
 */
export class TvToolsHandler extends DisplayHandler<TvToolMessage> {
  /**
   * Acts on one of the TV's tools.
   * @param _ws The display's socket.
   * @param _session Its session.
   * @param msg The message.
   */
  protected handleFor(_ws: WebSocket, _session: DisplaySession, msg: Extract<ClientMessage, { t: TvToolMessage }>): void {
    switch (msg.t) {
      case 'kill-monsters':
        this.game.conjure.killMonsters();
        return;
      case 'tv-lift':
        this.game.tvHand.lift(msg.target, msg.x, msg.y, msg.drop);
        return;
      case 'tv-light':
        this.game.tvHand.setCursorLight(msg.at);
        return;
      case 'force-blood-moon':
        this.game.moon.forceBloodMoon();
        return;
      case 'game-settings':
        this.game.gameTab.configure(msg.settings);
        return;
      case 'spawn':
        this.game.conjure.spawn(msg.kind);
        return;
    }
  }
}
