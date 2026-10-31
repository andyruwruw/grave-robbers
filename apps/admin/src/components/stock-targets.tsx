// Packages
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { MAX_REGROWTH_TARGET, REGROWTH_TILES } from '@halloween/shared/world/regrowth';

// Local Imports
import { REGROWTH_LABELS } from '../config/regrowth';

// Types
import type { RegrowthTile } from '@halloween/shared/world/regrowth';

/**
 * Props for the StockTargets component.
 */
interface StockTargetsProps {
  /**
   * How many of each tile the map keeps growing back to.
   */
  targets: Record<RegrowthTile, number>;

  /**
   * How many of each the map has now.
   */
  stocked: Record<RegrowthTile, number>;

  /**
   * Sets one tile's target.
   */
  onTarget: (tile: RegrowthTile, target: number) => void;
}

/**
 * The Manipulate section's regrowth targets: for trees, hedges, pumpkins,
 * chests, and rocks, how many the map has now, and - and + around how many
 * it keeps growing back to (shift steps by 10).
 *
 * @param {StockTargetsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered rows.
 */
function StockTargets({ targets, stocked, onTarget }: StockTargetsProps): React.JSX.Element {
  /**
   * Moves a tile's target a step.
   *
   * @param tile The tile.
   * @param e The click, for shift.
   * @param sign -1 or 1.
   */
  const step = (tile: RegrowthTile, e: React.MouseEvent, sign: number): void => {
    onTarget(tile, Math.max(0, Math.min(MAX_REGROWTH_TARGET, targets[tile] + sign * (e.shiftKey ? 10 : 1))));
  };

  return (
    <div className='flex flex-col gap-xsm'>
      <span className='text-xs text-foreground-muted'>World keeps (shift for 10)</span>
      {REGROWTH_TILES.map((tile: RegrowthTile) => (
        <div
          key={tile}
          className='flex items-center gap-sm'>
          <span className='flex-1 text-sm text-foreground'>{REGROWTH_LABELS[tile]}</span>
          <span
            className='text-xs text-foreground-subtle'
            title='On the map now'>
            {stocked[tile]} now
          </span>
          <button
            type='button'
            aria-label={`Fewer ${REGROWTH_LABELS[tile].toLowerCase()}`}
            disabled={targets[tile] <= 0}
            className='rounded-md border border-border bg-muted p-xsm text-foreground transition-colors hover:bg-background disabled:opacity-50'
            onClick={(e: React.MouseEvent): void => step(tile, e, -1)}>
            <Minus size={12} />
          </button>
          <span className='w-8 text-center text-sm tabular-nums text-foreground'>{targets[tile]}</span>
          <button
            type='button'
            aria-label={`More ${REGROWTH_LABELS[tile].toLowerCase()}`}
            disabled={targets[tile] >= MAX_REGROWTH_TARGET}
            className='rounded-md border border-border bg-muted p-xsm text-foreground transition-colors hover:bg-background disabled:opacity-50'
            onClick={(e: React.MouseEvent): void => step(tile, e, 1)}>
            <Plus size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default StockTargets;
