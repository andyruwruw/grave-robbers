// Packages
import React from 'react';
import { GOODS } from '@halloween/shared/goods/goods';

// Local Imports
import GoodsRow from '../items/goods-row';
import UseMeter from './use-meter';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { DiggerPanel } from '@halloween/shared/protocol/state/use-panel';

/**
 * Props for the DiggerView component.
 */
interface DiggerViewProps {
  /**
   * The open bone digger.
   */
  panel: DiggerPanel;

  /**
   * Takes what it dug up.
   */
  onCollect: () => void;
}

/**
 * An open bone digger: what it has dug up out of how much it holds, how
 * far its next dig is, and Collect.
 *
 * @param {DiggerViewProps} props - Component props.
 * @returns {React.JSX.Element} The rendered view.
 */
function DiggerView({ panel, onCollect }: DiggerViewProps): React.JSX.Element {
  const held = GOODS.reduce((sum: number, g: Goods): number => sum + panel.hoard[g], 0);
  const full = held >= panel.capacity;
  return (
    <div className='flex w-full max-w-sm flex-col gap-md'>
      <UseMeter
        label={full ? 'Full: collect to keep digging' : `${held} of ${panel.capacity} dug up`}
        detail={`${Math.round(panel.seconds)}s a dig`}
        filled={null}
        slots={0}
        progress={full ? 1 : panel.progress} />
      <div className='flex min-h-[34px] items-center justify-center'>
        {held > 0 ? <GoodsRow goods={panel.hoard} /> : <span className='text-[13px] text-foreground-muted'>Nothing yet</span>}
      </div>
      <button
        type='button'
        disabled={held === 0}
        className='rounded-md border border-border bg-muted px-md py-sm font-medium text-sm text-foreground active:border-brand disabled:opacity-40'
        onClick={onCollect}>
        Collect
      </button>
    </div>
  );
}

export default DiggerView;
