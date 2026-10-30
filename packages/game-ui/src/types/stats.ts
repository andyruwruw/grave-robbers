// Types
import type { ComponentType } from 'react';

/**
 * One stat: an icon, what it is, and how full its bar is (0 to 1).
 */
export interface Stat {
  /**
   * The icon beside its label.
   */
  icon: ComponentType<{ size?: number }>;

  /**
   * What it is.
   */
  label: string;

  /**
   * How full its bar is, 0 to 1.
   */
  fill: number;
}
