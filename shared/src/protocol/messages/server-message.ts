// Types
import type { ControllerMessage } from './controller-message';
import type { DisplayMessage } from './display-message';

/**
 * Connection upkeep every socket gets, handled by `useSocket` before the
 * page sees anything: the server pings once a second, the page answers
 * `pong`, and the server tells it the smoothed round trip (`rtt`, ms).
 */
export type NetMessage =
  /**
   * The server's ping.
   */
  | { t: 'ping' }
  /**
   * The smoothed round trip, in ms.
   */
  | { t: 'rtt'; ms: number };

/**
 * Any message the server sends.
 */
export type ServerMessage = DisplayMessage | ControllerMessage | NetMessage;
