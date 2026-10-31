// Types
import type { IconKey } from '@halloween/renderer/types/icons';
import type { StatIcon } from './stat-icons';

/**
 * One line under an item's Traits: an icon, what it means in words, and
 * maybe an item it's about (the ammo it takes).
 */
export interface TraitLine {
  /**
   * The trait's icon.
   */
  icon: StatIcon;

  /**
   * What it means, as a sentence.
   */
  text: string;

  /**
   * An item shown with it, such as the ammo.
   */
  item?: IconKey;
}
