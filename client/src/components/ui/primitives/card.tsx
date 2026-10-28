// Packages
import React from 'react';

/**
 * Props for the glass Card component.
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
 * glass Card: a translucent pane. Structurally different from the base card
 * in that it carries a 1px top sheen line (a centered highlight fading out
 * to both edges, the source's "inner refraction") above a translucent fill
 * with an inset top highlight. Deliberately NOT backdrop-blurred: cards live
 * in scrolling content, and the source restricts blur to fixed layers. Over
 * glass's PageLayout aurora the orbs show through tinted; elsewhere it reads
 * as a faint raised pane.
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
    ? 'cursor-pointer transition-colors duration-300 hover:border-[var(--arw-glass-sheen)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
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
      className={`relative overflow-hidden rounded-lg border border-[var(--arw-glass-edge)] bg-[var(--arw-glass-pane)] shadow-[shadow:var(--arw-glass-highlight)] ${hasHat ? 'rounded-t-none border-t-0' : ''} ${clickableClasses} ${className}`.trim()}
      {...(clickable && { role: 'button', tabIndex: 0, onClick, onKeyDown: handleKeyDown })}>
      {!hasHat && (
        <span
          className='pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--arw-glass-sheen)] to-transparent'
          aria-hidden='true' />
      )}
      {children}
    </div>
  );
}

export default Card;
