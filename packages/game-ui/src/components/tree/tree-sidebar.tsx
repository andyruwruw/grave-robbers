// Packages
import React from 'react';
import { Lock } from 'lucide-react';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { RESOURCES } from '@halloween/shared/goods/goods';
import { upgradeEffect } from '@halloween/shared/skill-tree/upgrades/upgrade-effects';

// Local Imports
import { lockReason } from '../../helpers/tree-sight';
import ItemIcon from '../items/item-icon';
import TreeLevelPips from './tree-level-pips';

// Types
import type { Resource } from '@halloween/shared/goods/goods';
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
 * The selected node beside the tree: its icon and name, level, what the
 * next level does, and Upgrade; for a locked node, what opens it.
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
  hoverDetails,
  width,
  onUpgrade,
}: TreeSidebarProps): React.JSX.Element {
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
          {seen === 'open' ? (
            <>
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
