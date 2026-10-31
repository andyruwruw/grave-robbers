// Local Imports
import { JUST_NOW_MS, RELATIVE_MS } from '../config/worlds';

// Types
import type { WorldSlotInfo } from '@halloween/shared/saves/world-slots';

/**
 * A slot's map size, "256 x 256", or "New" before its first save.
 *
 * @param slot The slot.
 * @returns The size to show.
 */
export const slotSize = (slot: WorldSlotInfo): string => (slot.width === 0 ? 'New' : `${slot.width} x ${slot.height}`);

/**
 * When a slot was last saved: "never", "just now", minutes or hours ago
 * within a day, or the local date and time after that.
 *
 * @param savedAt When it was saved (ms since the epoch), or 0.
 * @param now The time now (ms since the epoch).
 * @returns The time to show.
 */
export const savedAgo = (savedAt: number, now: number): string => {
  if (savedAt === 0) {
    return 'never';
  }
  const ago = now - savedAt;
  if (ago < JUST_NOW_MS) {
    return 'just now';
  }
  if (ago < 60 * 60_000) {
    return `${Math.floor(ago / 60_000)} min ago`;
  }
  if (ago < RELATIVE_MS) {
    return `${Math.floor(ago / (60 * 60_000))} h ago`;
  }
  return new Date(savedAt).toLocaleString();
};
