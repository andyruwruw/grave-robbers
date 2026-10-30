// Local Imports
import { MAT_RECIPES, isMatRecipe } from '../crafting/material-recipes';
import { START, TREE, TREE_NODE } from './nodes';

// Types
import type { RecipeId } from '../crafting/recipes';
import type { NodeId, TreeNode, TreeState } from './types/skill-tree';

/**
 * A node's upgrade level for a player (0 when never upgraded).
 *
 * @param id The node.
 * @param tree The player's progress.
 * @returns Its level.
 */
export function levelOf(id: NodeId, tree: TreeState): number {
  return tree.levels[id] ?? 0;
}

/**
 * Whether a node is open for a player: known from the start, its blueprint
 * found, or the node it grows from upgraded far enough.
 *
 * @param id The node.
 * @param tree The player's progress.
 * @returns True when it's open.
 */
export function nodeUnlocked(id: NodeId, tree: TreeState): boolean {
  if (tree.all) {
    return true;
  }
  const unlock = TREE_NODE[id]?.unlock ?? START;
  if (unlock.by === 'start') {
    return true;
  }
  if (unlock.by === 'blueprint') {
    return tree.found.includes(id);
  }
  return (nodeUnlocked(unlock.from, tree) && levelOf(unlock.from, tree) >= unlock.level)
    || (!!unlock.or && nodeUnlocked(unlock.or, tree) && levelOf(unlock.or, tree) >= unlock.level);
}

/**
 * Whether a recipe can be crafted: a material recipe once the node that
 * opens it is unlocked (ammo always), everything else once its own node is.
 *
 * @param id The recipe.
 * @param tree The player's progress.
 * @returns True when it can be crafted.
 */
export function recipeUnlocked(id: RecipeId, tree: TreeState): boolean {
  if (isMatRecipe(id)) {
    const opens = MAT_RECIPES[id].opens;
    return !opens || nodeUnlocked(opens, tree);
  }
  return nodeUnlocked(id, tree);
}

/**
 * Nodes that open up when `id` reaches `level`.
 *
 * @param id The node upgraded.
 * @param level The level it reached.
 * @returns The nodes that open up.
 */
export function unlockedBy(id: NodeId, level: number): NodeId[] {
  return TREE.filter((n: TreeNode): boolean => n.unlock.by === 'upgrade' && n.unlock.from === id && n.unlock.level === level)
    .map((n: TreeNode): NodeId => n.id);
}

/**
 * How deep a node sits: 1 for one known from the start, 2 for a blueprint,
 * one more than the node it grows from otherwise.
 *
 * @param id The node.
 * @returns Its depth, from 1.
 */
export function nodeDepth(id: NodeId): number {
  const unlock = TREE_NODE[id].unlock;
  return unlock.by === 'start' ? 1 : unlock.by === 'blueprint' ? 2 : nodeDepth(unlock.from) + 1;
}
