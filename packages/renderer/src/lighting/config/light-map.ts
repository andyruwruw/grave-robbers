/**
 * Light-map resolution; the low count plus quantized levels gives the light
 * pools hard, pixel-art bands. Levels are spaced on a square-root curve, so
 * the dark end has fine steps (a dim, tinted ambient survives) and bright
 * pool centers have coarse ones.
 */
export const TEXELS_PER_TILE = 4;

/**
 * The most tiles the light map covers at once; a bigger map gets a window
 * this big that follows the camera (`setCenter`).
 */
export const WINDOW_TILES_W = 80;

/**
 * The most tiles tall the light map covers at once (see WINDOW_TILES_W).
 */
export const WINDOW_TILES_H = 60;

/**
 * How many brightness levels the light map is cut into (see
 * TEXELS_PER_TILE).
 */
export const LEVELS = 16;

/**
 * Stored values are scaled down by this so lights can brighten past 1.
 */
export const LIGHT_RANGE = 4;

/**
 * Moonlit darkness everywhere no light reaches.
 */
export const AMBIENT = [0.12, 0.14, 0.24];

/**
 * Ambient darkness under a blood moon.
 */
export const BLOOD_AMBIENT = [0.26, 0.09, 0.12];

/**
 * Ambient light in broad daylight (the Game tab's daytime).
 */
export const DAY_AMBIENT = [2.2, 2.15, 1.95];

/**
 * How much of lights' glow daylight washes out.
 */
export const DAY_DIM = 0.85;

/**
 * Peak brightness added at a light's center.
 */
export const LIGHT_STRENGTH = 3.2;
