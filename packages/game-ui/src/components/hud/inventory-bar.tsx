// Packages
import React from 'react';
import { RESOURCES } from '@halloween/shared/goods/goods';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { Inventory, Resource } from '@halloween/shared/goods/goods';

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
          className='flex items-center gap-1.5 font-medium text-sm text-foreground'>
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
