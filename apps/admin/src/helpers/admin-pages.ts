// Local Imports
import { ADMIN_PAGES, MENU_ICON, MENU_TITLE } from '../config/admin-pages';

// Types
import type { LucideIcon } from 'lucide-react';
import type { AdminPageId, AdminPageInfo } from '../types/admin-pages';

/**
 * A page's title, its icon, and whether it opens as a dialog.
 *
 * @param page The page.
 * @returns Its title, icon, and width.
 */
export function pageInfo(page: AdminPageId): { title: string; icon: LucideIcon; wide: boolean } {
  const info = ADMIN_PAGES.find((p: AdminPageInfo): boolean => p.id === page);
  return { title: info?.label ?? MENU_TITLE, icon: info?.icon ?? MENU_ICON, wide: !!info?.wide };
}
