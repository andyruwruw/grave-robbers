// Packages
import React, { useState } from 'react';
import TreePanel from '@halloween/game-ui/components/tree/tree-panel';
import { levelOf } from '@halloween/shared/skill-tree/progress';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';

// Types
import type { Inventory } from '@halloween/shared/goods/goods';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Enough candy and blood that every upgrade can be paid for.
 */
const PLENTY: Inventory = { candy: 1e6, blood: 1e6 };

/**
 * The admin's Knowledge Tree page: the players' skill tree with every
 * node open, for looking at only. Its own tree (never sent anywhere)
 * holds levels: Upgrade, or left click on the picked node, goes up a
 * level, and right click on a node goes down, so each node's upgrades
 * show at every level. With a mouse, details show on hover and the tree
 * pans by dragging, as on /play.
 *
 * @returns {React.JSX.Element} The rendered page.
 */
function TreeViewer(): React.JSX.Element {
  const [tree, setTree] = useState<TreeState>({ found: [], levels: {}, all: true });
  const [mouse] = useState((): boolean => window.matchMedia('(pointer: fine)').matches);

  /**
   * Moves a node's level up or down a step, within 0 to the most.
   *
   * @param node The node.
   * @param step +1 or -1.
   */
  const shift = (node: NodeId, step: number): void => {
    setTree((prev: TreeState): TreeState => {
      const level = Math.min(MAX_UPGRADE_LEVEL, Math.max(0, levelOf(node, prev) + step));
      return { ...prev, levels: { ...prev.levels, [node]: level } };
    });
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border p-md'>
      <TreePanel
        embedded
        hoverDetails={mouse}
        inventory={PLENTY}
        bag={[]}
        tree={tree}
        research={0}
        onUpgrade={(node: NodeId): void => shift(node, 1)}
        onDowngrade={(node: NodeId): void => shift(node, -1)}
        onBack={(): void => {}}
        onPanic={(): void => {}} />
    </div>
  );
}

export default TreeViewer;
