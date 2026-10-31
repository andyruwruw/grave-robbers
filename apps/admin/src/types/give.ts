// Types
import type { GiveKind } from '@halloween/shared/protocol/tv-tools';

/**
 * One button on the Give page.
 */
export interface GiveItem {
  /**
   * What it gives (also its icon).
   */
  kind: GiveKind;

  /**
   * Its name.
   */
  label: string;
}

/**
 * One titled card of buttons on the Give page.
 */
export interface GiveSection {
  /**
   * The card's title.
   */
  title: string;

  /**
   * Its buttons, in order.
   */
  items: GiveItem[];
}
