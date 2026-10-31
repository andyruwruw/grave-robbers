// Packages
import { DEFAULT_DISPLAY_SETTINGS } from '@halloween/renderer/world/config/display-settings';

// Types
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';

/**
 * The phone's display settings, like every display's (the defaults, with
 * no menu to change them). The phone draws no world, so only Show
 * candies & blood applies, to the counts in its top bar
 * (`PadHeader`); the rest is kept for when the phone draws more.
 */
export const PHONE_DISPLAY: DisplaySettings = DEFAULT_DISPLAY_SETTINGS;
