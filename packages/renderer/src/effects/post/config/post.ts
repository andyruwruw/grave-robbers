// Types
import type { StyleSettings } from '../../../types/effects';

/**
 * Objects on this layer skip the bloom: they're drawn at full brightness
 * after it, so tiny bright details (monster eyes) stay crisp pixels instead
 * of glowing orbs.
 */
export const NO_BLOOM_LAYER = 1;

/**
 * The TV's look before its sidebar changes anything.
 */
export const DEFAULT_STYLE: StyleSettings = { focus: 0.5, vibrance: 0.05, glow: 0.75, aberration: 0.3, fog: 0.5 };

/**
 * Bloom only picks up pixels brighter than this (linear luminance).
 */
export const BLOOM_THRESHOLD = 0.3;

/**
 * How far the bloom spreads.
 */
export const BLOOM_RADIUS = 0.5;

/**
 * Bloom strength at full Glow.
 */
export const MAX_BLOOM_STRENGTH = 1.6;

/**
 * Focus falls off between these distances from a player, as a fraction of
 * screen height.
 */
export const FOCUS_INNER = 0.1;

/**
 * Where the focus falloff ends (see FOCUS_INNER).
 */
export const FOCUS_OUTER = 0.45;

/**
 * At full Focus, how dark (multiplier) and how desaturated (0..1) the map
 * gets far from every player. Kept gentle: the night is already dark.
 */
export const FOCUS_DIM = 0.55;

/**
 * How desaturated the map gets far from every player (see FOCUS_DIM).
 */
export const FOCUS_DESATURATE = 0.3;

/**
 * Color fringe shift at full Aberration, in screen uv.
 */
export const MAX_ABERRATION = 0.012;

/**
 * Extra saturation at full Vibrance.
 */
export const MAX_SATURATION_BOOST = 0.4;

/**
 * How much of the bloom daylight washes out.
 */
export const DAY_BLOOM_CUT = 0.95;
