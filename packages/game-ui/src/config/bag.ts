// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { IconKey } from '@halloween/renderer/types/icons';

/**
 * What an empty equipped slot falls back to, if anything.
 */
export const SLOT_DEFAULTS: Record<GearSlot, IconKey | null> = { weapon: 'hammer', offhand: 'lantern', armor: null };

/**
 * The grey hand or breastplate beside each equipped slot.
 */
export const SLOT_LABELS: Record<GearSlot, { icon: IconKey; label: string }> = {
  weapon: { icon: 'ui:hand-main', label: 'Main hand' },
  offhand: { icon: 'ui:hand-off', label: 'Off hand' },
  armor: { icon: 'ui:armor', label: 'Armor' },
};
