// Packages
import { emptyGear } from '@halloween/shared/inventory/bag-items';
import { MAX_HP } from '@halloween/shared/players/health';

// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';

/**
 * How long (ms) a build error stays up.
 */
export const BUILD_ERROR_MS = 1800;

/**
 * How long a "+6 candy" toast stays up after its last bump.
 */
export const TOAST_MS = 2200;

/**
 * The gear a controller shows before the server sends any.
 */
export const EMPTY_GEAR: Gear = emptyGear();

/**
 * The vitals a controller shows before the server sends any: full health.
 */
export const EMPTY_VITALS: Vitals = { hp: MAX_HP, wounded: 0, healing: 0, protected: false, death: null };
