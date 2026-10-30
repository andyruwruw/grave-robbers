// Packages
import React from 'react';
import Card from '@halloween/ui/components/ui/primitives/card';

// Types
import type { LucideIcon } from 'lucide-react';

/**
 * Props for the SectionCard component.
 */
interface SectionCardProps {
  /**
   * The header's icon.
   */
  icon: LucideIcon;

  /**
   * The header's title.
   */
  title: string;

  /**
   * The card's body.
   */
  children: React.ReactNode;
}

/**
 * A card with a small icon header.
 *
 * @param {SectionCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function SectionCard({ icon: Icon, title, children }: SectionCardProps): React.JSX.Element {
  return (
    <Card className='flex flex-col'>
      <div className='flex items-center gap-sm border-b border-border px-lg py-sm text-sm font-medium text-foreground'>
        <Icon
          size={14}
          className='text-foreground-muted' />
        {title}
      </div>
      <div className='flex flex-col gap-md px-lg py-md'>{children}</div>
    </Card>
  );
}

export default SectionCard;
