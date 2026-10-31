// Types
import type { Panel } from '../types/pad';

/**
 * How big bag slots are with a TV controller held: small enough that the
 * equipped row and at least 2.5 bag rows fit under the top bar.
 */
export const BAG_SLOT_SIZE = 'min(56px, calc((100dvh - 96px) / 3.8))';

/**
 * The panel toggles, in order, with their names.
 */
export const PANEL_TABS = [['bag', 'Bag'], ['craft', 'Craft'], ['armory', 'Armory'], ['tree', 'Skill tree']] as const satisfies readonly (readonly [Panel, string])[];
