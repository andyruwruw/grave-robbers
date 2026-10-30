// Local Imports
import { SharedBoxFactory } from '../shared-box-factory';

/**
 * Makes every icon's boxes, sharing materials by color, so every icon
 * reuses the same few.
 */
export const iconBox = new SharedBoxFactory(false);
