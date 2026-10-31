// Types
import type { Mesh } from 'three';
import type { GearHead } from '../../../types/models';

/**
 * A weapon's head made of some of its boxes, with its middle and size taken
 * from their bounds (each box's own turn is ignored, which is near enough
 * for decorating it). Its edge runs along its longest side and faces out
 * on the next longest, unless told otherwise.
 * @param parts The head's boxes.
 * @param along The axis the edge runs along, if not the longest.
 * @param out The axis the edge faces out on, if not the next longest.
 * @returns The head.
 */
export const headOf = (parts: Mesh[], along?: 0 | 1 | 2, out?: 0 | 1 | 2): GearHead => {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const { position, scale } of parts) {
    const at = [position.x, position.y, position.z];
    const size = [scale.x, scale.y, scale.z];
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], at[i] - size[i] / 2);
      hi[i] = Math.max(hi[i], at[i] + size[i] / 2);
    }
  }
  const size: [number, number, number] = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
  const order = ([0, 1, 2] as const).slice().sort((a: number, b: number): number => size[b] - size[a]);
  const edge = along ?? order[0];
  return {
    center: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2],
    size,
    parts,
    along: edge,
    out: out ?? order.find((axis: 0 | 1 | 2): boolean => axis !== edge)!,
  };
};
