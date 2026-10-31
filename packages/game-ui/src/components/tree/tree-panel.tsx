// Packages
import React, { useState } from 'react';
import { RESOURCES } from '@halloween/shared/goods/goods';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { levelOf } from '@halloween/shared/skill-tree/progress';
import { upgradeCost } from '@halloween/shared/skill-tree/upgrade-cost';
import { useHold } from '@halloween/ui/hooks/use-hold';

// Local Imports
import { HOVER_MS, NODE, ROW } from '../../config/tree';
import { seenOf } from '../../helpers/tree-sight';
import { useHoverDelay } from '../../hooks/use-hover-delay';
import { useSidebarWidth } from '../../hooks/use-sidebar-width';
import { useTreePan } from '../../hooks/use-tree-pan';
import { TREE_LAYOUT } from '../../tree/tree-layout';
import ItemDetails from '../item-details/item-details';
import SidebarResizer from './sidebar-resizer';
import TreeBranchLabels from './tree-branch-labels';
import TreeCanvas from './tree-canvas';
import TreeHeader from './tree-header';
import TreeHoverCard from './tree-hover-card';
import TreeLinks from './tree-links';
import TreeNodeButton from './tree-node-button';
import TreeSidebar from './tree-sidebar';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Inventory, Resource } from '@halloween/shared/goods/goods';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { HoldProps } from '@halloween/ui/hooks/use-hold';
import type { Placed, Seen } from '../../types/tree';

/**
 * Props for the TreePanel component.
 */
interface TreePanelProps {
  /**
   * Drawn in place inside the phone's layout, without its header (Back,
   * the research note, and Panic; a TV controller is held, so a panel is
   * always open and B panics), instead of full screen.
   */
  embedded?: boolean;

  /**
   * Mouse and keyboard mode (/play): a node's details show after the mouse
   * rests on it for a second, beside it, instead of on a long press, and
   * the tree pans by dragging, the scroll wheel, and WASD.
   */
  hoverDetails?: boolean;

  /**
   * Candy and blood carried, to grey out upgrades that can't be paid for.
   */
  inventory: Inventory;

  /**
   * The bag, for the details' costs.
   */
  bag: readonly (BagItem | null)[];

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * What a research table in reach takes off upgrades (0 without one).
   */
  research: number;

  /**
   * Upgrades a node.
   */
  onUpgrade: (node: NodeId) => void;

  /**
   * Takes a node down a level (the admin's view-only tree). When given,
   * right clicking a node picks it and calls this, and clicking the picked
   * node again upgrades it.
   */
  onDowngrade?: (node: NodeId) => void;

  /**
   * Closes the tree.
   */
  onBack: () => void;

  /**
   * Makes the player run from monsters close by for a moment, then come
   * back.
   */
  onPanic: () => void;
}

/**
 * The player's own skill tree, full screen, kept through death: every
 * node a square icon like the Craft list, linked to the node it grows
 * from, top to bottom. Nodes start known, open when their blueprint is dug
 * up, or open when the node above is upgraded far enough. A locked node in
 * sight is a question mark (tap it for a blurred glimpse and what opens
 * it); the row past that shows only lines fading out, and each row fades
 * in as it comes into sight, so nobody knows how deep it goes. Tap an open
 * node to see what upgrading it does and to upgrade it (candy and blood,
 * anywhere, cheaper by a research table); hold any node in sight for its
 * details. The details sidebar is resized by dragging its edge.
 * Back closes it, and Panic gets the player out of trouble while they're
 * looking.
 *
 * @param {TreePanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered screen.
 */
function TreePanel({
  embedded = false,
  hoverDetails = false,
  inventory,
  bag,
  tree,
  research,
  onUpgrade,
  onDowngrade,
  onBack,
  onPanic,
}: TreePanelProps): React.JSX.Element {
  const [selected, setSelected] = useState<NodeId>(TREE_LAYOUT.roots[0].id);
  const sidebar = useSidebarWidth();
  const [details, setDetails] = useState<NodeId | null>(null);
  const pan = useTreePan(hoverDetails);
  const hover = useHoverDelay<NodeId>(HOVER_MS);
  const hold = useHold<NodeId>((id: NodeId): void => {
    const s = seenOf(TREE_NODE[id], tree);
    if (s === 'open' || s === 'locked') {
      setDetails(id);
    }
  });

  const seens = new Map(TREE_LAYOUT.placed.map((p: Placed): [NodeId, Seen] => [p.node.id, seenOf(p.node, tree)]));
  const shown = TREE_LAYOUT.placed.filter((p: Placed): boolean => seens.get(p.node.id) === 'open' || seens.get(p.node.id) === 'locked');
  const teased = TREE_LAYOUT.placed.some((p: Placed): boolean => seens.get(p.node.id) === 'teaser');
  const height = TREE_LAYOUT.top(Math.max(0, ...shown.map((p: Placed): number => p.row))) + NODE + (teased ? ROW / 2 : 16);
  const node = TREE_NODE[selected];
  const seen = seens.get(selected)!;
  const level = levelOf(selected, tree);
  const cost = upgradeCost(selected, tree, research);
  const can = seen === 'open' && cost !== null && RESOURCES.every((r: Resource): boolean => inventory[r] >= cost[r]);

  return (
    <div className={embedded ? '-m-md flex min-h-0 flex-1 flex-col' : 'fixed inset-0 z-10 flex flex-col bg-background'}>
      <TreeHeader
        embedded={embedded}
        research={research}
        onBack={onBack}
        onPanic={onPanic} />
      <div className='flex min-h-0 flex-1'>
        <TreeCanvas
          pan={pan}
          hoverDetails={hoverDetails}
          height={height}>
          <TreeLinks
            seens={seens}
            height={height} />
          <TreeBranchLabels />
          {TREE_LAYOUT.placed.map((p: Placed) => (
            <TreeNodeButton
              key={p.node.id}
              placed={p}
              seen={seens.get(p.node.id)!}
              selected={selected === p.node.id}
              tree={tree}
              hoverDetails={hoverDetails}
              hold={{
                ...(hoverDetails ? {} : hold.bind(p.node.id)),
                ...(onDowngrade && {
                  onContextMenu: (e: React.MouseEvent): void => {
                    e.preventDefault();
                    setSelected(p.node.id);
                    onDowngrade(p.node.id);
                  },
                }),
              } as HoldProps}
              onHover={hover.start}
              onUnhover={hover.cancel}
              onClick={(): void => {
                if (hold.tapped()) {
                  if (onDowngrade && selected === p.node.id) {
                    onUpgrade(p.node.id);
                  }
                  setSelected(p.node.id);
                }
              }} />
          ))}
          {hover.hovered && (
            <TreeHoverCard
              hovered={hover.hovered}
              seens={seens}
              tree={tree}
              inventory={inventory}
              bag={bag} />
          )}
        </TreeCanvas>
        <SidebarResizer
          onPointerDown={sidebar.onPointerDown}
          onPointerMove={sidebar.onPointerMove}
          onPointerUp={sidebar.onPointerUp} />
        <TreeSidebar
          selected={selected}
          node={node}
          seen={seen}
          level={level}
          cost={cost}
          can={can}
          inventory={inventory}
          bag={bag}
          hoverDetails={hoverDetails}
          width={sidebar.width}
          onUpgrade={onUpgrade} />
      </div>
      {details && (
        <ItemDetails
          item={details}
          mystery={seens.get(details) !== 'open'}
          tree={tree}
          inventory={inventory}
          bag={bag}
          onClose={(): void => setDetails(null)} />
      )}
    </div>
  );
}

export default TreePanel;
