// Packages
import React, { useEffect, useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import {
  DROP_AMOUNT,
  GOODS_LABELS,
  RESOURCES,
} from '@halloween/shared/items';
import {
  GEAR_SLOTS,
  isBuildItem,
  isGearItem,
  isMaterialItem,
  itemKey,
  itemLabel,
} from '@halloween/shared/gear';
import { gearWear } from '@halloween/shared/tree';

// Local Imports
import { useHold } from '../../../hooks/use-hold';
import ItemDetails from './item-details';
import ItemIcon from './item-icon';

// Types
import type {
  BagItem,
  Gear,
  GearSlot,
} from '@halloween/shared/gear';
import type { Inventory, Resource } from '@halloween/shared/items';
import type { TreeState } from '@halloween/shared/tree';
import type { HoldProps } from '../../../hooks/use-hold';
import type { IconKey } from '../../display/renderer/item-models';

/**
 * What an empty equipped slot falls back to, if anything.
 */
const SLOT_DEFAULTS: Record<GearSlot, IconKey | null> = { weapon: 'wood-axe', offhand: 'lantern', armor: null };

/**
 * What's picked up: a bag or equipped slot, or a pouch of candy or blood.
 */
type Picked = { from: GearSlot | number } | { resource: Resource };

/**
 * Props for the BagPanel component.
 */
interface BagPanelProps {
  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The player's skill tree, for how long a fresh piece of gear lasts.
   */
  tree: TreeState;

  /**
   * Equips the gear in a bag slot.
   */
  onEquip: (bag: number) => void;

  /**
   * Drinks a tonic from a bag slot.
   */
  onDrink: (bag: number) => void;

  /**
   * Moves an equipped item back into the bag.
   */
  onUnequip: (slot: GearSlot) => void;

  /**
   * Moves an item to another slot (stacking or swapping).
   */
  onMove: (from: GearSlot | number, to: GearSlot | number) => void;

  /**
   * Throws an item (bag index or equipped slot) onto the facing tile.
   */
  onDropItem: (from: GearSlot | number) => void;

  /**
   * Throws a handful of candy or blood onto the facing tile.
   */
  onDropResource: (resource: Resource) => void;

  /**
   * Starts building from a stack of structures (previewed on the TV).
   */
  onPlace: (bag: number) => void;
}

/**
 * Props for one slot.
 */
interface SlotProps {
  icon: IconKey | null;
  filled: boolean;
  label: string;
  count: number | null;
  wear: number | null;
  tone: 'picked' | 'equipped' | 'plain';
  hold: HoldProps;
  onTap: () => void;
}

/**
 * One square slot: the item's icon, with a bar for how much use a piece of
 * gear has left or a count for a stack.
 *
 * @param {SlotProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slot.
 */
function Slot({
  icon,
  filled,
  label,
  count,
  wear,
  tone,
  hold,
  onTap,
}: SlotProps): React.JSX.Element {
  const border = tone === 'picked' ? 'border-brand bg-brand-muted ring-1 ring-brand' : tone === 'equipped' ? 'border-brand bg-surface' : filled ? 'border-border bg-surface' : 'border-border bg-background';
  return (
    <button
      type='button'
      aria-label={label}
      className={`relative flex aspect-square items-center justify-center rounded-[2px] border ${border}`}
      {...hold}
      onClick={onTap}>
      {icon && (
        <ItemIcon
          item={icon}
          size={36}
          className={filled ? '' : 'opacity-30'} />
      )}
      {count !== null && <span className='absolute bottom-0 right-0.5 font-pixel text-[7px] text-foreground'>{count}</span>}
      {wear !== null && (
        <span className='absolute inset-x-1 bottom-0.5 h-0.5 bg-background'>
          <span
            className='block h-full bg-foreground-muted'
            style={{ width: `${Math.min(100, wear * 100)}%` }} />
        </span>
      )}
    </button>
  );
}

/**
 * The bag: the equipped slots (weapon, off-hand, armor), candy and blood,
 * and the bag slots below, all square icons. Tapping a stack of
 * structures starts building it right away. Tap anything else to pick it
 * up, then tap another slot to move it there (onto a matching stack, or
 * swapping places; gear can go into its own equipped slot), or tap it again
 * to use it: equip or put away gear, or drink a tonic. While something is
 * picked up a drop slot appears, which throws it onto the tile in front
 * (candy and blood a handful at a time). Holding any item shows its
 * details.
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
  onDropResource,
  onPlace,
}: BagPanelProps): React.JSX.Element {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [details, setDetails] = useState<BagItem | null>(null);
  const hold = useHold<BagItem | null>((item: BagItem | null): void => {
    if (item) {
      setDetails(item);
    }
  });

  const itemAt = (where: GearSlot | number): BagItem | null => (typeof where === 'number' ? gear.bag[where] : gear.equipped[where]);
  const pickedItem = picked && 'from' in picked ? itemAt(picked.from) : null;

  useEffect(() => {
    if (picked && 'from' in picked && !pickedItem) {
      setPicked(null);
    }
    if (picked && 'resource' in picked && inventory[picked.resource] === 0) {
      setPicked(null);
    }
  }, [picked, pickedItem, inventory]);

  const use = (where: GearSlot | number, item: BagItem): void => {
    if (typeof where === 'string') {
      onUnequip(where);
    } else if (isBuildItem(item)) {
      onPlace(where);
    } else if (isMaterialItem(item) && item.material === 'tonic') {
      onDrink(where);
    } else if (isGearItem(item)) {
      onEquip(where);
    }
  };

  const tapSlot = (where: GearSlot | number): void => {
    if (!hold.tapped()) {
      return;
    }
    const item = itemAt(where);
    if (typeof where === 'number' && item && isBuildItem(item) && !(picked && 'from' in picked && picked.from !== where)) {
      setPicked(null);
      onPlace(where);
      return;
    }
    if (picked && 'from' in picked) {
      if (picked.from === where) {
        if (item) {
          use(where, item);
        }
      } else {
        onMove(picked.from, where);
      }
      setPicked(null);
      return;
    }
    setPicked(item ? { from: where } : null);
  };

  const tapResource = (resource: Resource): void => {
    if (inventory[resource] === 0) {
      return;
    }
    setPicked(picked && 'resource' in picked && picked.resource === resource ? null : { resource });
  };

  const drop = (): void => {
    if (!picked) {
      return;
    }
    if ('resource' in picked) {
      onDropResource(picked.resource);
      return;
    }
    onDropItem(picked.from);
    setPicked(null);
  };

  const tone = (where: GearSlot | number, item: BagItem | null): SlotProps['tone'] => {
    if (picked && 'from' in picked && picked.from === where) {
      return 'picked';
    }
    return typeof where === 'string' && item ? 'equipped' : 'plain';
  };

  const slot = (where: GearSlot | number, item: BagItem | null, fallback: IconKey | null): React.JSX.Element => (
    <Slot
      key={String(where)}
      icon={item ? itemKey(item) : fallback}
      filled={!!item}
      label={item ? itemLabel(itemKey(item)) : 'Empty'}
      count={item && !isGearItem(item) ? item.count : null}
      wear={item && isGearItem(item) ? item.wear / gearWear(item.kind, tree) : null}
      tone={tone(where, item)}
      hold={hold.bind(item)}
      onTap={(): void => tapSlot(where)} />
  );

  return (
    <div className='flex w-full flex-col gap-xsm'>
      <div className='grid w-full grid-cols-6 gap-1'>
        {GEAR_SLOTS.map((s: GearSlot) => slot(s, gear.equipped[s], SLOT_DEFAULTS[s]))}
        {RESOURCES.map((r: Resource) => (
          <Slot
            key={r}
            icon={`res:${r}`}
            filled={inventory[r] > 0}
            label={`${GOODS_LABELS[r]}: ${inventory[r]}`}
            count={inventory[r]}
            wear={null}
            tone={picked && 'resource' in picked && picked.resource === r ? 'picked' : 'plain'}
            hold={{}}
            onTap={(): void => tapResource(r)} />
        ))}
        {picked ? (
          <button
            type='button'
            aria-label={'resource' in picked ? `Drop ${DROP_AMOUNT} ${GOODS_LABELS[picked.resource].toLowerCase()}` : 'Drop it'}
            className='flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[2px] border border-dashed border-status-warning-foreground bg-background font-pixel text-[6px] text-status-warning-foreground'
            onClick={drop}>
            <ArrowDownToLine size={16} />
            DROP
          </button>
        ) : <span />}
        {gear.bag.map((item: BagItem | null, i: number) => slot(i, item, null))}
      </div>
      <span className='font-pixel text-[6px] leading-relaxed text-foreground-subtle'>
        {picked ? 'Tap a slot to move it there, tap it again to use it' : 'Tap an item to pick it up, hold one for details'}
      </span>
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
