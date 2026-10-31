// Packages
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

// Types
import type { LucideIcon } from 'lucide-react';

/**
 * Props for the PageHeader component.
 */
interface PageHeaderProps {
  /**
   * The page's title.
   */
  title: string;

  /**
   * The page's icon, beside its title.
   */
  icon: LucideIcon;

  /**
   * Goes back to the main menu (none on the menu itself).
   */
  onBack?: () => void;

  /**
   * Closes the panel (or the dialog).
   */
  onClose: () => void;
}

/**
 * The outlined card at the top of every admin page, a shade lighter than
 * the menu's buttons and the cards below: a back button to the main menu, the page's icon and
 * title, and a close button.
 *
 * @param {PageHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function PageHeader({ title, icon: Icon, onBack, onClose }: PageHeaderProps): React.JSX.Element {
  return (
    <div className='flex min-h-11 shrink-0 items-center gap-sm rounded-lg border border-border bg-muted px-md py-sm'>
      {onBack && (
        <button
          type='button'
          aria-label='Back'
          className='rounded-md p-xsm text-foreground-muted transition-colors hover:bg-muted hover:text-foreground'
          onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
      )}
      <Icon
        size={16}
        className='shrink-0 text-foreground-muted' />
      <span className='flex-1 text-sm font-medium text-foreground'>{title}</span>
      <button
        type='button'
        aria-label='Close'
        className='rounded-md p-xsm text-foreground-muted transition-colors hover:bg-muted hover:text-foreground'
        onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}

export default PageHeader;
