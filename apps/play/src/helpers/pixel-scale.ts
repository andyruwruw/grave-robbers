// Local Imports
import {
  PIXEL_SIZE_FAR,
  ZOOM_MAX,
  ZOOM_MIN,
} from '../config/bindings';

/**
 * How many screen pixels each rendered pixel takes at a zoom: the Pixel
 * size setting at the closest zoom, easing in a straight line to
 * PIXEL_SIZE_FAR at the farthest, rounded to whole screen pixels.
 *
 * @param zoom - Tiles of ground shown top to bottom.
 * @param closest - The pixel size at the closest zoom.
 * @returns The pixel size.
 */
export const playPixelScale = (zoom: number, closest: number): number => {
  const out = (Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN);
  return Math.max(1, Math.round(closest + (PIXEL_SIZE_FAR - closest) * out));
};
