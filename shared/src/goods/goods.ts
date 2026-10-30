/**
 * What players carry as counters: candy (from graves and chests) and blood
 * (from dead monsters), spent on skill upgrades. No limit.
 */
export type Resource = 'candy' | 'blood';

/**
 * Every resource, in display order.
 */
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
 * from the bag to heal. Ectoplasm is what's left of a ghost. Chain and
 * cursed cores are parts forged at an anvil for late gear. Pumpkins come
 * from smashing them, for a witch's oven. A blood watering can, carried in
 * the bag, waters pumpkin seeds with blood.
 */
export type Material = 'wood' | 'planks' | 'stone' | 'iron' | 'bolts' | 'arrows' | 'bone' | 'silver' | 'bloodsteel' | 'tonic'
  | 'ectoplasm' | 'chain' | 'cursed-core' | 'pumpkin' | 'watering-can';

/**
 * Every material, in display order.
 */
export const MATERIALS: Material[] = ['wood', 'planks', 'stone', 'iron', 'bolts', 'arrows', 'bone', 'silver', 'bloodsteel', 'tonic', 'ectoplasm', 'chain', 'cursed-core', 'pumpkin', 'watering-can'];

/**
 * Anything a pile on the ground or a cost is counted in.
 */
export type Goods = Material | Resource;

/**
 * Every kind of goods: the materials, then the resources.
 */
export const GOODS: Goods[] = [...MATERIALS, ...RESOURCES];

/**
 * An amount of each kind of goods: a cost, or a pile's contents.
 */
export type Bundle = Record<Goods, number>;

/**
 * A bundle with only the given amounts.
 *
 * @param some The amounts to set.
 * @returns A bundle with those amounts and 0 of everything else.
 */
export function stock(some: Partial<Bundle> = {}): Bundle {
  return { wood: 0, planks: 0, stone: 0, iron: 0, bolts: 0, arrows: 0, bone: 0, silver: 0, bloodsteel: 0, tonic: 0, ectoplasm: 0, chain: 0, 'cursed-core': 0, pumpkin: 0, 'watering-can': 0, candy: 0, blood: 0, ...some };
}

/**
 * Most of one material a bag slot holds.
 */
export const MATERIAL_STACK = 99;
