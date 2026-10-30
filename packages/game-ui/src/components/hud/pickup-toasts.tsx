// Packages
import React from 'react';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { PickupToast } from '../../types/toasts';

/**
 * Props for the PickupToasts component.
 */
interface PickupToastsProps {
  /**
   * The notes showing now.
   */
  toasts: PickupToast[];
}

/**
 * Small pills across the top of the phone naming candy and blood as it
 * comes in, with its icon, so players learn what the orange and red
 * things are.
 *
 * @param {PickupToastsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered toasts.
 */
function PickupToasts({ toasts }: PickupToastsProps): React.JSX.Element {
  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed inset-x-0 top-sm z-50 flex justify-center gap-sm'>
      {toasts.map(({ resource, amount, id }: PickupToast) => (
        <div
          key={id}
          className='toast-pop flex items-center gap-xsm rounded-full border border-border bg-surface py-0.5 pl-xsm pr-md shadow-lg'>
          <ItemIcon
            item={`res:${resource}`}
            size={26} />
          <span className='font-medium text-sm text-foreground'>
            +{amount} {GOODS_LABELS[resource].toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default PickupToasts;
