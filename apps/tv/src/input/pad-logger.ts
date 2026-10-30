// Packages
import { BUTTON_PRESS } from '@halloween/ui/config/input';

// Types
import type { SocketStatus } from '@halloween/ui/hooks/use-socket';

/**
 * Logs everything the browser reports about its controllers (and the
 * window's focus) to the console as `[pads]` lines whenever it changes, for
 * finding out why a controller isn't seen or does nothing.
 */
export class PadLogger {
  /**
   * The last line logged.
   */
  private _lastLog = '';

  /**
   * Logs the pads if anything changed since the last line.
   *
   * @param claimed - The pads phones have claimed.
   * @param status - The TV socket's status.
   */
  log(claimed: Set<number>, status: SocketStatus): void {
    const pads = [...navigator.getGamepads()].filter((gp): gp is Gamepad => !!gp).map((gp: Gamepad) => ({
      index: gp.index,
      id: gp.id,
      mapping: gp.mapping || 'none',
      connected: gp.connected,
      claimed: claimed.has(gp.index),
      pressed: gp.buttons.map((b: GamepadButton, i: number): number | null => (b.pressed || b.value > BUTTON_PRESS ? i : null)).filter((i): i is number => i !== null),
      axes: gp.axes.map((a: number): number => Math.round(a * 100) / 100),
    }));
    const line = JSON.stringify({ focused: document.hasFocus(), visible: document.visibilityState, socket: status, pads });
    if (line !== this._lastLog) {
      this._lastLog = line;
      console.log('[pads]', line);
    }
  }

  /**
   * Logs a controller the browser just found.
   *
   * @param e - The browser's event.
   */
  readonly connected = (e: GamepadEvent): void => console.log('[pads] connected', e.gamepad.index, e.gamepad.id, e.gamepad.mapping || 'none');

  /**
   * Logs a controller the browser just lost.
   *
   * @param e - The browser's event.
   */
  readonly disconnected = (e: GamepadEvent): void => console.log('[pads] disconnected', e.gamepad.index, e.gamepad.id);
}
