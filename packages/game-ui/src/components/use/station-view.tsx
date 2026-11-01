// Packages
import React from 'react';
import { GOODS } from '@halloween/shared/goods/goods';
import { STATIONS } from '@halloween/shared/structures/stations';

// Local Imports
import StationFlow from '../item-details/station-flow';
import GoodsRow from '../items/goods-row';
import StationOutputSlot from './station-output-slot';
import UseMeter from './use-meter';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { StationPanel } from '@halloween/shared/protocol/state/use-panel';

/**
 * Props for the StationView component.
 */
interface StationViewProps {
  /**
   * The open station.
   */
  panel: StationPanel;

  /**
   * How much of a good the player carries.
   */
  have: (g: Goods) => number;

  /**
   * Feeds it one batch, or as many as fit.
   */
  onFeed: (all: boolean) => void;

  /**
   * Takes what it has made into the bag.
   */
  onCollect: () => void;
}

/**
 * An open station: what it turns into what, its batches (queued out of
 * how many it holds, and how far the current one is), what it has pulled
 * in from piles nearby, what it has made (a slot to tap to collect), and
 * Feed 1 / Feed all from the bag (a quarry takes nothing and works on its
 * own).
 *
 * @param {StationViewProps} props - Component props.
 * @returns {React.JSX.Element} The rendered view.
 */
function StationView({ panel, have, onFeed, onCollect }: StationViewProps): React.JSX.Element {
  const station = STATIONS[panel.station]!;
  const takes = GOODS.some((g: Goods): boolean => station.input[g] > 0);
  const pulled = GOODS.some((g: Goods): boolean => panel.buffer[g] > 0);
  const full = panel.queue >= panel.max;
  const afford = GOODS.every((g: Goods): boolean => have(g) >= station.input[g]);
  const button = 'flex-1 rounded-md border border-border bg-muted px-md py-sm font-medium text-sm text-foreground active:border-brand disabled:opacity-40';
  return (
    <div className='flex w-full max-w-sm flex-col gap-md'>
      <div className='flex justify-center'>
        <StationFlow station={station} />
      </div>
      <UseMeter
        label={`${panel.queue} of ${panel.max} batches`}
        detail={`${Math.round(panel.seconds * 10) / 10}s a batch`}
        filled={panel.queue}
        slots={panel.max}
        progress={panel.queue > 0 ? panel.progress : 0} />
      <StationOutputSlot
        output={station.output}
        made={panel.made}
        hold={panel.hold}
        onCollect={onCollect} />
      {pulled && (
        <div className='flex items-center justify-between gap-sm'>
          <span className='text-[13px] text-foreground-muted'>From piles nearby</span>
          <GoodsRow goods={panel.buffer} />
        </div>
      )}
      {takes ? (
        <div className='flex flex-col gap-xsm'>
          <div className='flex items-center justify-between gap-sm'>
            <span className='text-[13px] text-foreground-muted'>{full ? 'Full' : 'One batch costs'}</span>
            <GoodsRow
              goods={station.input}
              have={have} />
          </div>
          <div className='flex gap-sm'>
            <button
              type='button'
              disabled={full || !afford}
              className={button}
              onClick={(): void => onFeed(false)}>
              Feed 1
            </button>
            <button
              type='button'
              disabled={full || !afford}
              className={button}
              onClick={(): void => onFeed(true)}>
              Feed all
            </button>
          </div>
        </div>
      ) : (
        <span className='text-center text-[13px] text-foreground-muted'>Takes nothing: it works on its own.</span>
      )}
    </div>
  );
}

export default StationView;
