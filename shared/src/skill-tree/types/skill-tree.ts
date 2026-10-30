// Types
import type { CraftKey } from '../../inventory/item-keys';

/**
 * One node of the skill tree: a piece of gear or a structure.
 */
export type NodeId = CraftKey | 'mat:arrows';

/**
 * Where a node sits in the tree.
 */
export type Branch = 'weapons' | 'armor' | 'light' | 'fortifications' | 'tables' | 'processing' | 'occult';

/**
 * How a node opens up: known from the start, by digging up its blueprint,
 * or by upgrading the node it grows from to `level`.
 */
export type Unlock =
  /**
   * Known from the start.
   */
  | { by: 'start' }
  /**
   * Opened by digging up its blueprint.
   */
  | { by: 'blueprint' }
  /**
   * Opened by upgrading `from` (or `or`, when given) to `level`.
   */
  | { by: 'upgrade'; from: NodeId; level: number; or?: NodeId };

/**
 * One node's place in the tree and how it opens up.
 */
export interface TreeNode {
  /**
   * What it is.
   */
  id: NodeId;

  /**
   * The branch it sits in.
   */
  branch: Branch;

  /**
   * How it opens up.
   */
  unlock: Unlock;
}

/**
 * One player's progress through the tree: blueprints they found and each
 * node's level (0 when missing). Kept through death.
 */
export interface TreeState {
  /**
   * Nodes whose blueprints they've found.
   */
  found: NodeId[];

  /**
   * Each node's upgrade level (0 when missing).
   */
  levels: Partial<Record<NodeId, number>>;

  /**
   * The Game tab's testing switches, as the server applies them to this
   * player: every node open (All unlocks), and crafting costs nothing
   * (Free crafting). Never saved.
   */
  all?: boolean;

  /**
   * Crafting costs nothing (Free crafting).
   */
  free?: boolean;
}
