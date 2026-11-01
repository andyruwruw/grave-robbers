// Packages
import { DEFAULT_PIXEL_LIMIT } from '@halloween/renderer/world/camera/config/camera';

/**
 * The TV's Pixel Size slider: the largest pixel the TV's zoom may grow to,
 * in screen pixels (1 is no pixelation). The default keeps the renderer's
 * own limit.
 */
export const TV_PIXEL_SIZE = { min: 1, max: 6, step: 1, default: DEFAULT_PIXEL_LIMIT };
