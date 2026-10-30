/**
 * The pad buttons that count presses (the phone acts once per press), each
 * with its count so far and whether it's held now.
 */
export type PadPresses = Record<'panic' | 'bag' | 'craft' | 'tree' | 'turnLeft' | 'turnRight', { count: number; down: boolean }>;
