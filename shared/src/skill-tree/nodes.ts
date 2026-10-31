// Types
import type { NodeId, TreeNode, Unlock } from './types/skill-tree';

/**
 * How a node known from the start opens up.
 */
export const START: Unlock = { by: 'start' };

/**
 * How a node opened by digging up its blueprint opens up.
 */
const BLUEPRINT: Unlock = { by: 'blueprint' };

/**
 * How a node opened by upgrading another opens up.
 *
 * @param from The node it grows from.
 * @param level The level `from` must reach.
 * @param or Another node that opens it at the same level, if any.
 * @returns The unlock rule.
 */
function after(from: NodeId, level: number, or?: NodeId): Unlock {
  return or ? { by: 'upgrade', from, level, or } : { by: 'upgrade', from, level };
}

/**
 * A material that opens with the node it hangs from (made there, or only
 * useful once it's open), and can't be upgraded.
 * @param from The node it hangs from.
 * @returns Its unlock.
 */
function madeBy(from: NodeId): Unlock {
  return { by: 'upgrade', from, level: 0 };
}

/**
 * Every node, in the order the phone lists them (a node always after the
 * one it grows from).
 */
export const TREE: TreeNode[] = [
  { id: 'gear:hammer', branch: 'weapons', unlock: START },
  { id: 'gear:spear', branch: 'weapons', unlock: START },
  { id: 'gear:stake', branch: 'weapons', unlock: after('gear:spear', 1, 'gear:hammer') },
  { id: 'gear:ritual-knife', branch: 'weapons', unlock: after('gear:stake', 1) },
  { id: 'gear:scythe', branch: 'weapons', unlock: after('gear:spear', 1, 'gear:hammer') },
  { id: 'gear:warhammer', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:flail', branch: 'weapons', unlock: after('gear:warhammer', 1) },
  { id: 'gear:morning-star', branch: 'weapons', unlock: after('gear:flail', 1) },
  { id: 'gear:battle-axe', branch: 'weapons', unlock: after('gear:warhammer', 1) },
  { id: 'gear:spiked-gauntlet', branch: 'weapons', unlock: after('gear:warhammer', 1) },
  { id: 'gear:short-sword', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:greatsword', branch: 'weapons', unlock: after('gear:short-sword', 1) },
  { id: 'gear:quarterstaff', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:glaive', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'mat:arrows', branch: 'weapons', unlock: START },
  { id: 'gear:bow', branch: 'weapons', unlock: START },
  { id: 'gear:crossbow', branch: 'weapons', unlock: after('gear:bow', 1) },
  { id: 'mat:bolts', branch: 'weapons', unlock: madeBy('gear:crossbow'), fixed: true },
  { id: 'gear:repeating-crossbow', branch: 'weapons', unlock: after('gear:crossbow', 1) },
  { id: 'gear:blood-gun', branch: 'weapons', unlock: after('gear:crossbow', 1) },
  { id: 'gear:musket', branch: 'weapons', unlock: after('gear:blood-gun', 1) },
  { id: 'gear:shield', branch: 'armor', unlock: START },
  { id: 'gear:wood-armor', branch: 'armor', unlock: START },
  { id: 'gear:bone-armor', branch: 'armor', unlock: after('gear:wood-armor', 1) },
  { id: 'gear:stone-armor', branch: 'armor', unlock: after('gear:wood-armor', 1) },
  { id: 'gear:plate', branch: 'armor', unlock: after('gear:stone-armor', 1) },
  { id: 'build:torch', branch: 'light', unlock: START },
  { id: 'build:lantern', branch: 'light', unlock: after('build:torch', 1) },
  { id: 'build:ghost-lamp', branch: 'light', unlock: after('build:lantern', 1) },
  { id: 'build:campfire', branch: 'light', unlock: BLUEPRINT },
  { id: 'build:soul-fire', branch: 'light', unlock: after('build:campfire', 1) },
  { id: 'build:wood-fence', branch: 'fortifications', unlock: START },
  { id: 'build:wood-wall', branch: 'fortifications', unlock: after('build:wood-fence', 1) },
  { id: 'gear:wrench', branch: 'fortifications', unlock: after('build:wood-wall', 1) },
  { id: 'build:platform', branch: 'fortifications', unlock: after('build:wood-wall', 1) },
  { id: 'build:steps', branch: 'fortifications', unlock: after('build:wood-wall', 1) },
  { id: 'build:palisade', branch: 'fortifications', unlock: after('build:wood-wall', 1) },
  { id: 'build:stone-wall', branch: 'fortifications', unlock: after('build:palisade', 1) },
  { id: 'build:bone-wall', branch: 'fortifications', unlock: after('build:stone-wall', 1) },
  { id: 'build:door', branch: 'fortifications', unlock: after('build:wood-fence', 1) },
  { id: 'build:scarecrow', branch: 'fortifications', unlock: after('build:wood-fence', 1) },
  { id: 'build:spikes', branch: 'fortifications', unlock: after('build:wood-fence', 1) },
  { id: 'build:iron-spikes', branch: 'fortifications', unlock: after('build:spikes', 1) },
  { id: 'build:barbed-wire', branch: 'fortifications', unlock: after('build:spikes', 1) },
  { id: 'build:bolt-turret', branch: 'fortifications', unlock: after('build:spikes', 1) },
  { id: 'build:swiper', branch: 'fortifications', unlock: after('build:bolt-turret', 1) },
  { id: 'build:flamethrower', branch: 'fortifications', unlock: after('build:bolt-turret', 2) },
  { id: 'build:ballista', branch: 'fortifications', unlock: after('build:bolt-turret', 3) },
  { id: 'build:research-table', branch: 'tables', unlock: START },
  { id: 'build:stash', branch: 'tables', unlock: START },
  { id: 'build:coffin', branch: 'tables', unlock: BLUEPRINT },
  { id: 'build:sawmill', branch: 'processing', unlock: after('build:research-table', 1) },
  { id: 'mat:planks', branch: 'processing', unlock: madeBy('build:sawmill'), fixed: true },
  { id: 'build:furnace', branch: 'processing', unlock: after('build:research-table', 2) },
  { id: 'mat:iron', branch: 'processing', unlock: madeBy('build:furnace'), fixed: true },
  { id: 'build:digger', branch: 'processing', unlock: after('build:sawmill', 1) },
  { id: 'build:sifter', branch: 'processing', unlock: after('build:furnace', 1) },
  { id: 'mat:silver', branch: 'processing', unlock: madeBy('build:sifter'), fixed: true },
  { id: 'mat:holy-water', branch: 'processing', unlock: madeBy('mat:silver'), fixed: true },
  { id: 'build:belt', branch: 'processing', unlock: after('build:sawmill', 1) },
  { id: 'build:sorter', branch: 'processing', unlock: after('build:belt', 1) },
  { id: 'build:anvil', branch: 'tables', unlock: after('build:furnace', 2) },
  { id: 'mat:chain', branch: 'tables', unlock: madeBy('build:anvil'), fixed: true },
  { id: 'mat:cursed-core', branch: 'tables', unlock: madeBy('build:anvil'), fixed: true },
  { id: 'build:quarry', branch: 'processing', unlock: after('build:furnace', 2) },
  { id: 'build:effigy', branch: 'occult', unlock: START },
  { id: 'build:cauldron', branch: 'occult', unlock: after('build:effigy', 1) },
  { id: 'mat:tonic', branch: 'occult', unlock: madeBy('build:cauldron'), fixed: true },
  { id: 'build:soul-cage', branch: 'occult', unlock: after('build:cauldron', 1) },
  { id: 'build:oven', branch: 'occult', unlock: after('build:cauldron', 1) },
  { id: 'mat:watering-can', branch: 'occult', unlock: madeBy('build:oven'), fixed: true },
  { id: 'build:altar', branch: 'occult', unlock: after('build:effigy', 1) },
  { id: 'build:bloodforge', branch: 'occult', unlock: after('build:altar', 1) },
  { id: 'mat:bloodsteel', branch: 'occult', unlock: madeBy('build:bloodforge'), fixed: true },
  { id: 'build:blood-fountain', branch: 'occult', unlock: after('build:altar', 2) },
  { id: 'build:obelisk', branch: 'occult', unlock: after('build:effigy', 2) },
  { id: 'build:bell', branch: 'occult', unlock: after('build:sifter', 1) },
  { id: 'build:sentry', branch: 'occult', unlock: after('gear:blood-gun', 1) },
];

/**
 * Every node by id.
 */
export const TREE_NODE = Object.fromEntries(TREE.map((n: TreeNode): [NodeId, TreeNode] => [n.id, n])) as Record<NodeId, TreeNode>;

/**
 * Nodes that open up when their blueprint is dug up.
 */
export const BLUEPRINTS: NodeId[] = TREE.filter((n: TreeNode): boolean => n.unlock.by === 'blueprint').map((n: TreeNode): NodeId => n.id);
