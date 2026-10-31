// Packages
import React from 'react';
import Card from '@halloween/ui/components/ui/primitives/card';

/**
 * Props for the TitledCard component.
 */
interface TitledCardProps {
  /**
   * The title over the line.
   */
  title: React.ReactNode;

  /**
   * Something on the right of the title row (a count, a badge).
   */
  aside?: React.ReactNode;

  /**
   * Classes for the body below the line (its padding and gaps).
   */
  bodyClassName?: string;

  /**
   * The body.
   */
  children: React.ReactNode;
}

/**
 * A sidebar section: a card whose title sits over a line, with the body
 * below it, like the Players card.
 *
 * @param {TitledCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function TitledCard({
  title,
  aside,
  bodyClassName = 'flex flex-col gap-md px-lg py-md',
  children,
}: TitledCardProps): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex items-center justify-between gap-sm border-b border-border px-lg py-sm'>
        <span className='text-sm font-medium text-foreground'>{title}</span>
        {aside}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}

export default TitledCard;
