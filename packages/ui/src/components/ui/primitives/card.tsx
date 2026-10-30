// Packages
import React from 'react';

/**
 * Props for the Card component.
 */
interface CardProps {
  /**
   * Card content.
   */
  children?: React.ReactNode;

  /**
   * Removes the top radius/border to sit flush under a `Toolbar hat`.
   */
  hasHat?: boolean;

  /**
   * When set, makes the card clickable with button semantics.
   */
  onClick?: () => void;

  /**
   * Optional extra class names: pass padding/divide classes here.
   */
  className?: string;
}

/**
 * Elevated surface container.
 *
 * @param {CardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function Card({
  children,
  hasHat = false,
  onClick,
  className = '',
}: CardProps): React.JSX.Element {
  const clickable = onClick !== undefined;
  const clickableClasses = clickable
    ? 'cursor-pointer transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    : '';

  /**
   * Fires onClick for Enter/Space keys.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`bg-surface border border-border rounded-lg ${hasHat ? 'rounded-t-none border-t-0' : ''} ${clickableClasses} ${className}`.trim()}
      {...(clickable && { role: 'button', tabIndex: 0, onClick, onKeyDown: handleKeyDown })}>
      {children}
    </div>
  );
}

export default Card;
