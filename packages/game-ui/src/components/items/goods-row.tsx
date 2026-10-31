// Packages
import React from 'react';
import { GOODS, MATERIALS } from '@halloween/shared/goods/goods';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { partCount } from '@halloween/shared/inventory/affordability';
import { itemLabel } from '@halloween/shared/inventory/item-keys';

// Local Imports
import HoverLabel from './hover-label';
import ItemIcon from './item-icon';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Bundle, Goods, Material } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';

/**
 * Props for the GoodsRow component.
 */
interface GoodsRowProps {
  /**
   * How much of each good.
   */
  goods: Bundle;

  /**
   * How much of a good the player carries, to dim what's short.
   */
  have?: (g: Goods) => number;

  /**
   * Gear built in (a bolt turret's crossbow), one kind per piece.
   */
  parts?: readonly GearKind[];

  /**
   * The bag, to dim parts the player doesn't carry (plain pieces only).
   */
  bag?: readonly (BagItem | null)[];
}

/**
 * A row of goods: each one's icon (or color for candy and blood) and count,
 * then any gear built in, red where the player doesn't carry enough.
 *
 * @param {GoodsRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function GoodsRow({ goods, have, parts = [], bag }: GoodsRowProps): React.JSX.Element {
  return (
    <span className='flex flex-wrap items-center gap-1.5'>
      {GOODS.filter((g: Goods): boolean => goods[g] > 0).map((g: Goods) => (
        <HoverLabel
          key={g}
          label={GOODS_LABELS[g]}
          className={`flex items-center gap-0.5 font-medium text-sm ${have && have(g) < goods[g] ? 'text-status-error-foreground' : 'text-foreground'}`}>
          <ItemIcon
            item={(MATERIALS as Goods[]).includes(g) ? `mat:${g as Material}` : `res:${g as 'candy' | 'blood'}`}
            size={26} />
          {goods[g]}
        </HoverLabel>
      ))}
      {[...new Set(parts)].map((kind: GearKind) => {
        const need = parts.filter((k: GearKind): boolean => k === kind).length;
        return (
          <HoverLabel
            key={kind}
            label={`${itemLabel(`gear:${kind}`)} (in your bag, used up)`}
            className={`flex items-center gap-0.5 font-medium text-sm ${bag && partCount(bag, kind) < need ? 'text-status-error-foreground' : 'text-foreground'}`}>
            <ItemIcon
              item={`gear:${kind}`}
              size={26} />
            {need}
          </HoverLabel>
        );
      })}
    </span>
  );
}

export default GoodsRow;
