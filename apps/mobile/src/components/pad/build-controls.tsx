// Packages
import React from 'react';
import {
  ArrowLeft,
  Flame,
  Hammer,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { TURNED } from '@halloween/shared/structures/placement';
import BuildError from '@halloween/game-ui/components/hud/build-error';
import ItemIcon from '@halloween/game-ui/components/items/item-icon';

// Local Imports
import DirectionStick from '../sticks/direction-stick';

// Types
import type { BuildItem } from '@halloween/shared/inventory/bag-items';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

/**
 * Props for BuildControls.
 */
interface BuildControlsProps {
  /**
   * What's being built.
   */
  building: BuildItem;

  /**
   * The bag slot it's built from.
   */
  placing: number;

  /**
   * The player's color, for the Turn stick.
   */
  color: string;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * The player's commands.
   */
  commands: PlayerCommands;

  /**
   * Stops building (without going back to the bag).
   */
  onDone: () => void;

  /**
   * Stops building and goes back to the bag.
   */
  onBack: () => void;
}

/**
 * The building strip: what's being built, a Turn stick to face where it
 * should go, rotate buttons for what's placed facing a way (belts and
 * walls), Hold (torches only, to take one in hand instead), Back, and
 * Build. A wall's looks pop up in the corner (`ControllerPad`).
 *
 * @param {BuildControlsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered controls.
 */
function BuildControls({ building, placing, color, buildError, commands, onDone, onBack }: BuildControlsProps): React.JSX.Element {
  return (
    <>
      <div className='flex min-h-0 flex-1 flex-col items-end justify-center gap-sm'>
        <div className='flex items-center gap-sm'>
          <ItemIcon
            item={`build:${building.build}`}
            size={40} />
          <span className='font-medium text-sm leading-tight text-foreground'>
            {itemLabel(`build:${building.build}`)}
            <span className='ml-xsm text-foreground-muted'>x{building.count}</span>
          </span>
        </div>
        <BuildError error={buildError} />
      </div>
      <div className='flex shrink-0 items-end justify-end gap-md'>
        <DirectionStick
          color={color}
          onAim={commands.aim} />
        {TURNED.has(building.build) && (
          <div className='flex flex-col gap-xsm'>
            {([[-1, RotateCcw, 'Rotate left'], [1, RotateCw, 'Rotate right']] as const).map(([dir, Icon, label]) => (
              <button
                key={dir}
                type='button'
                aria-label={label}
                className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-muted text-foreground'
                onClick={(): void => commands.turn(dir)}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        )}
        {building.build === 'torch' && (
          <button
            type='button'
            aria-label='Hold a torch'
            className='flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-medium text-xs text-foreground'
            onClick={(): void => {
              commands.equip(placing);
              onDone();
              commands.buildSelect(null);
              commands.aim(0, 0);
            }}>
            <Flame size={20} />
            HOLD
          </button>
        )}
        <button
          type='button'
          aria-label='Back to the bag'
          className='flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-border bg-muted font-medium text-xs text-foreground-muted'
          onClick={onBack}>
          <ArrowLeft size={20} />
          BACK
        </button>
        <button
          type='button'
          aria-label='Build'
          className='flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-foreground bg-brand-muted font-medium text-[13px] text-foreground'
          onClick={commands.buildPlace}>
          <Hammer size={24} />
          BUILD
        </button>
      </div>
    </>
  );
}

export default BuildControls;
