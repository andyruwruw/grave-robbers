// Types
import type { BoxFactory } from '../../../../types/models';
import type { ColorRemap } from '../types/variant-shape';

/**
 * Wraps a box factory so palette colors come out restyled (an infusion's
 * metal turned to obsidian, gold, or ectoplasm), leaving the builders
 * themselves unchanged.
 * @param box The factory to wrap.
 * @param remap What each palette color turns into.
 * @returns The wrapped factory.
 */
export const remapBox = (box: BoxFactory, remap: ColorRemap): BoxFactory => (size, pos, color, glow, opacity) => {
  const to = remap[color];
  return to ? box(size, pos, to.color, to.glow ?? glow, to.opacity ?? opacity) : box(size, pos, color, glow, opacity);
};
