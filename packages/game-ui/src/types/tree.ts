// Types
import type { TreeNode } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Where each node sits: depth is its row (how many upgrades it grows from),
 * and leaves take one column each left to right, roots ordered by branch,
 * with a parent centered over its children.
 */
export interface Placed {
  /**
   * The node.
   */
  node: TreeNode;

  /**
   * Its column (a parent can sit between two).
   */
  col: number;

  /**
   * Its row: how many upgrades it grows from.
   */
  row: number;
}

/**
 * How much of a node the player can see: open; locked, a question mark
 * (a root, or the node it grows from is open); a teaser, just the line
 * fading out toward it (the node it grows from is locked); or nothing.
 */
export type Seen = 'open' | 'locked' | 'teaser' | 'none';

/**
 * A branch's label and the columns its roots' subtrees span.
 */
export interface BranchSpan {
  /**
   * The branch's name.
   */
  label: string;

  /**
   * Its first column.
   */
  from: number;

  /**
   * Its last column.
   */
  to: number;
}
