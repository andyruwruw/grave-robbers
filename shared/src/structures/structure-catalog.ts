// Local Imports
import { stock } from '../goods/goods';
import { WORKING_GLOW } from './lights';

// Types
import type { Tile } from '../world/tiles';
import type { StructureDef, StructureKind } from './types/structures';

/**
 * Every structure kind, in Craft list order.
 */
export const STRUCTURE_KINDS: StructureKind[] = [
  'wood-wall', 'stone-wall', 'palisade', 'door', 'wood-fence', 'spikes', 'iron-spikes', 'barbed-wire', 'scarecrow',
  'torch', 'lantern', 'ghost-lamp', 'campfire', 'soul-fire', 'platform', 'steps',
  'research-table', 'sawmill', 'furnace', 'stash',
  'effigy', 'altar', 'bloodforge', 'sifter', 'sentry', 'digger', 'bone-wall', 'coffin', 'bell', 'cauldron',
  'obelisk', 'blood-fountain', 'soul-cage',
  'anvil', 'oven', 'quarry', 'belt', 'sorter', 'seeds', 'sprout',
  'bolt-turret', 'swiper', 'flamethrower', 'ballista',
];

/**
 * Every structure kind's build rules and stats.
 */
export const STRUCTURES: Record<StructureKind, StructureDef> = {
  'wood-wall': { label: 'Wood wall', cost: stock({ wood: 4 }), hp: 20 },
  'stone-wall': { label: 'Stone wall', cost: stock({ stone: 6 }), hp: 50 },
  'palisade': { label: 'Palisade', cost: stock({ planks: 6 }), hp: 35 },
  'door': { label: 'Door', cost: stock({ wood: 4 }), hp: 20 },
  'wood-fence': { label: 'Fence', cost: stock({ wood: 2 }), hp: 10 },
  'spikes': { label: 'Spikes', cost: stock({ wood: 5, stone: 2 }), hp: 15 },
  'scarecrow': { label: 'Scarecrow', cost: stock({ wood: 10, stone: 2, blood: 5, candy: 5 }), hp: 30 },
  'iron-spikes': { label: 'Iron spikes', cost: stock({ iron: 4, wood: 6, stone: 2 }), hp: 30 },
  'barbed-wire': { label: 'Barbed wire', cost: stock({ wood: 4, iron: 1 }), hp: 20 },
  'torch': { label: 'Torch', cost: stock({ wood: 2 }), hp: 5, light: { radius: 3, burn: Infinity, color: '#ffc27a', intensity: 0.8 } },
  'lantern': { label: 'Oil lantern', cost: stock({ wood: 2, stone: 2 }), hp: 15, light: { radius: 4.5, burn: Infinity, color: '#ffd98a', intensity: 1.1 } },
  'ghost-lamp': { label: 'Ghost lamp', cost: stock({ iron: 1, bone: 2, silver: 1, ectoplasm: 1 }), hp: 25, light: { radius: 6, burn: Infinity, color: '#b8ffe0', intensity: 1.3 } },
  'campfire': { label: 'Campfire', cost: stock({ wood: 12, stone: 12 }), hp: 30, light: { radius: 6.5, burn: Infinity, color: '#ffb366', intensity: 1.4 } },
  'soul-fire': { label: 'Soul fire', cost: stock({ stone: 10, bone: 6, blood: 8 }), hp: 45, light: { radius: 8.5, burn: Infinity, color: '#7fe0ff', intensity: 1.7 } },
  'effigy': { label: 'Effigy', cost: stock({ wood: 6, bone: 2 }), hp: 20 },
  'obelisk': { label: 'Cursed obelisk', cost: stock({ stone: 8, bone: 4 }), hp: 60, light: { radius: 2.2, burn: Infinity, color: '#b04aff', intensity: 0.6 } },
  'blood-fountain': { label: 'Blood fountain', cost: stock({ stone: 4, 'cursed-core': 2, bloodsteel: 2, blood: 8 }), hp: 40, light: { radius: 3, burn: Infinity, color: '#ff2236', intensity: 0.8 } },
  'soul-cage': { label: 'Soul cage', cost: stock({ iron: 3, bone: 5, silver: 1 }), hp: 35, light: { radius: 1.6, burn: Infinity, color: '#b8ffe0', intensity: 0.6 } },
  'platform': { label: 'Platform', cost: stock({ wood: 6 }), hp: 25 },
  'steps': { label: 'Steps', cost: stock({ wood: 3 }), hp: 15 },
  'research-table': { label: 'Research table', cost: stock({ wood: 12, stone: 6 }), hp: 30 },
  'stash': { label: 'Storage chest', cost: stock({ wood: 12 }), hp: 30 },
  'sawmill': { label: 'Sawmill', cost: stock({ wood: 16, stone: 8 }), hp: 30 },
  'furnace': { label: 'Furnace', cost: stock({ stone: 20, wood: 8 }), hp: 40, light: { radius: 2.5, burn: WORKING_GLOW, color: '#ff8a3d' } },
  'altar': { label: 'Sacrificial altar', cost: stock({ stone: 6, bone: 4 }), hp: 40, light: { radius: 3, burn: WORKING_GLOW, color: '#ff2236' } },
  'bloodforge': { label: 'Blood furnace', cost: stock({ stone: 16, iron: 8 }), hp: 40, light: { radius: 2.5, burn: WORKING_GLOW, color: '#ff3326' } },
  'sifter': { label: 'Grave sifter', cost: stock({ wood: 12, planks: 8 }), hp: 25 },
  'sentry': { label: 'Blood sentry', cost: stock({ 'cursed-core': 1, iron: 10, silver: 3, bone: 6, planks: 6 }), hp: 30 },
  'digger': { label: 'Bone digger', cost: stock({ bone: 12, wood: 12, iron: 1 }), hp: 25 },
  'bone-wall': { label: 'Bone wall', cost: stock({ bone: 6, stone: 2 }), hp: 70 },
  'coffin': { label: 'Coffin', cost: stock({ wood: 15 }), hp: 30 },
  'bell': { label: 'Silver bell', cost: stock({ silver: 2, wood: 1, ectoplasm: 1 }), hp: 20 },
  'cauldron': { label: 'Cauldron', cost: stock({ stone: 12, wood: 8, bone: 4 }), hp: 30, light: { radius: 2, burn: WORKING_GLOW, color: '#8dff5a' } },
  'anvil': { label: 'Anvil', cost: stock({ iron: 36, stone: 30, planks: 10 }), hp: 50 },
  'quarry': { label: 'Quarry', cost: stock({ iron: 16, chain: 6, planks: 20 }), hp: 50 },
  'oven': { label: 'Witch\'s oven', cost: stock({ stone: 16, iron: 4, bone: 8 }), hp: 40, light: { radius: 2.5, burn: WORKING_GLOW, color: '#ff7a2a' } },
  'belt': { label: 'Conveyor belt', cost: stock({ planks: 2, iron: 2 }), hp: 15 },
  'sorter': { label: 'Belt sorter', cost: stock({ planks: 4, iron: 3 }), hp: 15 },
  'seeds': { label: 'Pumpkin seeds', cost: stock({}), hp: 5, wild: true },
  'sprout': { label: 'Pumpkin sprout', cost: stock({}), hp: 5, wild: true },
  'bolt-turret': { label: 'Bolt turret', cost: stock({ planks: 10, iron: 8 }), hp: 25, parts: ['crossbow'] },
  'swiper': { label: 'Sword swiper', cost: stock({ planks: 10, iron: 14, bone: 6 }), hp: 40 },
  'flamethrower': { label: 'Flamethrower', cost: stock({ iron: 14, stone: 8, planks: 6, silver: 2, brimstone: 1 }), hp: 35 },
  'ballista': { label: 'Ballista', cost: stock({ planks: 12, iron: 16, chain: 4, silver: 3 }), hp: 45, anvil: true, parts: ['crossbow'] },
};

/**
 * Whether a tile is a player-built structure.
 *
 * @param tile Any tile.
 * @returns True when it's a StructureKind.
 */
export function isStructure(tile: Tile): tile is StructureKind {
  return (STRUCTURE_KINDS as Tile[]).includes(tile);
}
