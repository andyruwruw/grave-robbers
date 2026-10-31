// Local Imports
import { BLOOD_MOON } from './kinds/blood-moon';

// Types
import type { WorldEventDef, WorldEventKind } from './types/world-events';

/**
 * Every world event.
 */
export const WORLD_EVENTS: Record<WorldEventKind, WorldEventDef> = {
  'blood-moon': BLOOD_MOON,
};

/**
 * Every world event kind.
 */
export const WORLD_EVENT_KINDS = Object.keys(WORLD_EVENTS) as WorldEventKind[];
