// Types
import type { LightDef, StructureKind } from './types/structures';

/**
 * Lights ghosts can't snuff out.
 */
export const GHOSTPROOF: ReadonlySet<StructureKind> = new Set<StructureKind>(['ghost-lamp', 'soul-fire', 'obelisk', 'blood-fountain', 'soul-cage']);

/**
 * Fuel a lit light is held at: lights never burn down, so this only marks
 * it lit (a ghost snuffing it sets it to 0, and Action relights it).
 */
export const LIT = 1e9;

/**
 * Fuel a working station's light is held at, enough to shine at full size.
 */
export const WORKING_GLOW = 20;

/**
 * Seconds of fuel below which a light starts shrinking.
 */
export const LOW_FUEL = 15;

/**
 * Permanent glow of a jack-o'-lantern tile.
 */
export const PUMPKIN_LIGHT: LightDef = { radius: 2, burn: Infinity, color: '#ff9a48' };

/**
 * Permanent glow of a lamp post landmark.
 */
export const LAMP_LIGHT: LightDef = { radius: 2.5, burn: Infinity, color: '#ffcf7a' };

/**
 * Candles at a statue's feet and the lantern over a mausoleum door.
 */
export const CANDLE_LIGHT: LightDef = { radius: 1.8, burn: Infinity, color: '#ffb35c' };

/**
 * The light the TV's right mouse button carries around: a wide, steady
 * pool of moonlight, big enough to keep vampires off.
 */
export const CURSOR_LIGHT: LightDef = { radius: 6, burn: Infinity, color: '#d8e6ff' };

/**
 * Light every player carries; too small to keep vampires away.
 */
export const LANTERN_LIGHT: LightDef = { radius: 1.5, burn: Infinity, color: '#ffe2b8' };
