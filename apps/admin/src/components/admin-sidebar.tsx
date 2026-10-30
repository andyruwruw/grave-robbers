// Packages
import React from 'react';

/**
 * Props for AdminSidebar.
 */
interface AdminSidebarProps {
  /**
   * The panels it holds (the follow picker, then the control panel).
   */
  children: React.ReactNode;
}

/**
 * The admin console's sidebar: below the world on a narrow screen, beside
 * it on a wide one, scrolling on its own.
 *
 * @param {AdminSidebarProps} props - The panels it holds.
 * @returns {React.JSX.Element} The rendered sidebar.
 */
function AdminSidebar({ children }: AdminSidebarProps): React.JSX.Element {
  return (
    <aside className='scrollbar-none flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto border-t border-border bg-surface p-lg md:w-96 md:flex-none md:border-l md:border-t-0'>
      {children}
    </aside>
  );
}

export default AdminSidebar;
