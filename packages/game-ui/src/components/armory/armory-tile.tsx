// Packages
import React from 'react';
import { GEAR } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { ARMORY_TILE_PX } from '../../config/armory';
import { gearIcon } from '../../helpers/gear-icons';
import ItemIcon from '../items/item-icon';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * Props for the ArmoryTile component.
 */
interface ArmoryTileProps {
  /**
   * The weapon.
   */
  kind: GearKind;

  /**
   * Whether the skill tree has unlocked it.
   */
  open: boolean;

  /**
   * Whether the player has one on them (the hammer always).
   */
  carried: boolean;

  /**
   * Whether it's the one picked.
   */
  selected: boolean;

  /**
   * Picks it.
   */
  onClick: () => void;
}

/**
 * One square in the Armory grid: the weapon's model, with a dot when the
 * player has one on them; a locked weapon is only a dark silhouette and
 * can't be picked.
 *
 * @param {ArmoryTileProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tile.
 */
function ArmoryTile({
  kind,
  open,
  carried,
  selected,
  onClick,
}: ArmoryTileProps): React.JSX.Element {
  if (!open) {
    return (
      <span
        aria-label='Locked'
        title='Locked'
        className='flex aspect-square items-center justify-center rounded-[2px] border border-border bg-background'>
        <ItemIcon
          item={gearIcon(kind)}
          size={ARMORY_TILE_PX}
          className='opacity-40 brightness-0' />
      </span>
    );
  }
  return (
    <button
      type='button'
      aria-label={GEAR[kind].label}
      title={GEAR[kind].label}
      aria-pressed={selected}
      className={`relative flex aspect-square items-center justify-center rounded-[2px] border ${selected ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-surface'}`}
      onClick={onClick}>
      <ItemIcon
        item={gearIcon(kind)}
        size={ARMORY_TILE_PX} />
      {carried && <span className='absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-brand' />}
    </button>
  );
}

export default ArmoryTile;
