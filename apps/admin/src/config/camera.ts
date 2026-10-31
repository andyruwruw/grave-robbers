/**
 * Tiles tall the view starts at, centered on the spawn, on a huge world.
 */
export const HUGE_START_TALL = 56;

/**
 * How far past the map's edge the view may go, in half screens (1: the
 * edge can reach the middle of the screen).
 */
export const OVERSCROLL = 1;

/**
 * Fewest tiles tall the wheel zooms in to.
 */
export const MIN_TALL = 8;

/**
 * Most tiles tall the wheel zooms out to, in map heights (so it never
 * really stops: past the map the view is mostly empty).
 */
export const MAX_TALL_MAPS = 4;

/**
 * How fast the wheel zooms: the view grows by e^(this x wheel delta).
 */
export const ZOOM_RATE = 0.0015;

/**
 * How fast WASD pans, in view heights a second (so it feels the same at
 * any zoom); Shift doubles it.
 */
export const PAN_SPEED = 0.8;

/**
 * The keys that pan the view, as (x, y) steps.
 */
export const PAN_KEYS: Record<string, [number, number]> = {
  w: [0, -1],
  a: [-1, 0],
  s: [0, 1],
  d: [1, 0],
};
