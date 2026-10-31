// Types
import type { StatColor, StatIcon } from './stat-icons';

/**
 * One stat: an icon, what it is, its bar's color (the same for that stat on
 * every item), and how full its bar is (0 to 1).
 */
export interface Stat {
  /**
   * The icon beside its label.
   */
  icon: StatIcon;

  /**
   * Its bar's color.
   */
  color: StatColor;

  /**
   * What it is.
   */
  label: string;

  /**
   * How full its bar is, 0 to 1.
   */
  fill: number;
}
