// Packages
import { cleanMapGen } from '@halloween/shared/map-gen/clean-map-gen';

// Local Imports
import { listPresets, savePreset } from '../../game/storage/presets';
import { generateHugeOffThread } from '../../game/world-gen/threads/generate-huge-off-thread';
import { MAX_MAP_EDITS, MAX_PRESET_NAME } from '../config/limits';
import { GENERATING_LEAD_MS } from '../config/world';
import { presetOf, worldMessage } from '../helpers/world-message';
import { MessageHandler } from './message-handler';

// Types
import type { WebSocket } from 'ws';
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { MapPreset } from '../../game/storage/types/save';
import type { Session } from '../types/session';

/**
 * The TV's map: editing it, saving it as a preset, and starting a new
 * world.
 */
export class MapHandler extends MessageHandler<'edit-map' | 'save-preset' | 'reset-world'> {
  /**
   * Whether a huge world is waiting to be generated (further resets are
   * ignored until it's done).
   */
  private _generating = false;

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
        if (session.role === 'display' && !this._generating) {
          this.reset(typeof msg.preset === 'string' ? msg.preset : null, cleanMapGen(msg.gen));
        }
        return;
    }
  }

  /**
   * Starts a new world and sends it to every display. A random huge world
   * takes a moment to generate, so displays are told first (`generating`,
   * which they show until the `world` message). With background threads on
   * (`GameSettings.threads`) it's made on a worker thread while the game
   * plays on, falling back to this thread if the worker fails; off, it's
   * made here GENERATING_LEAD_MS later, freezing the game while it does.
   * @param preset The preset to start from, or null for a random map.
   * @param gen The random map's knobs.
   */
  private reset(preset: string | null, gen: MapGenSettings): void {
    const start = (made: MapPreset | null = null): void => {
      this._hub.saves.backup('before-reset');
      this.game.reset(made ?? preset, gen);
      this.sessions.broadcastToDisplays(worldMessage(this.game));
      this._hub.saves.save();
      this._generating = false;
    };
    if (preset !== null || gen.size !== 'huge') {
      start();
      return;
    }
    this._generating = true;
    this.sessions.broadcastToDisplays({ t: 'generating' });
    if (!this.game.settings.threads) {
      setTimeout(start, GENERATING_LEAD_MS);
      return;
    }
    generateHugeOffThread(gen).then(start, (err: unknown): void => {
      console.error('[world] huge-gen worker failed, generating here', err);
      start();
    });
  }
}
