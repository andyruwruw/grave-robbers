/**
 * Fast start, slow finish.
 * @param t Progress, 0..1.
 * @returns The eased progress.
 */
export const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

/**
 * Slow start, fast finish.
 * @param t Progress, 0..1.
 * @returns The eased progress.
 */
export const easeIn = (t: number): number => t * t * t;

/**
 * Slow start and finish.
 * @param t Progress, 0..1.
 * @returns The eased progress.
 */
export const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
