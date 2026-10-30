// Packages
import React, { useState } from 'react';
import { wearsOut } from '@halloween/shared/gear/gear-catalog';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemKey, itemLabel } from '@halloween/shared/inventory/item-keys';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';
import { useHold } from '@halloween/ui/hooks/use-hold';

// Local Imports
import { useBagPicker } from '../../hooks/use-bag-picker';
import ItemDetails from '../item-details/item-details';
import BagHintBar from './bag-hint-bar';
import BagSlot from './bag-slot';
import EquippedRow from './equipped-row';

// Types
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { IconKey } from '@halloween/renderer/types/icons';
import type { BagActions } from '../../hooks/use-bag-picker';
import type { SlotWhere } from '../../types/bag';

/**
 * Props for the BagPanel component.
 */
interface BagPanelProps extends BagActions {
  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * Candy and blood carried (for item details).
   */
  inventory: Inventory;

  /**
   * The player's skill tree, for how long a fresh piece of gear lasts.
   */
  tree: TreeState;

  /**
   * A fixed slot size (a CSS length), packing as many to a row as fit;
   * without it the bag is six slots to a row across the panel.
   */
  slotSize?: string;
}

/**
 * The bag: the equipped slots (main hand, off hand, armor, each just
 * after a dim grey hand or breastplate) and the bag slots below, all
 * square icons the same size. Tapping a stack of
 * structures starts building it right away. Tap anything else to pick it
 * up, then tap another slot to move it there (onto a matching stack, or
 * swapping places; gear can go into its own equipped slot), or tap it again
 * to use it: equip or put away gear, or drink a tonic. While something is
 * picked up a Drop button appears, which throws it onto the tile in front.
 * Holding any item shows its details.
 *
 * @param {BagPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered panel.
 */
function BagPanel({
  gear,
  inventory,
  tree,
  onEquip,
  onDrink,
  onUnequip,
  onMove,
  onDropItem,
  onPlace,
  slotSize,
}: BagPanelProps): React.JSX.Element {
  const [details, setDetails] = useState<BagItem | null>(null);
  const hold = useHold<BagItem | null>((item: BagItem | null): void => {
    if (item) {
      setDetails(item);
    }
  });
  const { picked, tapSlot, drop, tone } = useBagPicker(gear, hold.tapped, { onEquip, onDrink, onUnequip, onMove, onDropItem, onPlace });

  /**
   * Draws one slot.
   *
   * @param where - A bag index or an equipped slot.
   * @param item - What's in it.
   * @param fallback - The icon an empty slot shows, if any.
   * @param style - Extra inline styles.
   * @returns The slot.
   */
  const slot = (where: SlotWhere, item: BagItem | null, fallback: IconKey | null, style?: React.CSSProperties): React.JSX.Element => (
    <BagSlot
      key={String(where)}
      icon={item ? itemKey(item) : fallback}
      filled={!!item}
      label={item ? itemLabel(itemKey(item)) : 'Empty'}
      count={item && !isGearItem(item) ? item.count : null}
      wear={item && isGearItem(item) && wearsOut(item.kind) ? item.wear / gearWear(item.kind, tree) : null}
      tone={tone(where, item)}
      hold={hold.bind(item)}
      onTap={(): void => tapSlot(where)}
      style={style} />
  );

  return (
    <div
      className='flex w-full flex-col gap-xsm [container-type:inline-size]'
      style={{ '--slot': slotSize ?? 'calc((100cqw - 1.25rem) / 6)' } as React.CSSProperties}>
      <EquippedRow
        equipped={gear.equipped}
        renderSlot={slot} />
      <div
        className='grid w-full gap-1'
        style={{ gridTemplateColumns: slotSize ? 'repeat(auto-fill, var(--slot))' : 'repeat(6, minmax(0, 1fr))' }}>
        {gear.bag.map((item: BagItem | null, i: number) => slot(i, item, null))}
      </div>
      <BagHintBar
        picked={picked !== null}
        onDrop={drop} />
      {details && (
        <ItemDetails
          item={itemKey(details)}
          held={details}
          tree={tree}
          inventory={inventory}
          bag={gear.bag}
          onClose={(): void => setDetails(null)} />
      )}
    </div>
  );
}

export default BagPanel;
