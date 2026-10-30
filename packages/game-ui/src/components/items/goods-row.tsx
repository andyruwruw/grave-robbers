// Packages
import React from 'react';
import { GOODS, MATERIALS } from '@halloween/shared/goods/goods';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';

// Local Imports
import ItemIcon from './item-icon';

// Types
import type { Bundle, Goods, Material } from '@halloween/shared/goods/goods';

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
}

/**
 * A row of goods: each one's icon (or color for candy and blood) and count,
 * dimmed where the player doesn't carry enough.
 *
 * @param {GoodsRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function GoodsRow({ goods, have }: GoodsRowProps): React.JSX.Element {
  return (
    <span className='flex items-center gap-1.5'>
      {GOODS.filter((g: Goods): boolean => goods[g] > 0).map((g: Goods) => (
        <span
          key={g}
          title={GOODS_LABELS[g]}
          className={`flex items-center gap-0.5 font-medium text-sm ${have && have(g) < goods[g] ? 'text-status-error-foreground' : 'text-foreground'}`}>
          <ItemIcon
            item={(MATERIALS as Goods[]).includes(g) ? `mat:${g as Material}` : `res:${g as 'candy' | 'blood'}`}
            size={26} />
          {goods[g]}
        </span>
      ))}
    </span>
  );
}

export default GoodsRow;
