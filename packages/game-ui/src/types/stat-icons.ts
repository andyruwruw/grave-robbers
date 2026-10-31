// Types
import type { STAT_COLORS, STAT_ICONS } from '../config/stat-icons';

/**
 * One pre-rendered stat or trait icon.
 */
export type StatIcon = typeof STAT_ICONS[number];

/**
 * One stat bar color, the same for that stat on every item.
 */
export type StatColor = typeof STAT_COLORS[number];
