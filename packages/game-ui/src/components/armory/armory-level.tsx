// Packages
import React from 'react';
import { Check } from 'lucide-react';

// Local Imports
import { ARMORY_LEVEL_PX } from '../../config/armory';
import GoodsRow from '../items/goods-row';
import ItemIcon from '../items/item-icon';
import InfuseButton from './infuse-button';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { IconKey } from '@halloween/renderer/types/icons';
import type { LevelState } from '../../types/armory';

/**
 * Props for the ArmoryLevel component.
 */
interface ArmoryLevelProps {
  /**
   * Its model.
   */
  icon: IconKey;

  /**
   * Its name.
   */
  name: string;

  /**
   * The prefix under its name, if it has one.
   */
  prefix: string | null;

  /**
   * What it does.
   */
  blurb: string;

  /**
   * Whether it's the one shown at the top.
   */
  previewed: boolean;

  /**
   * Shows it at the top.
   */
  onPreview: () => void;

  /**
   * What infusing it costs at the anvil in reach (none for the plain
   * weapon).
   */
  cost?: Bundle;

  /**
   * How much of a good the player carries.
   */
  have?: (g: Goods) => number;

  /**
   * Whether it's owned, can be infused, or why not (none for the plain
   * weapon).
   */
  state?: LevelState;

  /**
   * Infuses it.
   */
  onInfuse?: () => void;
}

/**
 * One card in the Armory's paths: a button with the level's model, name,
 * and prefix that shows it at the top, then what it does, and (for an
 * infusion) a tick once it's owned and its cost against what's carried and
 * Infuse while there's gear to infuse (or none owned yet).
 *
 * @param {ArmoryLevelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function ArmoryLevel({
  icon,
  name,
  prefix,
  blurb,
  previewed,
  onPreview,
  cost,
  have,
  state,
  onInfuse,
}: ArmoryLevelProps): React.JSX.Element {
  return (
    <div className={`flex flex-col gap-1.5 rounded-[2px] border p-xsm ${previewed ? 'border-brand bg-brand-muted' : 'border-border bg-surface'}`}>
      <button
        type='button'
        aria-pressed={previewed}
        className='flex items-center gap-sm text-left'
        onClick={onPreview}>
        <ItemIcon
          item={icon}
          size={ARMORY_LEVEL_PX} />
        <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <span className='font-medium text-[13px] leading-tight text-foreground'>{name}</span>
          {prefix && <span className='font-medium text-xs leading-tight text-brand'>{prefix}</span>}
        </span>
        {state?.owned && <Check size={16} className='shrink-0 text-status-success-foreground' />}
      </button>
      <span className='text-xs leading-snug text-foreground-muted'>{blurb}</span>
      {cost && state && (!state.owned || state.from !== null) && (
        <div className='flex items-center gap-sm border-t border-border pt-1.5'>
          <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
            <GoodsRow
              goods={cost}
              have={have} />
            {state.note && <span className='text-xs leading-tight text-foreground-subtle'>{state.note}</span>}
          </span>
          <InfuseButton
            ready={state.ready}
            onInfuse={(): void => onInfuse?.()} />
        </div>
      )}
    </div>
  );
}

export default ArmoryLevel;
