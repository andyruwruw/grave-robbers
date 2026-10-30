// Packages
import React, { useRef } from 'react';

// Local Imports
import { PlayMouseMode } from '../mouse/play-mouse-mode';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { TvMouseHandlers } from '../types/mouse';

/**
 * The TV's mouse on the map (`PlayMouseMode`), each part switched on from
 * the Game tab: the left button picks up a player or monster and drops it
 * wherever it's let go (the server finds the nearest spot it can stand),
 * and holding the right button carries a light that follows the cursor.
 *
 * @param {React.RefObject<WorldRenderer | null>} renderer - The TV's renderer, for picking.
 * @param {GameSettings} settings - The server's switches.
 * @param {(msg: ClientMessage) => void} send - Sends to the server.
 * @returns {TvMouseHandlers} Handlers for the element over the map.
 */
export function useTvMouse(
  renderer: React.RefObject<WorldRenderer | null>,
  settings: GameSettings,
  send: (msg: ClientMessage) => void,
): TvMouseHandlers {
  const mode = useRef<PlayMouseMode | null>(null);
  mode.current ??= new PlayMouseMode();
  mode.current.sync(renderer, settings, send);
  return mode.current.handlers();
}
