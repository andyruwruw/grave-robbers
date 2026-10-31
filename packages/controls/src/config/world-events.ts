// Packages
import { Moon } from 'lucide-react';

// Types
import type { LucideIcon } from 'lucide-react';
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';

/**
 * How each world event's button on the Game tab looks: its icon (and
 * color class), and the TV key that starts it.
 */
export const WORLD_EVENT_BUTTONS: Record<WorldEventKind, { icon: LucideIcon; color: string; key: string }> = {
  'blood-moon': { icon: Moon, color: 'text-danger', key: 'B' },
};
