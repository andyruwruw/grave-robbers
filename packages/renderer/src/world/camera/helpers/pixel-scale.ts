// Local Imports
import { PIXEL_REFERENCE_HALF_HEIGHT, PIXEL_SCALE } from '../config/camera';

/**
 * Screen pixels per rendered pixel for a camera this tall: PIXEL_SCALE at
 * the reference framing and grown with the zoom past it (rounded to whole
 * screen pixels), so a pixel covers the same patch of world however close
 * the camera is, but never bigger than `limit`. A limit under PIXEL_SCALE
 * makes every zoom that fine (1 is no pixelation at all).
 * @param halfHeight The camera's half-height in world units.
 * @param limit The largest a pixel may get, in screen pixels.
 * @returns The pixel scale.
 */
export const pixelScaleFor = (halfHeight: number, limit: number): number => {
  const locked = halfHeight > 0 ? Math.max(PIXEL_SCALE, Math.round((PIXEL_SCALE * PIXEL_REFERENCE_HALF_HEIGHT) / halfHeight)) : PIXEL_SCALE;
  return Math.max(1, Math.min(limit, locked));
};
