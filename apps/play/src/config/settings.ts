// Packages
import { LEAD_EASE, PLAY_FOLLOW_LEAD } from '@halloween/renderer/world/camera/config/camera';
import { displayDefaults } from '@halloween/renderer/world/config/display-settings';

// Local Imports
import { MENU_SIZES } from './bindings';

// Types
import type { DisplayFlag } from '@halloween/renderer/types/display-settings';
import type { SettingsTab } from '../types/play';

/**
 * How /play draws the world out of the box: the shared defaults with its
 * own lower camera (47 degrees, so it looks a bit more across the ground).
 */
export const PLAY_DISPLAY_DEFAULTS = displayDefaults({ viewAngle: 47 });

/**
 * The Settings menu's tabs, top to bottom, with each one's name.
 */
export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'graphics', label: 'Graphics' },
  { id: 'controls', label: 'Controls' },
  { id: 'audio', label: 'Audio' },
];

/**
 * The smallest UI scale.
 */
export const UI_SCALE_MIN = MENU_SIZES.small;

/**
 * The largest UI scale.
 */
export const UI_SCALE_MAX = MENU_SIZES.large;

/**
 * How far one UI scale step goes.
 */
export const UI_SCALE_STEP = 0.05;

/**
 * The UI scale a new /play screen starts with (the old small menu size).
 */
export const UI_SCALE_DEFAULT = MENU_SIZES.small;

/**
 * The Camera lead setting's range and step, as a share of half the ground
 * in view.
 */
export const CAMERA_LEAD_RANGE = { min: 0, max: 0.5, step: 0.05 };

/**
 * The Camera lead a new /play screen starts with.
 */
export const CAMERA_LEAD_DEFAULT = PLAY_FOLLOW_LEAD;

/**
 * The Camera lead a /play screen started with before it was lowered: a
 * save from then still holding it gets the new default instead.
 */
export const CAMERA_LEAD_OLD_DEFAULT = 0.35;

/**
 * The Camera lead speed setting's range and step: how fast the lead swings
 * round to a new facing, per second (see LEAD_EASE).
 */
export const CAMERA_LEAD_SPEED_RANGE = { min: 0.25, max: 5, step: 0.25 };

/**
 * The Camera lead speed a new /play screen starts with.
 */
export const CAMERA_LEAD_SPEED_DEFAULT = LEAD_EASE;

/**
 * The sound effects volume's range and step.
 */
export const SFX_VOLUME_RANGE = { min: 0, max: 1, step: 0.05 };

/**
 * The sound effects volume a new /play screen starts with (the sfx
 * engine's own default).
 */
export const SFX_VOLUME_DEFAULT = 0.8;

/**
 * The Graphics tab's switches, in order, with each one's name.
 */
export const DISPLAY_SWITCHES: { key: DisplayFlag; label: string }[] = [
  { key: 'showResources', label: 'Show candies & blood' },
  { key: 'showNames', label: 'Show names' },
  { key: 'showMyName', label: 'Show my name' },
  { key: 'showHealthBars', label: 'Show health bars' },
  { key: 'showMyHealthBar', label: 'Show my health bar' },
  { key: 'showTps', label: 'Show TPS' },
  { key: 'showFps', label: 'Show FPS' },
  { key: 'showServerTicks', label: 'Show server ticks' },
];
