// Packages
import React from 'react';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemKey, itemLabel } from '@halloween/shared/inventory/item-keys';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';

/**
 * Props for the StashSide component.
 */
interface StashSideProps {
  /**
   * The heading.
   */
  title: string;

  /**
   * The side's slots.
   */
  items: readonly (BagItem | null)[];

  /**
   * Called with a tapped slot's index.
   */
  onTap: (index: number) => void;
}

/**
 * One side of the chest page: a titled 4x4 grid of slots; tapping a
 * filled one sends it across.
 *
 * @param {StashSideProps} props - Component props.
 * @returns {React.JSX.Element} The rendered side.
 */
function StashSide({ title, items, onTap }: StashSideProps): React.JSX.Element {
  return (
    <div className='flex min-w-0 flex-1 flex-col gap-xsm'>
      <span className='font-medium text-[13px] text-foreground-muted'>{title}</span>
      <div className='grid grid-cols-4 gap-1'>
        {items.map((item: BagItem | null, i: number) => (
          <button
            key={i}
            type='button'
            disabled={!item}
            aria-label={item ? itemLabel(itemKey(item)) : 'Empty'}
            className={`relative flex aspect-square items-center justify-center rounded-[2px] border ${item ? 'border-border bg-surface active:border-brand' : 'border-border bg-background'}`}
            onClick={(): void => onTap(i)}>
            {item && (
              <ItemIcon
                item={itemKey(item)}
                size={34} />
            )}
            {item && !isGearItem(item) && <span className='absolute bottom-0 right-0.5 font-medium text-xs text-foreground'>{item.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StashSide;
