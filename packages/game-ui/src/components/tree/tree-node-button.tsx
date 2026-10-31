// Packages
import React from 'react';
import { Lock } from 'lucide-react';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { levelOf } from '@halloween/shared/skill-tree/progress';

// Local Imports
import { NODE, REVEAL_SECONDS } from '../../config/tree';
import { TREE_LAYOUT } from '../../tree/tree-layout';
import ItemIcon from '../items/item-icon';
import TreeLevelPips from './tree-level-pips';

// Types
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { HoldProps } from '@halloween/ui/hooks/use-hold';
import type { Placed, Seen } from '../../types/tree';

/**
 * Props for the TreeNodeButton component.
 */
interface TreeNodeButtonProps {
  /**
   * The node and where it sits.
   */
  placed: Placed;

  /**
   * How much of it shows.
   */
  seen: Seen;

  /**
   * Whether it's the node in the sidebar.
   */
  selected: boolean;

  /**
   * The player's skill tree, for its level.
   */
  tree: TreeState;

  /**
   * Mouse and keyboard mode: details on hover instead of a long press.
   */
  hoverDetails: boolean;

  /**
   * The long-press handlers (none with `hoverDetails`).
   */
  hold: HoldProps | Record<string, never>;

  /**
   * Starts the hover wait for a node.
   */
  onHover: (id: NodeId) => void;

  /**
   * Cancels the hover wait.
   */
  onUnhover: () => void;

  /**
   * Called on a click.
   */
  onClick: () => void;
}

/**
 * One node of the tree: its icon when open, a question mark (with a lock
 * when locked) otherwise, and its level pips; hidden until it's in sight.
 *
 * @param {TreeNodeButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function TreeNodeButton({
  placed,
  seen,
  selected,
  tree,
  hoverDetails,
  hold,
  onHover,
  onUnhover,
  onClick,
}: TreeNodeButtonProps): React.JSX.Element {
  const { node: n, col, row } = placed;
  const visible = seen === 'open' || seen === 'locked';
  return (
    <button
      type='button'
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={seen === 'open' ? itemLabel(n.id) : 'Unknown'}
      aria-pressed={selected}
      className={`absolute flex items-center justify-center rounded-[2px] border bg-surface ${visible ? '' : 'pointer-events-none'} ${selected ? 'border-brand ring-1 ring-brand' : 'border-border'}`}
      style={{ left: TREE_LAYOUT.centerX(col) - NODE / 2, top: TREE_LAYOUT.top(row), width: NODE, height: NODE, opacity: visible ? 1 : 0, transition: `opacity ${REVEAL_SECONDS}s` }}
      {...hold}
      onPointerEnter={(e: React.PointerEvent): void => {
        if (hoverDetails && e.pointerType === 'mouse' && visible) {
          onHover(n.id);
        }
      }}
      onPointerLeave={onUnhover}
      onClick={onClick}>
      {seen === 'open' ? (
        <ItemIcon
          item={n.id}
          size={38} />
      ) : (
        <span className='font-medium text-lg text-foreground-subtle'>?</span>
      )}
      {seen === 'locked' && (
        <Lock
          size={9}
          className='absolute right-0.5 top-0.5 text-foreground-muted' />
      )}
      {seen === 'open' && !n.fixed && (
        <span className='absolute -bottom-2.5 inset-x-1 rounded-[1px] bg-background p-px'>
          <TreeLevelPips
            level={levelOf(n.id, tree)}
            width='w-full' />
        </span>
      )}
    </button>
  );
}

export default TreeNodeButton;
