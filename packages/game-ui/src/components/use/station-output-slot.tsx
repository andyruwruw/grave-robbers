// Packages
import React from 'react';
import { GOODS, MATERIALS } from '@halloween/shared/goods/goods';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { Bundle, Goods, Material } from '@halloween/shared/goods/goods';

/**
 * Props for the StationOutputSlot component.
 */
interface StationOutputSlotProps {
  /**
   * What the station makes.
   */
  output: Bundle;

  /**
   * What it has made and is holding.
   */
  made: Bundle;

  /**
   * How much it holds before it stops.
   */
  hold: number;

  /**
   * Takes what it holds into the bag.
   */
  onCollect: () => void;
}

/**
 * A station's output slot: what it makes, as a bag-style slot showing how
 * many it holds out of its limit. Tapping it collects them.
 *
 * @param {StationOutputSlotProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slot.
 */
function StationOutputSlot({ output, made, hold, onCollect }: StationOutputSlotProps): React.JSX.Element {
  const goods = GOODS.find((g: Goods): boolean => output[g] > 0) ?? 'stone';
  const count = GOODS.reduce((sum: number, g: Goods): number => sum + made[g], 0);
  const full = count >= hold;
  const label = GOODS_LABELS[goods];
  return (
    <button
      type='button'
      disabled={count === 0}
      aria-label={`Collect ${count} ${label}`}
      className='flex items-center gap-md rounded-md border border-border bg-muted p-sm text-left active:border-brand disabled:active:border-border'
      onClick={onCollect}>
      <span className={`relative flex size-14 shrink-0 items-center justify-center rounded-[2px] border ${count > 0 ? 'border-brand bg-surface' : 'border-border bg-background'}`}>
        <ItemIcon
          item={(MATERIALS as Goods[]).includes(goods) ? `mat:${goods as Material}` : `res:${goods as 'candy' | 'blood'}`}
          size={40}
          className={count > 0 ? '' : 'opacity-30'} />
        <span className='absolute bottom-0 right-0.5 font-medium text-xs text-foreground'>{count}</span>
      </span>
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='font-medium text-sm text-foreground'>{`${count} of ${hold} ${label}`}</span>
        <span className={`text-[13px] ${full ? 'text-status-error-foreground' : 'text-foreground-muted'}`}>
          {count === 0 ? 'Nothing made yet' : full ? 'Full: collect to keep working' : 'Tap to collect'}
        </span>
      </span>
    </button>
  );
}

export default StationOutputSlot;
