// Packages
import { BRANCHES } from '@halloween/shared/skill-tree/branches';
import { TREE } from '@halloween/shared/skill-tree/nodes';

// Local Imports
import { COL, LABEL_ROW, ROW } from '../config/tree';

// Types
import type { Branch, NodeId, TreeNode } from '@halloween/shared/skill-tree/types/skill-tree';
import type { BranchSpan, Placed } from '../types/tree';

/**
 * Where every skill tree node sits on the tree page: depth is its row, and
 * leaves take one column each left to right, roots ordered by branch, with
 * a parent centered over its children. Worked out once, at module load.
 */
export class TreeLayout {
  /**
   * The nodes that grow from each node.
   */
  readonly children = new Map<NodeId, TreeNode[]>();

  /**
   * The nodes that grow from nothing, ordered by branch.
   */
  readonly roots: TreeNode[];

  /**
   * Every node with its column and row, in placing order.
   */
  readonly placed: Placed[] = [];

  /**
   * Each branch's label and the columns its roots' subtrees span.
   */
  readonly branchSpans: BranchSpan[] = [];

  /**
   * Each node's placing, by id.
   */
  readonly position: Map<NodeId, Placed>;

  /**
   * The tree's width in pixels.
   */
  readonly width: number;

  /**
   * The column past which a hovered node's details open to its left.
   */
  readonly hoverFlipCol: number;

  /**
   * The next free leaf column while placing.
   */
  private _nextCol = 0;

  /**
   * Lays the whole tree out.
   */
  constructor() {
    for (const n of TREE) {
      if (n.unlock.by === 'upgrade') {
        this.children.set(n.unlock.from, [...(this.children.get(n.unlock.from) ?? []), n]);
      }
    }

    const branchOrder = BRANCHES.map((b: { id: Branch }): Branch => b.id);
    this.roots = TREE.filter((n: TreeNode): boolean => n.unlock.by !== 'upgrade')
      .sort((a: TreeNode, b: TreeNode): number => branchOrder.indexOf(a.branch) - branchOrder.indexOf(b.branch));

    for (const root of this.roots) {
      const from = this._nextCol;
      this._place(root, 0);
      const label = BRANCHES.find((b: { id: Branch }): boolean => b.id === root.branch)!.label;
      const last = this.branchSpans[this.branchSpans.length - 1];
      if (last?.label === label) {
        last.to = this._nextCol - 1;
      } else {
        this.branchSpans.push({ label, from, to: this._nextCol - 1 });
      }
    }

    this.position = new Map(this.placed.map((p: Placed): [NodeId, Placed] => [p.node.id, p]));
    this.width = this._nextCol * COL;
    this.hoverFlipCol = Math.max(...this.placed.map((p: Placed): number => p.col)) / 2;
  }

  /**
   * The x of a column's center.
   *
   * @param col - The column.
   * @returns Pixels from the tree's left edge.
   */
  centerX(col: number): number {
    return col * COL + COL / 2;
  }

  /**
   * The y of a row's top.
   *
   * @param row - The row.
   * @returns Pixels from the tree's top edge.
   */
  top(row: number): number {
    return LABEL_ROW + row * ROW + 4;
  }

  /**
   * Places a node and everything under it, children first.
   *
   * @param node - The node.
   * @param row - Its row.
   * @returns Its column.
   */
  private _place(node: TreeNode, row: number): number {
    const kids = this.children.get(node.id) ?? [];
    const cols = kids.map((k: TreeNode): number => this._place(k, row + 1));
    const col = cols.length > 0 ? (cols[0] + cols[cols.length - 1]) / 2 : this._nextCol++;
    this.placed.push({ node, col, row });
    return col;
  }
}

/**
 * The one layout every tree page draws.
 */
export const TREE_LAYOUT = new TreeLayout();
