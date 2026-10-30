// Local Imports
import { listPresets } from '../../game/storage/presets';
import { MAX_WATCHED } from '../config/limits';
import { lanAddress } from '../helpers/lan-address';
import { worldMessage } from '../helpers/world-message';
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Session } from '../types/session';

/**
 * A display saying hello, and a /play view saying which players it
 * follows.
 */
export class DisplaySessionHandler extends MessageHandler<'hello-display' | 'watch'> {
  /**
   * Acts on `hello-display` or `watch`.
   * @param ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: 'hello-display' | 'watch' }>): void {
    switch (msg.t) {
      case 'hello-display':
        this.sessions.sockets.set(ws, { role: 'display', admin: msg.admin === true, viewer: msg.viewer === true, watch: [] });
        this.sessions.send(ws, { t: 'display-welcome', lanAddress: lanAddress(), presets: listPresets() });
        this.sessions.send(ws, worldMessage(this.game));
        this.sessions.send(ws, this.pads.padListMessage());
        if (msg.admin !== true && msg.viewer !== true) {
          this.music.setMusicOwner(ws);
        }
        if (msg.admin === true && this.music.tvStatus) {
          this.sessions.send(ws, { t: 'tv-status', status: this.music.tvStatus });
        }
        return;
      case 'watch':
        if (session.role === 'display' && Array.isArray(msg.ids)) {
          session.watch = msg.ids.filter((id: unknown): id is string => typeof id === 'string').slice(0, MAX_WATCHED);
        }
        return;
    }
  }
}
