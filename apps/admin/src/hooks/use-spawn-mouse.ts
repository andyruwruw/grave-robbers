// Packages
import React, { useRef } from 'react';

// Local Imports
import { SpawnMouseMode } from '../mouse/spawn-mouse-mode';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { TvMouseHandlers } from '@halloween/controls/types/mouse';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * The map's mouse while something is picked on the Spawn page
 * (`SpawnMouseMode`): a click conjures it there.
 *
 * @param {React.RefObject<WorldRenderer | null>} renderer - The admin's renderer, for picking.
 * @param {SpawnKind} kind - What a click conjures.
 * @param {(msg: ClientMessage) => void} send - Sends to the server.
 * @returns {TvMouseHandlers} Handlers for the element over the map.
 */
export function useSpawnMouse(
  renderer: React.RefObject<WorldRenderer | null>,
  kind: SpawnKind,
  send: (msg: ClientMessage) => void,
): TvMouseHandlers {
  const mode = useRef<SpawnMouseMode | null>(null);
  mode.current ??= new SpawnMouseMode();
  mode.current.sync(renderer, kind, send);
  return mode.current.handlers();
}
