// Packages
import React from 'react';
import { GOODS_LABELS } from '@halloween/shared/items';

// Local Imports
import ItemIcon from './item-icon';

// Types
import type { Resource } from '@halloween/shared/items';

/**
 * One "+6 candy" note: what was gained, how much (added up while it shows),
 * and an id that changes with each bump so it pops again.
 */
export interface PickupToast {
  resource: Resource;
  amount: number;
  id: number;
}

/**
 * Props for the PickupToasts component.
 */
interface PickupToastsProps {
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
          className='toast-pop flex items-center gap-xsm rounded-full border border-[var(--arw-glass-edge)] bg-[var(--arw-glass-pane)] py-0.5 pl-xsm pr-md shadow-lg backdrop-blur-md'>
          <ItemIcon
            item={`res:${resource}`}
            size={26} />
          <span className='font-pixel text-[10px] text-foreground'>
            +{amount} {GOODS_LABELS[resource].toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default PickupToasts;
