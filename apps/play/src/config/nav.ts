// Types
import type { NavDir } from '../types/play';

/**
 * The class on the element a gamepad has selected.
 */
export const FOCUS_CLASS = 'pad-focus';

/**
 * What a gamepad can select.
 */
export const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]';

/**
 * Each direction as a unit step on screen.
 */
export const DIRS: Record<NavDir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
