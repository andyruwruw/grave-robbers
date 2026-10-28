// Packages
import React from 'react';
import { GOODS_LABELS, RESOURCES } from '@halloween/shared/items';

// Local Imports
import ItemIcon from './item-icon';

// Types
import type { Inventory, Resource } from '@halloween/shared/items';

/**
 * Props for the InventoryBar component.
 */
interface InventoryBarProps {
  /**
   * What the player carries.
   */
  inventory: Inventory;
}

/**
 * Candy and blood counters (materials live in the bag, and candy and blood
 * are dropped from there too).
 *
 * @param {InventoryBarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function InventoryBar({ inventory }: InventoryBarProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-sm'>
      {RESOURCES.map((r: Resource) => (
        <span
          key={r}
          aria-label={`${GOODS_LABELS[r]}: ${inventory[r]}`}
          className='flex items-center gap-1 font-pixel text-[10px] text-foreground'>
          <ItemIcon
            item={`res:${r}`}
            size={22} />
          {inventory[r]}
        </span>
      ))}
    </div>
  );
}

export default InventoryBar;
