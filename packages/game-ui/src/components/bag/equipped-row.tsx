// Packages
import React from 'react';
import { GEAR_SLOTS } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { SLOT_DEFAULTS, SLOT_LABELS } from '../../config/bag';
import ItemIcon from '../items/item-icon';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { IconKey } from '@halloween/renderer/types/icons';
import type { SlotWhere } from '../../types/bag';

/**
 * Props for the EquippedRow component.
 */
interface EquippedRowProps {
  /**
   * What's equipped.
   */
  equipped: Gear['equipped'];

  /**
   * Draws one slot.
   */
  renderSlot: (where: SlotWhere, item: BagItem | null, fallback: IconKey | null, style?: React.CSSProperties) => React.JSX.Element;
}

/**
 * The three equipped slots (main hand, off hand, armor), each just after a
 * dim grey hand or breastplate.
 *
 * @param {EquippedRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function EquippedRow({ equipped, renderSlot }: EquippedRowProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-md'>
      {GEAR_SLOTS.map((s: GearSlot) => (
        <div
          key={s}
          className='flex items-center gap-0.5'>
          <span
            className='flex shrink-0 items-center justify-center opacity-40'
            title={SLOT_LABELS[s].label}>
            <ItemIcon
              item={SLOT_LABELS[s].icon}
              size={26} />
          </span>
          {renderSlot(s, equipped[s], SLOT_DEFAULTS[s], { width: 'var(--slot)' })}
        </div>
      ))}
    </div>
  );
}

export default EquippedRow;
