// Packages
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { nodeUnlocked } from '@halloween/shared/skill-tree/progress';

// Types
import type { NodeId, TreeNode, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Seen } from '../types/tree';

/**
 * How much of a node the player can see (see `Seen`).
 *
 * @param node - The node.
 * @param tree - The player's skill tree.
 * @returns How much of it shows.
 */
export function seenOf(node: TreeNode, tree: TreeState): Seen {
  if (nodeUnlocked(node.id, tree)) {
    return 'open';
  }
  const unlock = node.unlock;
  if (unlock.by !== 'upgrade') {
    return 'locked';
  }
  const parents = [unlock.from, unlock.or].filter((id): id is NodeId => !!id).map((id: NodeId): Seen => seenOf(TREE_NODE[id], tree));
  return parents.includes('open') ? 'locked' : parents.includes('locked') ? 'teaser' : 'none';
}

/**
 * What a locked node is waiting for.
 *
 * @param node - The locked node.
 * @returns What opens it, in words.
 */
export function lockReason(node: TreeNode): string {
  const unlock = node.unlock;
  if (unlock.by === 'upgrade' && unlock.level === 0) {
    return `Opens with ${itemLabel(unlock.from)}`;
  }
  if (unlock.by === 'upgrade') {
    return `Upgrade ${itemLabel(unlock.from)}${unlock.or ? ` or ${itemLabel(unlock.or)}` : ''} to Lv ${unlock.level}`;
  }
  return 'Dig up its blueprint';
}
