/**
 * Built things a vampire smashes through when they're in its way (dark
 * ones only; walls still stop it), and its damage per blow.
 */
export const VAMPIRE_SMASHES: ReadonlySet<string> = new Set(['door', 'wood-fence']);

/**
 * A vampire's damage per blow to what it smashes through.
 */
export const VAMPIRE_WALL_DAMAGE = 3;
