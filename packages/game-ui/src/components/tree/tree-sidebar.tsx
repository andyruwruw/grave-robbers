// Packages
import React from 'react';
import { Lock } from 'lucide-react';
import { RECIPES, craftCost, recipeParts } from '@halloween/shared/crafting/recipes';
import { RESOURCES } from '@halloween/shared/goods/goods';
import { bagCount } from '@halloween/shared/inventory/affordability';
import { itemBlurb } from '@halloween/shared/inventory/item-blurbs';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { upgradeEffect } from '@halloween/shared/skill-tree/upgrades/upgrade-effects';

// Local Imports
import { recipeOf } from '../../helpers/recipes';
import { lockReason } from '../../helpers/tree-sight';
import GoodsRow from '../items/goods-row';
import ItemIcon from '../items/item-icon';
import TreeLevelPips from './tree-level-pips';

// Types
import type { Goods, Inventory, Resource } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { NodeId, TreeNode } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Seen } from '../../types/tree';

/**
 * Props for the TreeSidebar component.
 */
interface TreeSidebarProps {
  /**
   * The selected node's id.
   */
  selected: NodeId;

  /**
   * The selected node.
   */
  node: TreeNode;

  /**
   * How much of it shows.
   */
  seen: Seen;

  /**
   * Its level.
   */
  level: number;

  /**
   * What its next level costs, null when maxed.
   */
  cost: Record<Resource, number> | null;

  /**
   * Whether the player can pay for the upgrade now.
   */
  can: boolean;

  /**
   * Candy and blood carried, for what crafting it costs.
   */
  inventory: Inventory;

  /**
   * The bag, whose material stacks pay for crafting.
   */
  bag: readonly (BagItem | null)[];

  /**
   * Mouse and keyboard mode: no hold hint, and Upgrade sits at the bottom.
   */
  hoverDetails: boolean;

  /**
   * The sidebar's width in pixels.
   */
  width: number;

  /**
   * Upgrades a node.
   */
  onUpgrade: (node: NodeId) => void;
}

/**
 * The selected node beside the tree: its icon and name, what it is
 * (`itemBlurb`), what one costs to craft (what's short in red, before any
 * anvil), level, what the next level does, and Upgrade; for a
 * material (`fixed`), where it comes from instead; for a locked node, what
 * opens it.
 *
 * @param {TreeSidebarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered sidebar.
 */
function TreeSidebar({
  selected,
  node,
  seen,
  level,
  cost,
  can,
  inventory,
  bag,
  hoverDetails,
  width,
  onUpgrade,
}: TreeSidebarProps): React.JSX.Element {
  const recipe = recipeOf(selected as ItemKey);
  const craftable = recipe !== null && RECIPES.includes(recipe);
  /**
   * How many of a good the player has, from the wallet or the bag.
   * @param g The good.
   * @returns The count.
   */
  const have = (g: Goods): number => (g === 'candy' || g === 'blood' ? inventory[g] : bagCount(bag, g));
  return (
    <aside
      className='flex shrink-0 flex-col gap-sm p-sm'
      style={{ width }}>
      {seen !== 'open' && seen !== 'locked' ? null : (
        <>
          <div className='flex items-center gap-1.5'>
            <ItemIcon
              item={selected}
              size={30}
              className={seen === 'open' ? '' : 'opacity-60 blur-[3px]'} />
            <span className='font-medium text-sm leading-tight text-foreground'>{seen === 'open' ? itemLabel(selected) : '?'}</span>
          </div>
          {seen === 'open' && node.fixed ? (
            <>
              <span className='text-xs leading-relaxed text-foreground-muted'>{itemBlurb(selected)}</span>
              {node.unlock.by === 'upgrade' && <span className='font-medium text-xs leading-relaxed text-foreground-muted'>{`Comes with the ${itemLabel(node.unlock.from)}. Nothing to upgrade.`}</span>}
            </>
          ) : seen === 'open' ? (
            <>
              <span className='text-xs leading-relaxed text-foreground-muted'>{itemBlurb(selected)}</span>
              {craftable && (
                <div className='flex flex-col gap-0.5'>
                  <span className='font-medium text-[11px] text-foreground-subtle'>To craft</span>
                  <GoodsRow
                    goods={craftCost(recipe, null)}
                    have={have}
                    parts={recipeParts(recipe)}
                    bag={bag} />
                </div>
              )}
              <TreeLevelPips
                level={level}
                width='w-full' />
              {cost !== null && (
                <span className='font-medium text-xs leading-relaxed text-foreground-muted'>
                  Next level:
                  {' '}
                  {upgradeEffect(selected)}
                </span>
              )}
              {!hoverDetails && <span className='mt-auto font-medium text-[11px] leading-relaxed text-foreground-subtle'>Hold a node for details</span>}
              <button
                type='button'
                disabled={!can}
                aria-label={cost === null ? 'Maxed' : `Upgrade for ${cost.candy} candy and ${cost.blood} blood`}
                className={`flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted py-1 font-medium text-[13px] text-foreground transition-opacity disabled:opacity-40 ${hoverDetails ? 'mt-auto' : ''}`}
                onClick={(): void => onUpgrade(selected)}>
                {cost === null ? 'MAX' : (
                  <>
                    Upgrade
                    {RESOURCES.map((r: Resource) => (
                      <span
                        key={r}
                        className='flex items-center gap-0.5'>
                        <ItemIcon
                          item={`res:${r}`}
                          size={16} />
                        {cost[r]}
                      </span>
                    ))}
                  </>
                )}
              </button>
            </>
          ) : (
            <span className='flex items-center gap-1.5 font-medium text-xs leading-tight text-foreground-muted'>
              <Lock
                size={10}
                className='shrink-0' />
              {lockReason(node)}
            </span>
          )}
        </>
      )}
    </aside>
  );
}

export default TreeSidebar;
