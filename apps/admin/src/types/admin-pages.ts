// Types
import type { LucideIcon } from 'lucide-react';

/**
 * A page of the admin console: the main menu or one it opens.
 */
export type AdminPageId = 'menu' | 'players' | 'gameplay' | 'spawn' | 'map' | 'catalogue' | 'tree' | 'worlds';

/**
 * One button on the main menu.
 */
export interface AdminPageInfo {
  /**
   * The page it opens.
   */
  id: Exclude<AdminPageId, 'menu'>;

  /**
   * Its name, on the button and as the page's title.
   */
  label: string;

  /**
   * Its icon.
   */
  icon: LucideIcon;

  /**
   * Opens as a dialog over the world instead of in the sidebar (it needs
   * the room).
   */
  wide?: boolean;
}
