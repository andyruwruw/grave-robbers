// Packages
import { useCallback, useEffect, useRef } from 'react';

// Local Imports
import { PAD_LOG_MS, PAD_POLL_MS } from '../config/pad-buttons';
import { PadLogger } from '../input/pad-logger';
import { PadRelay } from '../input/pad-relay';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { SocketStatus } from '@halloween/ui/hooks/use-socket';

/**
 * Game controllers plugged into the TV machine, for phones to claim. The
 * TV tells the server which pads it can see (`tv-pads`; some browsers only
 * show one once a button on it has been pressed); a phone claims one, and
 * the server answers with the claimed pads (`pad-claims`, passed to the
 * returned `onClaims`). For each claimed pad the TV sends its sticks and
 * buttons (`pad`) whenever they change: the left stick walks, the right
 * stick aims, RT hits, LB or LT blocks, B panics, and the west, north, and
 * Back buttons open the bag, crafting, and the skill tree on the player's
 * phone, which keeps the menus. Everything the browser reports about its
 * controllers (and the window's focus) is logged to the console as
 * `[pads]` lines whenever it changes (`PadLogger`; `PadRelay` sends).
 *
 * @param {SocketStatus} status - The TV socket's status (pads are re-sent on reconnect).
 * @param {(msg: ClientMessage) => void} send - Sends on the TV socket.
 * @returns {(indices: number[]) => void} Takes the server's claimed pads.
 */
export function useTvPads(status: SocketStatus, send: (msg: ClientMessage) => void): (indices: number[]) => void {
  const claimed = useRef(new Set<number>());
  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    const logger = new PadLogger();
    /**
     * Logs the connected pads.
     */
    const log = (): void => logger.log(claimed.current, status);
    log();
    const timer = setInterval(log, PAD_LOG_MS);
    window.addEventListener('gamepadconnected', logger.connected);
    window.addEventListener('gamepaddisconnected', logger.disconnected);
    return () => {
      clearInterval(timer);
      window.removeEventListener('gamepadconnected', logger.connected);
      window.removeEventListener('gamepaddisconnected', logger.disconnected);
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'open') {
      return undefined;
    }
    const relay = new PadRelay();
    const timer = setInterval((): void => relay.poll(claimed.current, sendRef.current), PAD_POLL_MS);
    return () => clearInterval(timer);
  }, [status]);

  return useCallback((indices: number[]): void => {
    console.log('[pads] claimed by phones', JSON.stringify(indices));
    claimed.current = new Set(indices);
  }, []);
}
