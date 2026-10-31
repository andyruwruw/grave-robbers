// Local Imports
import { DisplayHandler } from './display-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { DisplaySession } from '../types/session';

/**
 * Messages this family handles.
 */
type TvToolMessage = 'kill-monsters' | 'tv-lift' | 'tv-light' | 'start-world-event' | 'game-settings' | 'spawn' | 'regrowth-target' | 'clear-items' | 'give';

/**
 * The TV's tools: killing monsters, the mouse's lift and light, world
 * events, the Game tab's switches, conjuring, and the admin's regrowth
 * targets and clearing the ground.
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
      case 'start-world-event':
        this.game.worldEvents.start(msg.kind);
        return;
      case 'game-settings':
        this.game.gameTab.configure(msg.settings);
        return;
      case 'regrowth-target':
        this.game.world.growth.setTarget(msg.tile, msg.target);
        return;
      case 'clear-items':
        this.game.world.items.clear();
        return;
      case 'give':
        this.game.conjure.give(msg.player, msg.item, msg.count);
        return;
      case 'spawn':
        this.game.conjure.spawn(msg.kind, msg.at && Number.isFinite(msg.at.x) && Number.isFinite(msg.at.y) ? msg.at : null);
        return;
    }
  }
}
