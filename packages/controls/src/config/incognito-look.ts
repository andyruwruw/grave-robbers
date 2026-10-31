// Types
import type { IncognitoLook, IncognitoLookRange } from '../types/incognito-look';

/**
 * The Incognito look out of the box: a little darker and punchier than the
 * TV, a heavy mist in its usual shade, and pixels 1.3 times their size.
 */
export const DEFAULT_INCOGNITO_LOOK: IncognitoLook = {
  brightness: 0.8,
  contrast: 1.05,
  pixelation: 1.3,
  fog: 1.6,
  fogShade: 1,
};

/**
 * Formats a value as a whole percent.
 *
 * @param value - The value, 1 for 100%.
 * @returns The percent.
 */
const percent = (value: number): string => `${Math.round(value * 100)}%`;

/**
 * Each Incognito look slider, in the order the Music tab lists them.
 */
export const INCOGNITO_LOOK_RANGES: Record<keyof IncognitoLook, IncognitoLookRange> = {
  brightness: { label: 'Incognito Brightness', min: 0.3, max: 1.6, step: 0.05, readout: percent },
  contrast: { label: 'Incognito Contrast', min: 0.5, max: 1.8, step: 0.05, readout: percent },
  pixelation: { label: 'Incognito Pixelation', min: 1, max: 4, step: 0.1, readout: (value: number): string => `${value.toFixed(1)}x` },
  fog: { label: 'Incognito Fog', min: 0, max: 3, step: 0.1, readout: percent },
  fogShade: { label: 'Incognito Fog Color', min: 0.2, max: 3, step: 0.05, readout: (value: number): string => (value === 1 ? 'Normal' : `${value < 1 ? 'Darker' : 'Lighter'} ${percent(value)}`) },
};
