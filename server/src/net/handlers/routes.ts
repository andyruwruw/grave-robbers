// Local Imports
import { BagHandler } from './bag-handler';
import { BuildHandler } from './build-handler';
import { ControllerSessionHandler } from './controller-session-handler';
import { DisplaySessionHandler } from './display-session-handler';
import { IntentHandler } from './intent-handler';
import { MapHandler } from './map-handler';
import { MusicHandler } from './music-handler';
import { PadHandler } from './pad-handler';
import { PongHandler } from './pong-handler';
import { StashHandler } from './stash-handler';
import { TvToolsHandler } from './tv-tools-handler';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { ConnectionHub } from '../connection-hub';
import type { MessageHandler } from './message-handler';

/**
 * The handler for every client message type, each typed for its own
 * message. Listing each type is required, so the compiler proves none is
 * left unrouted.
 */
type Routes = { readonly [T in ClientMessage['t']]: MessageHandler<T> };

/**
 * The route table the hub dispatches through, keyed by any message's `t`.
 */
export type RouteTable = Readonly<Record<ClientMessage['t'], MessageHandler>>;

/**
 * Builds the hub's route table. It has no prototype, so a message whose
 * `t` is `constructor`, `toString` or `__proto__` finds no handler and is
 * ignored, like any other unknown type.
 * @param hub The hub the handlers act through.
 * @returns The frozen table.
 */
export function buildRoutes(hub: ConnectionHub): RouteTable {
  const pong = new PongHandler(hub);
  const displaySession = new DisplaySessionHandler(hub);
  const music = new MusicHandler(hub);
  const map = new MapHandler(hub);
  const tvTools = new TvToolsHandler(hub);
  const controllerSession = new ControllerSessionHandler(hub);
  const intent = new IntentHandler(hub);
  const bag = new BagHandler(hub);
  const stash = new StashHandler(hub);
  const build = new BuildHandler(hub);
  const pad = new PadHandler(hub);
  const routes: Routes = {
    'pong': pong,
    'hello-display': displaySession,
    'watch': displaySession,
    'claim-music': music,
    'tv-status': music,
    'tv-control': music,
    'edit-map': map,
    'save-preset': map,
    'reset-world': map,
    'kill-monsters': tvTools,
    'tv-lift': tvTools,
    'tv-light': tvTools,
    'force-blood-moon': tvTools,
    'game-settings': tvTools,
    'spawn': tvTools,
    'hello-controller': controllerSession,
    'join': controllerSession,
    'leave': controllerSession,
    'input': intent,
    'action': intent,
    'block': intent,
    'aim': intent,
    'turn': intent,
    'panic': intent,
    'drop': intent,
    'equip': bag,
    'drink': bag,
    'unequip': bag,
    'drop-gear': bag,
    'move-item': bag,
    'craft': bag,
    'upgrade': bag,
    'stash-move': stash,
    'stash-close': stash,
    'stash-take-down': stash,
    'build-select': build,
    'build-aim': build,
    'build-place': build,
    'tv-pads': pad,
    'pad': pad,
    'claim-pad': pad,
    'release-pad': pad,
  };
  return Object.freeze(Object.assign(Object.create(null), routes));
}
