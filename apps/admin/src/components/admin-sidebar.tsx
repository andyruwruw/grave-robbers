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
 * The admin console's panel, see-through over the world: along the bottom
 * on a narrow screen, down the right on a wide one, scrolling on its own.
 *
 * @param {AdminSidebarProps} props - The panels it holds.
 * @returns {React.JSX.Element} The rendered sidebar.
 */
function AdminSidebar({ children }: AdminSidebarProps): React.JSX.Element {
  return (
    <aside className='scrollbar-none absolute inset-x-0 bottom-0 flex max-h-[60dvh] flex-col gap-lg overflow-y-auto border-t border-border bg-background/85 p-lg backdrop-blur-sm md:inset-x-auto md:bottom-md md:right-md md:top-md md:max-h-none md:w-96 md:rounded-lg md:border'>
      {children}
    </aside>
  );
}

export default AdminSidebar;
