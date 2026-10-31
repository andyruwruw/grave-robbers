// Local Imports
import { MAX_STYLES } from '../world/ramps';

// Types
import type { StructureKind } from './types/structures';

/**
 * Walls that come in more than one look.
 */
export type StyledWall = 'wood-wall' | 'stone-wall' | 'bone-wall';

/**
 * The looks a player can build each wall in, by name, the plain one first
 * (at most MAX_STYLES). Only how it looks changes: health, cost, and
 * collision are the same. The look is kept in the tile's turn
 * (`turnCode`), and each wall's painter draws them.
 */
export const WALL_STYLES: Record<StyledWall, string[]> = {
  'wood-wall': ['Upright planks', 'Boarded up', 'Stacked logs'],
  'stone-wall': ['Laid brick', 'Fieldstone', 'Crumbling ruin'],
  'bone-wall': ['Packed bones', 'Ribcage', 'Skull pile'],
};

/**
 * The looks a structure comes in.
 * @param kind The structure.
 * @returns Its looks' names (empty if it has only the one).
 */
export function wallStyles(kind: StructureKind): string[] {
  return kind in WALL_STYLES ? WALL_STYLES[kind as StyledWall].slice(0, MAX_STYLES) : [];
}

/**
 * A look kept to the ones a structure has.
 * @param kind The structure.
 * @param style The look asked for.
 * @returns A look it has (0 for one with only the plain look).
 */
export function clampStyle(kind: StructureKind, style: number): number {
  const count = wallStyles(kind).length;
  return count > 0 && Number.isInteger(style) && style >= 0 && style < count ? style : 0;
}
