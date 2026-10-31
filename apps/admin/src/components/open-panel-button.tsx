// Packages
import React from 'react';

// Local Imports
import { MENU_ICON, MENU_TITLE } from '../config/admin-pages';

/**
 * Props for the OpenPanelButton component.
 */
interface OpenPanelButtonProps {
  /**
   * Brings the panel back.
   */
  onOpen: () => void;
}

/**
 * The button in the corner that brings the closed admin panel back.
 *
 * @param {OpenPanelButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function OpenPanelButton({ onOpen }: OpenPanelButtonProps): React.JSX.Element {
  const Icon = MENU_ICON;
  return (
    <button
      type='button'
      className='absolute right-md top-md flex items-center gap-sm rounded-lg border border-border bg-background/85 px-md py-sm text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted'
      onClick={onOpen}>
      <Icon
        size={16}
        className='text-foreground-muted' />
      {MENU_TITLE}
    </button>
  );
}

export default OpenPanelButton;
