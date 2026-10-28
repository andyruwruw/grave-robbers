// Types
import type { BagItem } from './gear';
import type { MonsterKind } from './monsters';
import type { Tile } from './world';

/**
 * What players carry as counters: candy (from graves and chests) and blood
 * (from dead monsters), spent on skill upgrades. No limit.
 */
export type Resource = 'candy' | 'blood';

export const RESOURCES: Resource[] = ['candy', 'blood'];

/**
 * Carried amount of each counter.
 */
export type Inventory = Record<Resource, number>;

/**
 * Materials, carried as stacks in the bag: gathered (wood, stone), torn
 * from the dead (bone), processed (planks from a sawmill, iron from a
 * furnace, silver sifted from grave stone, bloodsteel forged from iron and
 * blood), and crafted (bolts and arrows). Tonics, brewed in a cauldron, are drunk
 * from the bag to heal.
 */
export type Material = 'wood' | 'planks' | 'stone' | 'iron' | 'bolts' | 'arrows' | 'bone' | 'silver' | 'bloodsteel' | 'tonic';

export const MATERIALS: Material[] = ['wood', 'planks', 'stone', 'iron', 'bolts', 'arrows', 'bone', 'silver', 'bloodsteel', 'tonic'];

/**
 * Anything a pile on the ground or a cost is counted in.
 */
export type Goods = Material | Resource;

export const GOODS: Goods[] = [...MATERIALS, ...RESOURCES];

/**
 * An amount of each kind of goods: a cost, or a pile's contents.
 */
export type Bundle = Record<Goods, number>;

/**
 * A bundle with only the given amounts.
 */
export function stock(some: Partial<Bundle> = {}): Bundle {
  return { wood: 0, planks: 0, stone: 0, iron: 0, bolts: 0, arrows: 0, bone: 0, silver: 0, bloodsteel: 0, tonic: 0, candy: 0, blood: 0, ...some };
}

/**
 * Most of one material a bag slot holds.
 */
export const MATERIAL_STACK = 99;

/**
 * Goods colors, shared so the phone matches the TV's piles.
 */
export const RESOURCE_COLORS: Record<Goods, string> = {
  wood: '#8a5a32',
  planks: '#c8955a',
  stone: '#8d929b',
  iron: '#5d6b7a',
  bolts: '#c9b48a',
  arrows: '#b89060',
  bone: '#e6dcc0',
  silver: '#d4dce6',
  bloodsteel: '#7e1626',
  tonic: '#7ddc4a',
  candy: '#f5c62e',
  blood: '#b0141e',
};

export const GOODS_LABELS: Record<Goods, string> = {
  wood: 'Wood',
  planks: 'Planks',
  stone: 'Stone',
  iron: 'Iron',
  bolts: 'Bolts',
  arrows: 'Arrows',
  bone: 'Bone',
  silver: 'Silver',
  bloodsteel: 'Bloodsteel',
  tonic: 'Tonic',
  candy: 'Candy',
  blood: 'Blood',
};

/**
 * How much the Drop button throws at once.
 */
export const DROP_AMOUNT = 5;

/**
 * Distance (tiles) at which walking over an item picks it up.
 */
export const PICKUP_RADIUS = 0.6;

/**
 * A tile that takes a number of hits to clear, what each hit yields, and
 * what it becomes once emptied.
 */
export interface Gatherable {
  resource: Material | null;
  amount: number;
  leaves: Tile;
}

export const GATHERABLE: Partial<Record<Tile, Gatherable>> = {
  tree: { resource: 'wood', amount: 5, leaves: 'stump' },
  rock: { resource: 'stone', amount: 5, leaves: 'grass' },
  hedge: { resource: 'wood', amount: 2, leaves: 'grass' },
};

/**
 * Graves a player can dig up: hits it takes (each weapon chop counts), and
 * how long (seconds) the mound left behind waits before a new gravestone
 * rises from it.
 */
export const GRAVE_TILES: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross']);
export const DIG_HITS = 3;
export const MOUND_REFILL_MIN = 180;
export const MOUND_REFILL_SPREAD = 120;

/**
 * What a dug-up grave gives, until there are proper loot tables: always
 * some candy (what the skill tree runs on), maybe wood or bones, maybe a
 * blueprint (never gear: that only comes from chests and pumpkins).
 */
export const DIG_CANDY: [number, number] = [2, 5];
export const DIG_WOOD: [number, number] = [1, 3];
export const DIG_WOOD_CHANCE = 0.5;
export const DIG_BLUEPRINT_CHANCE = 0.25;
export const DIG_BONES: [number, number] = [1, 3];

/**
 * Landmarks that can be robbed like graves but stay standing: statues (the
 * courtyards' special graves), crypts, and mausoleums. Each takes ROB_HITS
 * digs, gives richer loot than a grave (ROB_CANDY candy, bones, a chance at
 * gear and a blueprint), and then stays robbed for ROB_REFILL seconds. A
 * crypt or mausoleum is robbed as a whole, whichever wall is dug at.
 */
export const ROBBABLE: ReadonlySet<Tile> = new Set<Tile>(['statue', 'crypt', 'mausoleum']);
export const ROB_HITS = 5;
export const ROB_REFILL = 600;
export const ROB_CANDY: Record<'statue' | 'crypt' | 'mausoleum', [number, number]> = { statue: [6, 10], crypt: [8, 14], mausoleum: [4, 8] };
export const ROB_GEAR_CHANCE = 0.3;
export const ROB_BLUEPRINT_CHANCE = 0.5;
export const DIG_BONE_CHANCE = 0.6;

/**
 * Something lying on the ground: a pile of goods (picked up by walking over
 * it; materials go into the bag), or one bag item, a piece of gear or a
 * stack of structures, with nothing else (picked up with Grab).
 */
export interface ItemState extends Bundle {
  id: number;
  x: number;
  y: number;
  held: BagItem | null;
}

/**
 * Blood a dead monster leaves behind.
 */
export const MONSTER_BLOOD: Record<MonsterKind, number> = { zombie: 2, vampire: 6, ghost: 0, brute: 6, skeleton: 0, witch: 4, ghoul: 2, demon: 8 };

/**
 * Bones a dead monster leaves with its blood.
 */
export const MONSTER_BONES: Record<MonsterKind, number> = { zombie: 1, vampire: 2, ghost: 0, brute: 3, skeleton: 4, witch: 1, ghoul: 2, demon: 1 };
