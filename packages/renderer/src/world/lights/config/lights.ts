// Types
import type { LightDef, StructureKind } from '@halloween/shared/structures/types/structures';

/**
 * Strength of the light a player carries; full strength blows out a bright
 * hood right beside it.
 */
export const PLAYER_LIGHT = 0.75;

/**
 * Pale light a ghost gives off (display only: vampires still treat these
 * tiles as dark). Zombies and vampires light nothing; only their eyes are
 * bright.
 */
export const GHOST_GLOW: LightDef = { radius: 1.8, burn: Infinity, color: '#b8d4ff' };

/**
 * How bright a ghost's glow is.
 */
export const GHOST_GLOW_INTENSITY = 0.3;

/**
 * How deep each kind of light's slow flicker dips (0..1): flames breathe
 * the most, lamp posts barely.
 */
export const FLICKER_DEPTH = { flame: 0.22, pumpkin: 0.14, candle: 0.14, lamp: 0.06, lantern: 0.08 };

/**
 * Flame placement per burning structure: base height and size.
 */
export const FLAME_SHAPES: Partial<Record<StructureKind, { height: number; size: number; dy?: number; blood?: boolean; soul?: boolean }>> = {
  'ghost-lamp': { height: 1.3, size: 0.4, soul: true },
  'soul-fire': { height: 0.14, size: 1.6, soul: true },
  torch: { height: 1.0, size: 0.55 },
  lantern: { height: 1.26, size: 0.36 },
  campfire: { height: 0.12, size: 1.3 },
  furnace: { height: 0.15, size: 0.42, dy: 0.06 },
  bloodforge: { height: 0.15, size: 0.42, dy: 0.04, blood: true },
  altar: { height: 0.74, size: 0.4, dy: -0.06, blood: true },
  cauldron: { height: 0.06, size: 0.5 },
};
