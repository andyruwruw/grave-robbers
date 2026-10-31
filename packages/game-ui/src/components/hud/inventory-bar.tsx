// Packages
import React from 'react';
import { RESOURCES, UNLIMITED } from '@halloween/shared/goods/goods';
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

  /**
   * Each icon's size in pixels, and the counts' text size class.
   */
  iconSize?: number;
  textClassName?: string;
}

/**
 * Candy and blood counters (materials live in the bag, and candy and blood
 * are dropped from there too). UNLIMITED (Free crafting) shows as infinite.
 *
 * @param {InventoryBarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function InventoryBar({ inventory, iconSize = 22, textClassName = 'text-sm' }: InventoryBarProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-sm'>
      {RESOURCES.map((r: Resource) => {
        const count = inventory[r] >= UNLIMITED ? '\u221e' : inventory[r];
        return (
          <span
            key={r}
            aria-label={`${GOODS_LABELS[r]}: ${count}`}
            className={`flex items-center gap-1.5 font-medium text-foreground ${textClassName}`}>
            <ItemIcon
              item={`res:${r}`}
              size={iconSize} />
            {count}
          </span>
        );
      })}
    </div>
  );
}

export default InventoryBar;
