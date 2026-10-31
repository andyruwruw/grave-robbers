// Local Imports
import { MAX_TURN_SPEED } from '../../avatars/player/config/player-turn';
import { DEFAULT_STYLE } from '../../effects/post/config/post';

// Types
import type { DisplayNumber, DisplaySettings } from '../../types/display-settings';

/**
 * How the game is drawn out of the box: every value is what the game did
 * before these became settings. The TV's camera elevation (55 degrees);
 * /play overrides it with its own (see `displayDefaults`).
 */
export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  brightness: 1,
  contrast: 1,
  details: 1,
  viewAngle: 55,
  glow: DEFAULT_STYLE.glow,
  aberration: DEFAULT_STYLE.aberration,
  fog: DEFAULT_STYLE.fog,
  fogShade: 1,
  shake: 1,
  turnSpeed: MAX_TURN_SPEED,
  blood: 1,
  showResources: true,
  showNames: true,
  showMyName: true,
  showHealthBars: true,
  showMyHealthBar: true,
  showTps: false,
  showFps: false,
  showServerTicks: false,
};

/**
 * Each numeric setting's range and step. Brightness tops out at 1.3 so the
 * night can't be turned into day.
 */
export const DISPLAY_RANGES: Record<DisplayNumber, { min: number; max: number; step: number }> = {
  brightness: { min: 0.6, max: 1.3, step: 0.05 },
  contrast: { min: 0.6, max: 1.4, step: 0.05 },
  details: { min: 0, max: 2, step: 0.1 },
  viewAngle: { min: 35, max: 75, step: 1 },
  glow: { min: 0, max: 1, step: 0.05 },
  aberration: { min: 0, max: 1, step: 0.05 },
  fog: { min: 0, max: 1, step: 0.05 },
  fogShade: { min: 0.2, max: 3, step: 0.05 },
  shake: { min: 0, max: 1, step: 0.05 },
  turnSpeed: { min: 4, max: 40, step: 1 },
  blood: { min: 0, max: 1, step: 0.05 },
};

/**
 * A display's defaults with its own differences (/play's lower camera).
 * @param overrides What this display does differently.
 * @returns The defaults.
 */
export const displayDefaults = (overrides: Partial<DisplaySettings> = {}): DisplaySettings => ({ ...DEFAULT_DISPLAY_SETTINGS, ...overrides });
