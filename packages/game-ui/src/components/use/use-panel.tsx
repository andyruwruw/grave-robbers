// Packages
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { bagCount } from '@halloween/shared/inventory/affordability';
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import PanicButton from '../hud/panic-button';
import ItemIcon from '../items/item-icon';
import DiggerView from './digger-view';
import SorterView from './sorter-view';
import StationView from './station-view';

// Types
import type { Goods, Inventory } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { UsePanel as UsePanelState } from '@halloween/shared/protocol/state/use-panel';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';

/**
 * Props for the UsePanel component.
 */
interface UsePanelProps {
  /**
   * What USE opened.
   */
  panel: UsePanelState;

  /**
   * The player's bag slots (what a station can be fed from).
   */
  bag: readonly (BagItem | null)[];

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The player's skill tree (what a sorter can be told to send).
   */
  tree: TreeState;

  /**
   * Feeds the station one batch, or as many as fit.
   */
  onFeed: (all: boolean) => void;

  /**
   * Takes what the digger dug up.
   */
  onCollect: () => void;

  /**
   * Sends a thing (or nothing) out one side of the sorter.
   */
  onRoute: (side: SortSide, item: SortKey | null) => void;

  /**
   * Closes the panel.
   */
  onClose: () => void;

  /**
   * Makes the player run from monsters close by.
   */
  onPanic?: () => void;
}

/**
 * A bone digger, station, or belt sorter opened with USE, full screen: its
 * icon, name and level (a sorter has none), and what it's doing or where it
 * sends things (see `StationView`, `DiggerView`, `SorterView`). It
 * closes on Back, or when the player walks away from it.
 *
 * @param {UsePanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function UsePanel({ panel, bag, inventory, tree, onFeed, onCollect, onRoute, onClose, onPanic }: UsePanelProps): React.JSX.Element {
  const kind = panel.kind === 'station' ? panel.station : panel.kind;
  /**
   * How much of a good the player carries.
   *
   * @param g - The good.
   * @returns How many.
   */
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(bag, g));
  return (
    <div className='fixed inset-0 z-10 flex flex-col bg-background'>
      <header className='flex items-center gap-sm border-b border-border px-md py-xsm'>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground'
          onClick={onClose}>
          <ArrowLeft size={14} />
          Back
        </button>
        <ItemIcon
          item={`build:${kind}`}
          size={28} />
        <span className='flex-1 font-medium text-sm text-foreground'>
          {STRUCTURES[kind].label}
          {panel.kind !== 'sorter' && <span className='ml-xsm text-foreground-muted'>Lv {panel.level}</span>}
        </span>
        {onPanic && <PanicButton onPanic={onPanic} />}
      </header>
      <div className='flex min-h-0 flex-1 flex-col items-center gap-md overflow-y-auto p-md'>
        {panel.kind === 'digger' ? (
          <DiggerView
            panel={panel}
            onCollect={onCollect} />
        ) : panel.kind === 'sorter' ? (
          <SorterView
            panel={panel}
            tree={tree}
            onRoute={onRoute} />
        ) : (
          <StationView
            panel={panel}
            have={have}
            onFeed={onFeed} />
        )}
      </div>
    </div>
  );
}

export default UsePanel;
