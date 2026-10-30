// Local Imports
import { isTv } from '../helpers/session';
import { DisplayHandler } from './display-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { DisplaySession } from '../types/session';

/**
 * The TV's music: which TV page plays it, what it's playing, and the
 * admin page's remote control.
 */
export class MusicHandler extends DisplayHandler<'claim-music' | 'tv-status' | 'tv-control'> {
  /**
   * Acts on `claim-music`, `tv-status` or `tv-control`.
   * @param ws The display's socket.
   * @param session Its session.
   * @param msg The message.
   */
  protected handleFor(ws: WebSocket, session: DisplaySession, msg: Extract<ClientMessage, { t: 'claim-music' | 'tv-status' | 'tv-control' }>): void {
    switch (msg.t) {
      case 'tv-control':
        if (session.admin) {
          this.sessions.broadcastToDisplays({ t: 'tv-control', control: msg.control }, false);
        }
        return;
      case 'claim-music':
        if (isTv(session)) {
          this.music.setMusicOwner(ws);
        }
        return;
      case 'tv-status':
        if (isTv(session) && ws === this.music.owner) {
          this.music.tvStatus = msg.status;
          this.sessions.broadcastToDisplays({ t: 'tv-status', status: msg.status }, true);
        }
        return;
    }
  }
}
