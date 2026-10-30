// Packages
import React from 'react';

/**
 * Props for the PageLayout component.
 */
interface PageLayoutProps {
  /**
   * Page content.
   */
  children: React.ReactNode;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * Standard page shell: centered, max-width, padded. Every routed page
 * wraps its content in this (see the list-page example).
 *
 * @param {PageLayoutProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page shell.
 */
function PageLayout({
  children,
  className = '',
}: PageLayoutProps): React.JSX.Element {
  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${className}`.trim()}>
      {children}
    </div>
  );
}

export default PageLayout;
