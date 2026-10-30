// Packages
import React from 'react';

// Local Imports
import { NODE } from '../../config/tree';
import { TREE_LAYOUT } from '../../tree/tree-layout';
import ItemDetails from '../item-details/item-details';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Seen } from '../../types/tree';

/**
 * Props for the TreeHoverCard component.
 */
interface TreeHoverCardProps {
  /**
   * The node the mouse rests on.
   */
  hovered: NodeId;

  /**
   * How much of each node shows.
   */
  seens: Map<NodeId, Seen>;

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The bag, for the details' costs.
   */
  bag: readonly (BagItem | null)[];
}

/**
 * The hovered node's details, beside it: to its right, or to its left past
 * the middle of the tree.
 *
 * @param {TreeHoverCardProps} props - Component props.
 * @returns {React.JSX.Element} The rendered card.
 */
function TreeHoverCard({
  hovered,
  seens,
  tree,
  inventory,
  bag,
}: TreeHoverCardProps): React.JSX.Element {
  const at = TREE_LAYOUT.position.get(hovered)!;
  const flip = at.col > TREE_LAYOUT.hoverFlipCol;
  return (
    <div
      className='pointer-events-none absolute z-30 w-[300px]'
      style={{ top: TREE_LAYOUT.top(at.row), left: flip ? TREE_LAYOUT.centerX(at.col) - NODE / 2 - 8 : TREE_LAYOUT.centerX(at.col) + NODE / 2 + 8, transform: flip ? 'translateX(-100%)' : undefined }}>
      <ItemDetails
        inline
        item={hovered}
        mystery={seens.get(hovered) !== 'open'}
        tree={tree}
        inventory={inventory}
        bag={bag} />
    </div>
  );
}

export default TreeHoverCard;
