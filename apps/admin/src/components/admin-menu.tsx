// Packages
import React from 'react';

// Local Imports
import { ADMIN_PAGES } from '../config/admin-pages';

// Types
import type { AdminPageId, AdminPageInfo } from '../types/admin-pages';

/**
 * Props for the AdminMenu component.
 */
interface AdminMenuProps {
  /**
   * Opens a page.
   */
  onOpen: (page: AdminPageId) => void;
}

/**
 * The admin console's main menu: a button with an icon and a name for
 * each page (`ADMIN_PAGES`).
 *
 * @param {AdminMenuProps} props - Component props.
 * @returns {React.JSX.Element} The rendered menu.
 */
function AdminMenu({ onOpen }: AdminMenuProps): React.JSX.Element {
  return (
    <nav className='flex flex-col gap-sm'>
      {ADMIN_PAGES.map(({ id, label, icon: Icon }: AdminPageInfo) => (
        <button
          key={id}
          type='button'
          className='flex items-center gap-md rounded-lg border border-border bg-surface px-lg py-md text-left text-sm font-medium text-foreground transition-colors hover:bg-muted'
          onClick={(): void => onOpen(id)}>
          <Icon
            size={18}
            className='text-foreground-muted' />
          {label}
        </button>
      ))}
    </nav>
  );
}

export default AdminMenu;
