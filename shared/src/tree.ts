// Local Imports
import { FAMILY_PERKS, GEAR, STEADY_SUPPLY, itemLabel } from './gear';
import { ALTAR_BLOOD, BELL_RADIUS, DIGGER_SECONDS, LIT, SENTRY_DAMAGE, STATIONS, STRUCTURES } from './structures';

// Types
import type { CraftKey, GearKind, RecipeId, WeaponStats } from './gear';
import type { Inventory } from './items';
import type { Station, StructureKind } from './structures';

/**
 * One node of the skill tree: a piece of gear or a structure.
 */
export type NodeId = CraftKey | 'mat:arrows';

/**
 * Where a node sits in the tree.
 */
export type Branch = 'weapons' | 'armor' | 'light' | 'fortifications' | 'tables' | 'processing' | 'occult';

export const BRANCHES: { id: Branch; label: string }[] = [
  { id: 'weapons', label: 'Weapons' },
  { id: 'armor', label: 'Armor' },
  { id: 'light', label: 'Light' },
  { id: 'fortifications', label: 'Fortifications' },
  { id: 'tables', label: 'Tables' },
  { id: 'processing', label: 'Processing' },
  { id: 'occult', label: 'Occult' },
];

/**
 * How a node opens up: known from the start, by digging up its blueprint,
 * or by upgrading the node it grows from to `level`.
 */
export type Unlock = { by: 'start' } | { by: 'blueprint' } | { by: 'upgrade'; from: NodeId; level: number; or?: NodeId };

export interface TreeNode {
  id: NodeId;
  branch: Branch;
  unlock: Unlock;
}

const START: Unlock = { by: 'start' };
const BLUEPRINT: Unlock = { by: 'blueprint' };

function after(from: NodeId, level: number, or?: NodeId): Unlock {
  return or ? { by: 'upgrade', from, level, or } : { by: 'upgrade', from, level };
}

/**
 * Every node, in the order the phone lists them (a node always after the
 * one it grows from).
 */
export const TREE: TreeNode[] = [
  { id: 'gear:wood-axe', branch: 'weapons', unlock: START },
  { id: 'gear:spear', branch: 'weapons', unlock: START },
  { id: 'gear:stake', branch: 'weapons', unlock: after('gear:spear', 1, 'gear:wood-axe') },
  { id: 'gear:ritual-knife', branch: 'weapons', unlock: after('gear:stake', 1) },
  { id: 'gear:scythe', branch: 'weapons', unlock: after('gear:spear', 1, 'gear:wood-axe') },
  { id: 'gear:battle-axe', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:flail', branch: 'weapons', unlock: after('gear:battle-axe', 1) },
  { id: 'gear:morning-star', branch: 'weapons', unlock: after('gear:flail', 1) },
  { id: 'gear:warhammer', branch: 'weapons', unlock: after('gear:battle-axe', 1) },
  { id: 'gear:spiked-gauntlet', branch: 'weapons', unlock: after('gear:battle-axe', 1) },
  { id: 'gear:short-sword', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:greatsword', branch: 'weapons', unlock: after('gear:short-sword', 1) },
  { id: 'gear:quarterstaff', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'gear:glaive', branch: 'weapons', unlock: after('gear:scythe', 1) },
  { id: 'mat:arrows', branch: 'weapons', unlock: START },
  { id: 'gear:bow', branch: 'weapons', unlock: START },
  { id: 'gear:crossbow', branch: 'weapons', unlock: after('gear:bow', 1) },
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
  { id: 'build:research-table', branch: 'tables', unlock: START },
  { id: 'build:coffin', branch: 'tables', unlock: BLUEPRINT },
  { id: 'build:sawmill', branch: 'processing', unlock: after('build:research-table', 1) },
  { id: 'build:furnace', branch: 'processing', unlock: after('build:research-table', 2) },
  { id: 'build:digger', branch: 'processing', unlock: after('build:sawmill', 1) },
  { id: 'build:sifter', branch: 'processing', unlock: after('build:furnace', 1) },
  { id: 'build:effigy', branch: 'occult', unlock: START },
  { id: 'build:cauldron', branch: 'occult', unlock: after('build:effigy', 1) },
  { id: 'build:soul-cage', branch: 'occult', unlock: after('build:cauldron', 1) },
  { id: 'build:altar', branch: 'occult', unlock: after('build:effigy', 1) },
  { id: 'build:bloodforge', branch: 'occult', unlock: after('build:altar', 1) },
  { id: 'build:blood-fountain', branch: 'occult', unlock: after('build:altar', 2) },
  { id: 'build:obelisk', branch: 'occult', unlock: after('build:effigy', 2) },
  { id: 'build:mirror', branch: 'occult', unlock: after('build:obelisk', 1) },
  { id: 'build:bell', branch: 'occult', unlock: after('build:sifter', 1) },
  { id: 'build:sentry', branch: 'occult', unlock: after('gear:blood-gun', 1) },
];

export const TREE_NODE = Object.fromEntries(TREE.map((n: TreeNode): [NodeId, TreeNode] => [n.id, n])) as Record<NodeId, TreeNode>;

/**
 * Nodes that open up when their blueprint is dug up.
 */
export const BLUEPRINTS: NodeId[] = TREE.filter((n: TreeNode): boolean => n.unlock.by === 'blueprint').map((n: TreeNode): NodeId => n.id);

/**
 * Upgrades a node takes, and the candy and blood each one costs (index =
 * the level it's going from).
 */
export const MAX_LEVEL = 3;
export const UPGRADE_COSTS: Inventory[] = [{ candy: 4, blood: 1 }, { candy: 8, blood: 3 }, { candy: 12, blood: 5 }];

/**
 * How close (tiles, from the table's middle) a player must stand to a
 * research table to upgrade anything.
 */
export const RESEARCH_RADIUS = 2.5;

/**
 * One player's progress through the tree: blueprints they found and each
 * node's level (0 when missing). Kept through death.
 */
export interface TreeState {
  found: NodeId[];
  levels: Partial<Record<NodeId, number>>;

  /**
   * The Game tab's testing switches, as the server applies them to this
   * player: every node open (All unlocks), and crafting costs nothing
   * (Free crafting). Never saved.
   */
  all?: boolean;
  free?: boolean;
}

export function levelOf(id: NodeId, tree: TreeState): number {
  return tree.levels[id] ?? 0;
}

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
 * Whether a recipe can be crafted: ammo always, everything else once its
 * node is unlocked.
 */
export function recipeUnlocked(id: RecipeId, tree: TreeState): boolean {
  return id === 'bolts' || id === 'arrows' || nodeUnlocked(id, tree);
}

/**
 * Nodes that open up when `id` reaches `level`.
 */
export function unlockedBy(id: NodeId, level: number): NodeId[] {
  return TREE.filter((n: TreeNode): boolean => n.unlock.by === 'upgrade' && n.unlock.from === id && n.unlock.level === level)
    .map((n: TreeNode): NodeId => n.id);
}

/**
 * Candy and blood the next upgrade of `id` costs, or null when it's maxed.
 */
export function upgradeCost(id: NodeId, tree: TreeState): Inventory | null {
  const level = levelOf(id, tree);
  return level < MAX_LEVEL ? UPGRADE_COSTS[level] : null;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * A weapon's stats at a level: each upgrade hits 20% harder, plus its
 * family's perk (see `FAMILY_PERKS`): pole arms reach 0.3 tiles further,
 * blades sweep 0.12 wider (in arc cosine), heavy weapons knock 25% harder,
 * fist weapons swing 12% faster, and ranged weapons shoot 8% faster. A
 * bow or crossbow also spares its ammo now and then, by the arrows'
 * level (Steady supply). No weapon at all is the wood axe.
 */
export function weaponStats(kind: GearKind | null, tree: TreeState): WeaponStats {
  kind ??= 'wood-axe';
  const base = GEAR[kind].weapon!;
  const level = levelOf(`gear:${kind}`, tree);
  const stats = { ...base, damage: round(base.damage * (1 + 0.2 * level)) };
  if (base.family === 'pole') {
    stats.reach = round(base.reach + 0.3 * level);
  } else if (base.family === 'blade') {
    stats.arcCos = Math.max(-1, round(base.arcCos - 0.12 * level));
  } else if (base.family === 'heavy') {
    stats.knockback = round(base.knockback * (1 + 0.25 * level));
  } else if (base.family === 'fist') {
    stats.cooldown = Math.round(base.cooldown * (1 - 0.12 * level) * 100) / 100;
  } else if (base.family === 'ranged') {
    stats.cooldown = Math.round(base.cooldown * (1 - 0.08 * level) * 100) / 100;
  }
  if (base.ammo === 'arrows' || base.ammo === 'bolts') {
    stats.thrift = STEADY_SUPPLY * levelOf('mat:arrows', tree);
  }
  return stats;
}

/**
 * How long a fresh piece of gear lasts: each upgrade adds a quarter.
 */
export function gearWear(kind: GearKind, tree: TreeState): number {
  return Math.round(GEAR[kind].wear * (1 + 0.25 * levelOf(`gear:${kind}`, tree)));
}

/**
 * What a raised shield or armor multiplies damage by: each upgrade takes
 * off 0.05 more for armor, 0.03 for a shield.
 */
export function gearGuard(kind: GearKind, tree: TreeState): number {
  return Math.round(((GEAR[kind].guard ?? 1) - (kind === 'shield' ? 0.03 : 0.05) * levelOf(`gear:${kind}`, tree)) * 100) / 100;
}

/**
 * A structure's full hit points at its builder's level: each upgrade adds
 * 30%.
 */
export function structureHp(kind: StructureKind, level: number): number {
  return Math.round(STRUCTURES[kind].hp * (1 + 0.3 * level));
}

/**
 * Fuel a fresh built light starts with: lit for good (`LIT`) for lights,
 * the glow time for stations and altars, 0 without a light.
 */
export function lightBurn(kind: StructureKind): number {
  const light = STRUCTURES[kind].light;
  return !light ? 0 : light.burn === Infinity ? LIT : light.burn;
}

/**
 * How far and how bright a built light (or the hand torch) shines at its
 * builder's level: each upgrade widens it 15% and brightens it 10%.
 */
export function lightRadius(radius: number, level: number): number {
  return round(radius * (1 + 0.15 * level));
}

export function lightIntensity(intensity: number | undefined, level: number): number {
  return round((intensity ?? 1) * (1 + 0.1 * level));
}

/**
 * Seconds one batch takes in a station at its builder's level: each
 * upgrade makes it half again as fast.
 */
export function stationSeconds(kind: StructureKind, level: number): number {
  const station: Station = STATIONS[kind]!;
  return round(station.seconds / (1 + 0.5 * level));
}

/**
 * Damage spikes do each second at their builder's level: each upgrade
 * adds 30%.
 */
export function spikeDamage(base: number, level: number): number {
  return base * (1 + 0.3 * level);
}

/**
 * Blood one offering at an altar gives at its builder's level.
 */
export function altarBlood(level: number): number {
  return ALTAR_BLOOD + level;
}

/**
 * Damage a blood sentry's shot does at its builder's level: each upgrade
 * adds 20%.
 */
export function sentryDamage(level: number): number {
  return round(SENTRY_DAMAGE * (1 + 0.2 * level));
}

/**
 * Seconds a bone digger takes per unit at its builder's level.
 */
export function diggerSeconds(level: number): number {
  return round(DIGGER_SECONDS / (1 + 0.5 * level));
}

/**
 * How close ghosts may come to a silver bell at its builder's level.
 */
export function bellRadius(level: number): number {
  return BELL_RADIUS + 0.5 * level;
}

/**
 * One line on what the next upgrade of a node does, for the phone.
 */
export function upgradeEffect(id: NodeId): string {
  if (id === 'mat:arrows') {
    return `Steady supply: +${Math.round(STEADY_SUPPLY * 100)}% chance a shot spares its arrow or bolt`;
  }
  const [kind, what] = id.split(':') as ['gear', GearKind] | ['build', StructureKind];
  if (kind === 'gear') {
    const def = GEAR[what];
    if (def.weapon) {
      const perk = def.weapon.family ? FAMILY_PERKS[def.weapon.family] : null;
      return perk ? `+20% damage, ${perk.name}: ${perk.effect}` : '+20% damage, +25% durability';
    }
    return def.guard ? 'Blocks more, +25% durability' : 'Wider, brighter light';
  }
  if (STATIONS[what] || what === 'digger') {
    return 'Works faster';
  }
  if (what === 'altar') {
    return '+1 blood per offering, +30% health';
  }
  if (what === 'sentry') {
    return '+20% damage, +30% health';
  }
  if (what === 'bell') {
    return 'Wider ward, +30% health';
  }
  if (what === 'spikes' || what === 'iron-spikes' || what === 'barbed-wire') {
    return '+30% damage and health';
  }
  if (what === 'effigy' || what === 'obelisk') {
    return 'Wider curse, +30% health';
  }
  if (what === 'soul-cage') {
    return 'Reaches further, +30% health';
  }
  return STRUCTURES[what].light ? 'Wider, brighter light, +30% health' : '+30% health';
}

/**
 * Display names of some nodes, for the TV feed.
 */
export function itemNames(ids: NodeId[]): string[] {
  return ids.map((id: NodeId): string => itemLabel(id));
}
