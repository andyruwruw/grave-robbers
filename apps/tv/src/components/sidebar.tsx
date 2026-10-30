// Packages
import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * Props for Sidebar.
 */
interface SidebarProps {
  /**
   * Whether it's open.
   */
  open: boolean;

  /**
   * Opens or closes it.
   */
  onOpen: (open: boolean) => void;

  /**
   * What it holds.
   */
  children: React.ReactNode;
}

/**
 * The TV's sidebar: a chevron that appears when hovering the top-right
 * corner opens it, and clicking outside it while it's open closes it.
 *
 * @param {SidebarProps} props - Whether it's open, and what it holds.
 * @returns {React.JSX.Element} The rendered sidebar.
 */
function Sidebar({ open, onOpen, children }: SidebarProps): React.JSX.Element {
  return (
    <>
      <div className='group absolute right-0 top-0 flex h-20 w-20 items-start justify-end p-sm'>
        <button
          type='button'
          aria-label='Open sidebar'
          className='rounded-md p-xsm text-foreground-muted opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100'
          onClick={(): void => onOpen(true)}>
          <ChevronLeft size={20} />
        </button>
      </div>
      {open && (
        <div
          className='absolute inset-0'
          onPointerDown={(): void => onOpen(false)} />
      )}
      <aside
        className={`absolute inset-y-0 right-0 scrollbar-none flex w-96 flex-col gap-lg overflow-y-auto border-l border-border bg-surface p-lg transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}>
        {children}
      </aside>
    </>
  );
}

export default Sidebar;
