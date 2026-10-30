/**
 * Pixels between node columns.
 */
export const COL = 62;

/**
 * Pixels between node rows.
 */
export const ROW = 74;

/**
 * A node's size in pixels.
 */
export const NODE = 46;

/**
 * Pixels above the first row for the branch labels.
 */
export const LABEL_ROW = 18;

/**
 * The details sidebar's starting width.
 */
export const SIDEBAR_WIDTH = 260;

/**
 * The narrowest the details sidebar can be dragged to.
 */
export const SIDEBAR_MIN = 160;

/**
 * The widest the details sidebar can be dragged to, as a share of the
 * screen.
 */
export const SIDEBAR_MAX_SHARE = 0.6;

/**
 * Where the phone remembers the details sidebar's width.
 */
export const SIDEBAR_KEY = 'graveyard.treeSidebar';

/**
 * Seconds a newly seen row takes to fade in.
 */
export const REVEAL_SECONDS = 1.6;

/**
 * How long (ms) the mouse rests on a node before its details show, with
 * `hoverDetails`.
 */
export const HOVER_MS = 1000;

/**
 * Panning with `hoverDetails`: how far (px) a drag goes before it's a drag
 * rather than a click.
 */
export const DRAG_SLOP = 5;

/**
 * How far (px) each WASD press moves the tree.
 */
export const PAN_STEP = 80;

/**
 * Which way each WASD key pans the tree.
 */
export const PAN_KEYS: Record<string, [number, number]> = { KeyW: [0, -1], KeyA: [-1, 0], KeyS: [0, 1], KeyD: [1, 0] };
