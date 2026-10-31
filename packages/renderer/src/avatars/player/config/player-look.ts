// Packages
import { Color } from 'three';

/**
 * The haze around a player slowed by ectoplasm: a green tint, a flicker,
 * and wisps circling them.
 */
export const HAZE_COLOR = new Color('#45ffb0');

/**
 * How many wisps circle a slowed player.
 */
export const HAZE_WISPS = 6;

/**
 * How fast the haze comes and goes, per second.
 */
export const HAZE_FADE = 4;

/**
 * A player's skin.
 */
export const SKIN = '#e9d3b4';

/**
 * A player's eyes, and what the cloak is darkened toward.
 */
export const DARK = '#15151b';

/**
 * A player's trousers.
 */
export const TROUSERS = '#2a2a33';

/**
 * A player's boots.
 */
export const BOOT = '#1c1611';

/**
 * A player's belt.
 */
export const BELT = '#3b2a1c';

/**
 * A player's belt buckle.
 */
export const BUCKLE = '#c9a94a';

/**
 * What a player's tunic is muted toward.
 */
export const TUNIC = '#3a3340';

/**
 * Overall character scale relative to a tile.
 */
export const AVATAR_SCALE = 1.3;

/**
 * Screen-anchor height for the name label, in world units.
 */
export const LABEL_HEIGHT = 1.12 * AVATAR_SCALE;

/**
 * A charged gauntlet's glow.
 */
export const CHARGE_GLOW = '#ffb347';

/**
 * The health bar's fill.
 */
export const HEALTH_FILL = '#e5484d';

/**
 * The health bar's fresh-wound part (not healable yet), hatched with
 * WOUND_STRIPE.
 */
export const WOUND_FILL = '#8a2430';

/**
 * The dark hatching across the health bar's fresh-wound part.
 */
export const WOUND_STRIPE = '#2a0a10';

