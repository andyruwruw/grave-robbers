// Packages
import { STICK_DEADZONE } from '@halloween/ui/config/input';

// Types
import type { PadReading } from '../types/pad-monitor';

/**
 * Reads every connected controller this browser sees.
 *
 * @returns {PadReading[]} Each controller's index, name, and whether it's in use.
 */
export function readPads(): PadReading[] {
  return [...navigator.getGamepads()]
    .filter((gp): gp is Gamepad => !!gp && gp.connected)
    .map((gp: Gamepad): PadReading => ({
      index: gp.index,
      name: gp.id.replace(/\s*\(.*$/, '').trim() || `Controller ${gp.index + 1}`,
      active: gp.buttons.some((b: GamepadButton): boolean => b.pressed) || gp.axes.some((a: number): boolean => Math.abs(a) > STICK_DEADZONE),
    }));
}
