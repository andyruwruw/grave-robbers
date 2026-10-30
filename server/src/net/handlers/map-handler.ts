// Packages
import { cleanMapGen } from '@halloween/shared/map-gen/clean-map-gen';

// Local Imports
import { listPresets, savePreset } from '../../game/storage/presets';
import { MAX_MAP_EDITS, MAX_PRESET_NAME } from '../config/limits';
import { presetOf, worldMessage } from '../helpers/world-message';
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { Session } from '../types/session';

/**
 * The TV's map: editing it, saving it as a preset, and starting a new
 * world.
 */
export class MapHandler extends MessageHandler<'edit-map' | 'save-preset' | 'reset-world'> {
  /**
   * Acts on `edit-map`, `save-preset` or `reset-world`.
   * @param _ws The socket it came from.
   * @param session That socket's session.
   * @param msg The message.
   */
  handle(_ws: WebSocket, session: Session, msg: Extract<ClientMessage, { t: 'edit-map' | 'save-preset' | 'reset-world' }>): void {
    switch (msg.t) {
      case 'edit-map':
        if (session.role === 'display' && !session.viewer && Array.isArray(msg.edits)) {
          for (const e of msg.edits.slice(0, MAX_MAP_EDITS)) {
            if (e && typeof e === 'object') {
              this.game.world.editor.edit(e);
            }
          }
          this.game.world.map.takeChanges();
          this.sessions.broadcastToDisplays(worldMessage(this.game));
        }
        return;
      case 'save-preset': {
        const name = typeof msg.name === 'string' ? msg.name.trim().slice(0, MAX_PRESET_NAME) : '';
        if (session.role === 'display' && !session.viewer && name) {
          savePreset(presetOf(this.game, name));
          this.sessions.broadcastToDisplays({ t: 'presets', presets: listPresets() });
        }
        return;
      }
      case 'reset-world':
        if (session.role === 'display') {
          this.game.reset(typeof msg.preset === 'string' ? msg.preset : null, cleanMapGen(msg.gen));
          this.sessions.broadcastToDisplays(worldMessage(this.game));
          this._hub.onWorldReset();
        }
        return;
    }
  }
}
