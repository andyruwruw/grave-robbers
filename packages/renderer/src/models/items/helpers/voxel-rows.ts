// Local Imports
import { iconBox } from '../icon-box';

// Types
import type { Mesh } from 'three';

/**
 * How one character of a voxel picture is drawn.
 */
export interface VoxelCell {
  /**
   * Its color.
   */
  color: string;

  /**
   * How deep the box is, front to back.
   */
  depth: number;

  /**
   * Whether it glows (unlit).
   */
  glow?: boolean;
}

/**
 * A flat voxel picture from rows of characters (top to bottom, `.` for
 * empty), one box per character, centered on the origin.
 * @param rows The picture's rows.
 * @param cells How each character is drawn.
 * @param cell The size of one cell.
 * @returns The boxes.
 */
export const voxelRows = (rows: string[], cells: Record<string, VoxelCell>, cell: number): Mesh[] => {
  const midX = (rows[0].length - 1) / 2;
  const midY = (rows.length - 1) / 2;
  return rows.flatMap((row: string, r: number): Mesh[] => [...row].flatMap((c: string, x: number): Mesh[] => {
    const look = cells[c];
    return look ? [iconBox.box([cell, cell, look.depth], [(x - midX) * cell, (midY - r) * cell, 0], look.color, look.glow)] : [];
  }));
};
