/**
 * One box to draw: center, size, color, and whether it ignores light.
 */
export interface Voxel {
  /**
   * Its center.
   */
  pos: [number, number, number];

  /**
   * Its size along each axis.
   */
  size: [number, number, number];

  /**
   * Its color, as #rrggbb.
   */
  color: string;

  /**
   * Whether it glows (drawn at full color whatever the light).
   */
  glow?: boolean;
}

/**
 * A little picture drawn as rows of characters, each character a pixel
 * pushed out into a voxel; `.` is empty.
 */
export interface PixelArt {
  /**
   * The rows, top first.
   */
  rows: string[];

  /**
   * Each character's color.
   */
  colors: Record<string, string>;

  /**
   * Characters that glow.
   */
  glow?: string;
}
