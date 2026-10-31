/**
 * The face buttons' colors (A, B, X, Y, by standard-gamepad index), as
 * printed on an Xbox pad.
 */
export const FACE_COLORS: Record<number, string> = { 0: '#5cb85c', 1: '#d9534f', 2: '#3f8fd8', 3: '#e8b923' };

/**
 * The D-pad's arms by standard-gamepad index.
 */
export const DPAD_ARMS: Record<number, 'up' | 'down' | 'left' | 'right'> = { 12: 'up', 13: 'down', 14: 'left', 15: 'right' };

/**
 * Which mouse button each click binding is.
 */
export const MOUSE_BUTTONS: Record<string, 'left' | 'middle' | 'right'> = { Mouse0: 'left', Mouse1: 'middle', Mouse2: 'right' };
