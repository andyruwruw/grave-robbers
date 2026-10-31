// Packages
import React from 'react';

/**
 * Props for SubsectionTitle.
 */
interface SubsectionTitleProps {
  /**
   * The subsection's name.
   */
  title: string;
}

/**
 * A small heading over a group of settings within a tab, with a rule
 * running out beside it.
 *
 * @param {SubsectionTitleProps} props - Component props.
 * @returns {React.JSX.Element} The rendered heading.
 */
function SubsectionTitle({ title }: SubsectionTitleProps): React.JSX.Element {
  return (
    <div className='mt-sm flex items-center gap-sm'>
      <span className='font-semibold text-[11px] text-foreground-muted uppercase tracking-wider'>{title}</span>
      <span className='h-px flex-1 bg-border' />
    </div>
  );
}

export default SubsectionTitle;
