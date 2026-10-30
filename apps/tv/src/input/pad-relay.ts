// Packages
import {
  buttonDown,
  padName,
  stick,
} from '@halloween/ui/input/gamepad';

// Local Imports
import {
  BUTTON_ACT,
  BUTTON_BAG,
  BUTTON_CRAFT,
  BUTTON_PANIC,
  BUTTON_TREE,
  BUTTON_TURN_LEFT,
  BUTTON_TURN_RIGHT,
  BUTTONS_BLOCK,
} from '../config/pad-buttons';

// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PadState } from '@halloween/shared/protocol/pads';
import type { PadPresses } from '../types/pads';

/**
 * Relays the TV machine's game controllers to the server: the list of pads
 * it can see (`tv-pads`) whenever that changes, and, for each claimed pad,
 * its sticks and buttons (`pad`) whenever they change. Buttons the phone
 * acts on once per press are sent as press counts.
 */
export class PadRelay {
  /**
   * The pad list as last sent.
   */
  private _listKey = '';

  /**
   * Each claimed pad's state as last sent.
   */
  private readonly _last = new Map<number, string>();

  /**
   * Each claimed pad's press counts.
   */
  private readonly _presses = new Map<number, PadPresses>();

  /**
   * Reads the pads and sends what changed.
   *
   * @param claimed - The pads phones have claimed.
   * @param send - Sends on the TV socket.
   */
  poll(claimed: Set<number>, send: (msg: ClientMessage) => void): void {
    const pads = [...navigator.getGamepads()].filter((gp): gp is Gamepad => !!gp && gp.connected);
    const list = pads.map((gp: Gamepad): { index: number; name: string } => ({ index: gp.index, name: padName(gp, `Controller ${gp.index + 1}`) }));
    const key = JSON.stringify(list);
    if (key !== this._listKey) {
      this._listKey = key;
      send({ t: 'tv-pads', pads: list });
    }
    for (const gp of pads) {
      if (!claimed.has(gp.index)) {
        this._last.delete(gp.index);
        this._presses.delete(gp.index);
        continue;
      }
      /**
       * Whether one of this pad's buttons is held.
       *
       * @param i - The button index.
       * @returns True when held.
       */
      const down = (i: number): boolean => buttonDown(gp, i);
      const counts = this._presses.get(gp.index) ?? { panic: { count: 0, down: false }, bag: { count: 0, down: false }, craft: { count: 0, down: false }, tree: { count: 0, down: false }, turnLeft: { count: 0, down: false }, turnRight: { count: 0, down: false } };
      for (const [key, button] of [['panic', BUTTON_PANIC], ['bag', BUTTON_BAG], ['craft', BUTTON_CRAFT], ['tree', BUTTON_TREE], ['turnLeft', BUTTON_TURN_LEFT], ['turnRight', BUTTON_TURN_RIGHT]] as const) {
        if (down(button) && !counts[key].down) {
          counts[key].count++;
        }
        counts[key].down = down(button);
      }
      this._presses.set(gp.index, counts);
      const [x, y] = stick(gp.axes[0] ?? 0, gp.axes[1] ?? 0);
      const [aimX, aimY] = stick(gp.axes[2] ?? 0, gp.axes[3] ?? 0);
      const state: PadState = { x, y, aimX, aimY, act: down(BUTTON_ACT), block: BUTTONS_BLOCK.some(down), panic: counts.panic.count, bag: counts.bag.count, craft: counts.craft.count, tree: counts.tree.count, turnLeft: counts.turnLeft.count, turnRight: counts.turnRight.count };
      const stateKey = JSON.stringify(state);
      if (stateKey !== this._last.get(gp.index)) {
        this._last.set(gp.index, stateKey);
        send({ t: 'pad', index: gp.index, state });
      }
    }
  }
}
