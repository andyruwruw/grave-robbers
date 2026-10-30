// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';

/**
 * What the build preview shows: the structure, whether it can go there,
 * and the box (tile-space center, ground height, width and height) around
 * whatever is in the way, if anything.
 */
export interface PlacePreview {
  /**
   * The structure being placed.
   */
  kind: StructureKind;

  /**
   * Whether it can go on the facing tile.
   */
  valid: boolean;

  /**
   * The box around whatever is in the way, or null when nothing is.
   */
  blocker: {
    /**
     * Tile-space center x.
     */
    x: number;

    /**
     * Tile-space center y.
     */
    y: number;

    /**
     * Ground height it stands on.
     */
    base: number;

    /**
     * Width, in tiles.
     */
    w: number;

    /**
     * Height, in world units.
     */
    h: number;
  } | null;
}
