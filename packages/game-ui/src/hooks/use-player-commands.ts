// Packages
import { useMemo } from 'react';

// Local Imports
import { PlayerCommands } from '../session/player-commands';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';

/**
 * The player's commands over a controller socket, made again only when
 * `send` changes.
 *
 * @param send - Sends a message to the server.
 * @returns The commands.
 */
export function usePlayerCommands(send: (msg: ClientMessage) => void): PlayerCommands {
  return useMemo((): PlayerCommands => new PlayerCommands(send), [send]);
}
