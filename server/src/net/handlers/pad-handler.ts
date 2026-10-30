// Local Imports
import { isTv } from '../helpers/session';
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PadState } from '@halloween/shared/protocol/pads';
import type { Pad } from '../types/pads';
import type { Session } from '../types/session';

/**
 * Messages this family handles.
 */
type PadMessage = 'tv-pads' | 'pad' | 'claim-pad' | 'release-pad';

/**
 * Game controllers plugged into TV pages: the TV listing them and relaying
 * their state, and phones claiming and letting go of them.
 */
export class PadHandler extends MessageHandler<PadMessage> {
  /**
   * Acts on `tv-pads`, `pad`, `claim-pad` or `release-pad`.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: PadMessage }>): void {
    switch (msg.t) {
      case 'tv-pads':
        if (isTv(session) && Array.isArray(msg.pads)) {
          this.pads.sync(ws, msg.pads);
        }
        return;
      case 'pad': {
        const pad = isTv(session) ? this.pads.get(`${this.pads.tvId(ws)}-${msg.index}`) : undefined;
        const s = msg.state;
        if (pad?.token && s && typeof s === 'object') {
          this.relay(pad, pad.token, s);
        }
        return;
      }
      case 'claim-pad': {
        const pad = this.pads.get(String(msg.id));
        if (session.role === 'controller' && session.token && pad && !pad.token) {
          this.pads.claim(session.token, pad);
        }
        return;
      }
      case 'release-pad':
        if (session.role === 'controller' && session.token) {
          this.pads.releasePads(session.token);
          this.pads.padsChanged();
        }
        return;
    }
  }

  /**
   * Plays a claimed pad's state into its player: sticks, action and
   * block, placing and turning while building, panic, and the menu
   * buttons (which open on the phone).
   * @param pad The pad.
   * @param token The token of the player who claimed it.
   * @param s The state the TV relayed.
   */
  private relay(pad: Pad, token: string, s: PadState): void {
    const phone = this.sessions.controllers.get(token);
    const building = this.game.building.isBuilding(token);
    const presses = { panic: Number(s.panic) || 0, bag: Number(s.bag) || 0, craft: Number(s.craft) || 0, tree: Number(s.tree) || 0, turnLeft: Number(s.turnLeft) || 0, turnRight: Number(s.turnRight) || 0 };
    const act = s.act === true;
    this.game.controls.setInput(token, Number(s.x) || 0, Number(s.y) || 0);
    this.game.controls.setAim(token, Number(s.aimX) || 0, Number(s.aimY) || 0);
    this.game.controls.setAction(token, act && !building);
    this.game.controls.setBlock(token, s.block === true && !building);
    if (building) {
      if (act && !pad.act) {
        const error = this.game.building.placeBuild(token);
        if (error && phone) {
          this.sessions.send(phone, { t: 'build-error', error });
        }
      }
      if (presses.turnLeft !== pad.presses.turnLeft) {
        this.game.controls.turn(token, -1);
      }
      if (presses.turnRight !== pad.presses.turnRight) {
        this.game.controls.turn(token, 1);
      }
    }
    pad.act = act;
    if (presses.panic !== pad.presses.panic) {
      this.game.panics.panic(token);
    }
    const menu = (['bag', 'craft', 'tree'] as const).find((m): boolean => presses[m] !== pad.presses[m]);
    if (phone && menu) {
      this.sessions.send(phone, { t: 'pad-menu', menu });
    }
    pad.presses = presses;
  }
}
