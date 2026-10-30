// Types
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * An empty skill tree, for loot whose wear doesn't depend on anyone's.
 */
export const NO_TREE: TreeState = { found: [], levels: {} };
