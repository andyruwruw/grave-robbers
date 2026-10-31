// Packages
import React from 'react';

// Local Imports
import ItemIcon from '../items/item-icon';
import StatGlyph from './stat-glyph';

// Types
import type { IconKey } from '@halloween/renderer/types/icons';
import type { StatIcon } from '../../types/stat-icons';

/**
 * Props for the Trait component.
 */
interface TraitProps {
  /**
   * The trait's 3D icon.
   */
  icon: StatIcon;

  /**
   * An item shown at the end, such as the ammo it takes.
   */
  item?: IconKey;

  /**
   * What it means.
   */
  children: React.ReactNode;
}

/**
 * One line about an item: a little 3D icon, then the trait in words.
 *
 * @param {TraitProps} props - Component props.
 * @returns {React.JSX.Element} The rendered line.
 */
function Trait({ icon, item, children }: TraitProps): React.JSX.Element {
  return (
    <span className='flex items-start gap-1.5 font-medium text-xs leading-snug text-foreground'>
      <StatGlyph icon={icon} />
      <span>{children}</span>
      {item && (
        <ItemIcon
          item={item}
          size={18}
          className='-my-0.5' />
      )}
    </span>
  );
}

export default Trait;
