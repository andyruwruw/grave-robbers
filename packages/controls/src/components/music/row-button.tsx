// Packages
import React from 'react';

/**
 * Props for the RowButton component.
 */
interface RowButtonProps {
  /**
   * What the button does, for screen readers.
   */
  label: string;

  /**
   * Whether it's greyed out.
   */
  disabled?: boolean;

  /**
   * Called on a click.
   */
  onClick: () => void;

  /**
   * The icon.
   */
  children: React.ReactNode;
}

/**
 * A small square icon button for the up-next rows.
 *
 * @param {RowButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function RowButton({
  label,
  disabled,
  onClick,
  children,
}: RowButtonProps): React.JSX.Element {
  return (
    <button
      type='button'
      aria-label={label}
      disabled={disabled}
      className='flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
      onClick={onClick}>
      {children}
    </button>
  );
}

export default RowButton;
