// Local Imports
import {
  BUTTON_PRESS,
  STICK_DEADZONE,
} from '../config/input';

/**
 * A stick's position with its center dead zone cut out and rounded to
 * steps of 0.05, so small jitter doesn't count as a change.
 *
 * @param x - The stick's horizontal axis, -1..1.
 * @param y - The stick's vertical axis, -1..1.
 * @param deadzone - Travel around center that reads as zero.
 * @returns The cleaned up `[x, y]`.
 */
export const stick = (x: number, y: number, deadzone = STICK_DEADZONE): [number, number] => (
  Math.hypot(x, y) < deadzone ? [0, 0] : [Math.round(x * 20) / 20, Math.round(y * 20) / 20]
);

/**
 * Whether a pad's button is held: pressed, or a trigger pulled past
 * BUTTON_PRESS.
 *
 * @param gp - The pad.
 * @param i - The button's standard-mapping index.
 * @returns True while the button is down.
 */
export const buttonDown = (gp: Gamepad, i: number): boolean => !!gp.buttons[i]?.pressed || (gp.buttons[i]?.value ?? 0) > BUTTON_PRESS;

/**
 * The pad being played: whichever connected one was used last.
 *
 * @returns That pad, or null with none connected.
 */
export const latestPad = (): Gamepad | null => {
  let best: Gamepad | null = null;
  for (const gp of navigator.getGamepads()) {
    if (gp && gp.connected && (!best || gp.timestamp > best.timestamp)) {
      best = gp;
    }
  }
  return best;
};

/**
 * Short name for a pad from the browser's id ("Xbox Wireless Controller
 * (STANDARD GAMEPAD ...)" becomes "Xbox Wireless Controller").
 *
 * @param gp - The pad.
 * @param fallback - The name to use when the id has nothing before its parenthesis.
 * @returns The pad's display name.
 */
export const padName = (gp: Gamepad, fallback: string): string => gp.id.replace(/\s*\(.*$/, '').trim() || fallback;
