// Types
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';

/**
 * What the input loop last sent, so it only sends changes and can let go of
 * everything at once.
 */
export class HeldInputs {
  /**
   * The walk vector, as `x,y`.
   */
  move = '0,0';

  /**
   * The aim vector, as `x,y`.
   */
  aim = '0,0';

  /**
   * Whether the action button is held.
   */
  act = false;

  /**
   * Whether block is held.
   */
  block = false;

  /**
   * Where building aims, as JSON.
   */
  buildAim = 'null';

  /**
   * Lets go of everything the player was holding (a menu opened).
   *
   * @param send - Sends on the controller socket.
   */
  release(send: (msg: ClientMessage) => void): void {
    if (this.move !== '0,0') {
      send({ t: 'input', x: 0, y: 0 });
    }
    if (this.aim !== '0,0') {
      send({ t: 'aim', x: 0, y: 0 });
    }
    if (this.act) {
      send({ t: 'action', down: false });
    }
    if (this.block) {
      send({ t: 'block', down: false });
    }
    this.move = '0,0';
    this.aim = '0,0';
    this.act = false;
    this.block = false;
  }
}
