// Local Imports
import { GOODS_LABELS, MATERIALS, RESOURCES, stock } from './items';
import { GHOST_DAMAGE } from './monsters';
import { STRUCTURES, STRUCTURE_KINDS } from './structures';

// Types
import type { Bundle, Inventory, Material, Resource } from './items';
import type { MonsterKind } from './monsters';
import type { LightDef, StructureKind } from './structures';

/**
 * Where a piece of gear goes when equipped.
 */
export type GearSlot = 'weapon' | 'offhand' | 'armor';

export const GEAR_SLOTS: GearSlot[] = ['weapon', 'offhand', 'armor'];

/**
 * Everything a player can carry in the bag and equip.
 */
export type GearKind =
  | 'wood-axe' | 'wood-armor' | 'bone-armor' | 'stone-armor'
  | 'battle-axe' | 'scythe' | 'spear' | 'stake' | 'ritual-knife' | 'crossbow' | 'blood-gun' | 'torch' | 'shield' | 'plate'
  | 'short-sword' | 'greatsword' | 'flail' | 'morning-star' | 'warhammer' | 'quarterstaff' | 'glaive' | 'spiked-gauntlet'
  | 'bow' | 'repeating-crossbow' | 'musket'
  | 'stick' | 'femur' | 'shovel';

export const GEAR_KINDS: GearKind[] = [
  'wood-axe', 'wood-armor', 'bone-armor', 'stone-armor',
  'battle-axe', 'scythe', 'spear', 'stake', 'ritual-knife', 'crossbow', 'blood-gun', 'torch', 'shield', 'plate',
  'short-sword', 'greatsword', 'flail', 'morning-star', 'warhammer', 'quarterstaff', 'glaive', 'spiked-gauntlet',
  'bow', 'repeating-crossbow', 'musket',
  'stick', 'femur', 'shovel',
];

/**
 * Kinds of weapon that share an upgrade perk (see `weaponStats`): pole
 * arms reach further, blades sweep wider, heavy weapons knock harder,
 * fist weapons swing faster, and ranged weapons sometimes spare their
 * ammo.
 */
export type WeaponFamily = 'pole' | 'blade' | 'heavy' | 'fist' | 'ranged';

export const FAMILY_PERKS: Record<WeaponFamily, { name: string; effect: string }> = {
  pole: { name: 'Longer reach', effect: 'reaches further' },
  blade: { name: 'Keen edge', effect: 'sweeps a wider arc' },
  heavy: { name: 'Heavy blows', effect: 'knocks harder' },
  fist: { name: 'Relentless assault', effect: 'swings faster' },
  ranged: { name: 'Quick reload', effect: 'shoots faster' },
};

/**
 * Arrows' upgrade perk: each level adds this chance that an arrow or bolt
 * shot doesn't use up its ammo.
 */
export const STEADY_SUPPLY = 0.2;

/**
 * Junk some zombies carry and drop: never craftable, never in graves, and
 * never better than the wood axe at what matters (each has one odd perk).
 */
export const JUNK_WEAPONS: GearKind[] = ['stick', 'femur', 'shovel'];

/**
 * Extra damage a zombie's bites do while it carries junk (the chance it
 * does is `armedChance` in `levels.ts`; it drops it when it dies).
 */
export const ZOMBIE_ARMED_DAMAGE = 1;

/**
 * How a weapon swings: damage, seconds between swings, reach (tiles; range
 * for the crossbow), the arc it covers (cos of the half-angle: 0 is the
 * whole front half-circle, closer to 1 is narrower), knockback distance,
 * units gathered and structure damage multiplier per hit, and the monster
 * it kills in one hit, if any. Ranged weapons spend `ammo` (bolts from the
 * bag, or blood) per shot; `hpCost` is health a swing takes from whoever
 * swings it (never their last), and `feast` is health a kill gives back,
 * slowly (see FEAST_HEAL_PER_SECOND). `holy` multiplies its damage to
 * vampires; blood weapons (blood ammo or a health cost) barely hurt them
 * (VAMPIRE_BLOOD_RESIST).
 */
export interface WeaponStats {
  damage: number;
  cooldown: number;
  reach: number;
  arcCos: number;
  knockback: number;
  chop: number;
  slays?: MonsterKind;
  ranged?: boolean;
  ammo?: 'bolts' | 'arrows' | 'blood';
  hpCost?: number;
  feast?: number;
  holy?: number;

  /**
   * Needs both hands (no shield alongside it), and the family whose
   * upgrade perk it gets.
   */
  hands?: 2;
  family?: WeaponFamily;

  /**
   * Chance a shot doesn't use up its ammo (ranged upgrades).
   */
  thrift?: number;
}

/**
 * One kind of gear. `wear` is how long a fresh one lasts: hits for weapons,
 * blocked hits for shields and armor, seconds of burning for the torch.
 * `guard` multiplies damage taken (the shield only from the front). `loot`
 * weighs how often it turns up in graves and on dead monsters.
 */
export interface GearDef {
  label: string;
  slot: GearSlot;
  wear: number;
  cost: Bundle;
  loot: number;
  weapon?: WeaponStats;
  light?: LightDef;
  guard?: number;

  /**
   * Junk a zombie dropped: not craftable and not in the skill tree.
   */
  junk?: boolean;

  /**
   * Never crafted or found as its own item: the wood axe everyone always
   * has, and the hand torch (a torch from a stack of torches, held).
   */
  innate?: boolean;

  /**
   * Armor: how fast the wearer moves (1 is normal), how far hits throw them
   * (1 is normal, 0 never), and damage thrown back at monsters that hit
   * them in melee.
   */
  speed?: number;
  steady?: number;
  thorns?: number;
}

/**
 * The wood axe everyone always has; it's what swings when no weapon is
 * equipped, and it never breaks.
 */
export const WOOD_AXE: WeaponStats = { damage: 3, cooldown: 0.5, reach: 1.8, arcCos: 0, knockback: 1, chop: 1 };

/**
 * A shield only works while held up (the phone's Block button, and only
 * beside a one-handed weapon): hits from the front are cut to BLOCK_GUARD
 * of their damage (less with upgrades) and wear the shield, and the player
 * moves at BLOCK_SLOW of their speed and can't attack.
 */
export const BLOCK_GUARD = 0.12;
export const BLOCK_SLOW = 0.5;

/**
 * Whether a weapon needs both hands (no shield alongside it).
 */
export function twoHanded(kind: GearKind | null | undefined): boolean {
  return !!kind && GEAR[kind].weapon?.hands === 2;
}

export const GEAR: Record<GearKind, GearDef> = {
  'wood-axe': {
    label: 'Wood axe',
    slot: 'weapon',
    wear: 999,
    cost: stock({}),
    loot: 0,
    innate: true,
    weapon: { ...WOOD_AXE, family: 'heavy' },
  },
  'wood-armor': {
    label: 'Wood armor',
    slot: 'armor',
    wear: 30,
    cost: stock({ wood: 4 }),
    loot: 2,
    guard: 0.85,
  },
  'bone-armor': {
    label: 'Bone armor',
    slot: 'armor',
    wear: 25,
    cost: stock({ bone: 6, wood: 1 }),
    loot: 1,
    guard: 0.72,
    speed: 0.95,
    thorns: 1.5,
  },
  'stone-armor': {
    label: 'Stone armor',
    slot: 'armor',
    wear: 90,
    cost: stock({ stone: 8 }),
    loot: 1,
    guard: 0.5,
    speed: 0.6,
    steady: 0,
  },
  'battle-axe': {
    label: 'Battle axe',
    slot: 'weapon',
    wear: 40,
    cost: stock({ wood: 3, stone: 2 }),
    loot: 3,
    weapon: { damage: 5, cooldown: 0.8, reach: 1.9, arcCos: 0, knockback: 1.6, chop: 2, hands: 2, family: 'heavy' },
  },
  'scythe': {
    label: 'Scythe',
    slot: 'weapon',
    wear: 50,
    cost: stock({ planks: 2, iron: 2 }),
    loot: 1,
    weapon: { damage: 6, cooldown: 0.9, reach: 2.3, arcCos: -0.4, knockback: 1.3, chop: 1, hands: 2, family: 'blade' },
  },
  'spear': {
    label: 'Spear',
    slot: 'weapon',
    wear: 40,
    cost: stock({ wood: 4 }),
    loot: 3,
    weapon: { damage: 3, cooldown: 0.55, reach: 2.7, arcCos: 0.75, knockback: 1.2, chop: 1, family: 'pole' },
  },
  'stake': {
    label: 'Stake',
    slot: 'weapon',
    wear: 25,
    cost: stock({ wood: 2 }),
    loot: 3,
    weapon: { damage: 1, cooldown: 0.4, reach: 1.4, arcCos: 0.3, knockback: 0.6, chop: 1, slays: 'vampire' },
  },
  'crossbow': {
    label: 'Crossbow',
    slot: 'weapon',
    wear: 60,
    cost: stock({ wood: 4, planks: 2 }),
    loot: 1,
    weapon: { damage: 3, cooldown: 0.9, reach: 7, arcCos: 1, knockback: 0.8, chop: 1, ranged: true, ammo: 'bolts', holy: 3, hands: 2, family: 'ranged' },
  },
  'ritual-knife': {
    label: 'Ritual knife',
    slot: 'weapon',
    wear: 60,
    cost: stock({ silver: 1, bone: 2 }),
    loot: 1,
    weapon: { damage: 4, cooldown: 0.35, reach: 1.5, arcCos: 0.4, knockback: 0.5, chop: 1, hpCost: 1, feast: 4 },
  },
  'blood-gun': {
    label: 'Nightmare blunderbuss',
    slot: 'weapon',
    wear: 60,
    cost: stock({ bloodsteel: 2, planks: 2 }),
    loot: 0,
    weapon: { damage: 6, cooldown: 1.1, reach: 6, arcCos: 1, knockback: 2.2, chop: 1, ranged: true, ammo: 'blood', hands: 2, family: 'ranged' },
  },
  'short-sword': {
    label: 'Short sword',
    slot: 'weapon',
    wear: 50,
    cost: stock({ iron: 1, planks: 1 }),
    loot: 2,
    weapon: { damage: 3.5, cooldown: 0.4, reach: 1.7, arcCos: 0.2, knockback: 0.8, chop: 1, family: 'blade' },
  },
  'greatsword': {
    label: 'Greatsword',
    slot: 'weapon',
    wear: 55,
    cost: stock({ iron: 3, planks: 1 }),
    loot: 1,
    weapon: { damage: 7, cooldown: 0.95, reach: 2.2, arcCos: -0.3, knockback: 1.6, chop: 1, hands: 2, family: 'blade' },
  },
  'flail': {
    label: 'Flail',
    slot: 'weapon',
    wear: 45,
    cost: stock({ iron: 2, wood: 2 }),
    loot: 1,
    weapon: { damage: 5, cooldown: 0.75, reach: 2, arcCos: -0.2, knockback: 2.2, chop: 1, family: 'heavy' },
  },
  'morning-star': {
    label: 'Morning star',
    slot: 'weapon',
    wear: 50,
    cost: stock({ iron: 3, planks: 1, bone: 2 }),
    loot: 1,
    weapon: { damage: 6.5, cooldown: 0.85, reach: 2, arcCos: -0.2, knockback: 2.6, chop: 1, family: 'heavy' },
  },
  'warhammer': {
    label: 'Warhammer',
    slot: 'weapon',
    wear: 50,
    cost: stock({ iron: 2, stone: 2, planks: 1 }),
    loot: 1,
    weapon: { damage: 6, cooldown: 0.9, reach: 1.8, arcCos: 0.1, knockback: 3, chop: 2, family: 'heavy' },
  },
  'quarterstaff': {
    label: 'Quarterstaff',
    slot: 'weapon',
    wear: 45,
    cost: stock({ planks: 2 }),
    loot: 2,
    weapon: { damage: 3, cooldown: 0.45, reach: 2.4, arcCos: -0.5, knockback: 2, chop: 1, hands: 2, family: 'pole' },
  },
  'glaive': {
    label: 'Glaive',
    slot: 'weapon',
    wear: 50,
    cost: stock({ iron: 2, planks: 2 }),
    loot: 1,
    weapon: { damage: 5.5, cooldown: 0.75, reach: 2.8, arcCos: 0.2, knockback: 1.4, chop: 1, hands: 2, family: 'pole' },
  },
  'spiked-gauntlet': {
    label: 'Spiked gauntlet',
    slot: 'weapon',
    wear: 60,
    cost: stock({ iron: 1, bone: 2 }),
    loot: 1,
    weapon: { damage: 2.5, cooldown: 0.28, reach: 1.2, arcCos: 0.5, knockback: 0.6, chop: 1, family: 'fist' },
  },
  'bow': {
    label: 'Bow',
    slot: 'weapon',
    wear: 60,
    cost: stock({ wood: 3 }),
    loot: 2,
    weapon: { damage: 2.5, cooldown: 0.65, reach: 7, arcCos: 1, knockback: 0.6, chop: 1, ranged: true, ammo: 'arrows', hands: 2, family: 'ranged' },
  },
  'repeating-crossbow': {
    label: 'Repeating crossbow',
    slot: 'weapon',
    wear: 70,
    cost: stock({ planks: 3, iron: 2 }),
    loot: 1,
    weapon: { damage: 2.5, cooldown: 0.35, reach: 7, arcCos: 1, knockback: 0.6, chop: 1, ranged: true, ammo: 'bolts', holy: 3, hands: 2, family: 'ranged' },
  },
  'musket': {
    label: 'Musket',
    slot: 'weapon',
    wear: 50,
    cost: stock({ bloodsteel: 2, iron: 2, planks: 2 }),
    loot: 0,
    weapon: { damage: 12, cooldown: 1.8, reach: 10, arcCos: 1, knockback: 3, chop: 1, ranged: true, ammo: 'blood', hands: 2, family: 'ranged' },
  },
  'torch': {
    label: 'Torch',
    slot: 'offhand',
    wear: 180,
    cost: stock({ wood: 1 }),
    loot: 0,
    innate: true,
    light: { radius: 3.5, burn: Infinity, color: '#ffb866', intensity: 0.9 },
  },
  'shield': {
    label: 'Shield',
    slot: 'offhand',
    wear: 30,
    cost: stock({ wood: 3 }),
    loot: 2,
    guard: BLOCK_GUARD,
  },
  'plate': {
    label: 'Iron plate',
    slot: 'armor',
    wear: 50,
    cost: stock({ iron: 3 }),
    loot: 1,
    guard: 0.6,
    speed: 0.9,
    steady: 0.5,
  },
  'stick': {
    label: 'Stick',
    slot: 'weapon',
    wear: 15,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 2, cooldown: 0.45, reach: 2.1, arcCos: 0.2, knockback: 0.8, chop: 1 },
  },
  'femur': {
    label: 'Femur club',
    slot: 'weapon',
    wear: 12,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 3, cooldown: 0.75, reach: 1.4, arcCos: 0, knockback: 1.8, chop: 1 },
  },
  'shovel': {
    label: 'Bent shovel',
    slot: 'weapon',
    wear: 18,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 2, cooldown: 0.6, reach: 1.7, arcCos: 0.1, knockback: 1, chop: 2 },
  },
};

/**
 * One piece of gear and how much use it has left.
 */
export interface GearItem {
  kind: GearKind;
  wear: number;
}

/**
 * A stack of crafted structures waiting to be placed.
 */
export interface BuildItem {
  build: StructureKind;
  count: number;
}

/**
 * A stack of one material.
 */
export interface MaterialItem {
  material: Material;
  count: number;
}

/**
 * Anything a bag slot can hold. Only gear and structures lie on the ground
 * as items; dropped materials become a pile.
 */
export type BagItem = GearItem | BuildItem | MaterialItem;

export function isBuildItem(item: BagItem): item is BuildItem {
  return 'build' in item;
}

export function isMaterialItem(item: BagItem): item is MaterialItem {
  return 'material' in item;
}

export function isGearItem(item: BagItem): item is GearItem {
  return 'kind' in item;
}

/**
 * Most structures of one kind a bag slot holds.
 */
export const BUILD_STACK = 99;

/**
 * Slots in the bag, besides the equipped ones.
 */
export const BAG_SLOTS = 16;

/**
 * What a player has equipped and in their bag (null is an empty slot).
 */
export interface Gear {
  equipped: Record<GearSlot, GearItem | null>;
  bag: (BagItem | null)[];
}

/**
 * Names a piece of gear or a structure, the things that are crafted (both
 * have a torch, hence the prefix).
 */
export type CraftKey = `gear:${GearKind}` | `build:${StructureKind}`;

/**
 * Names one kind of thing a bag slot can hold.
 */
export type ItemKey = CraftKey | `mat:${Material}`;

export function itemKey(item: BagItem): ItemKey {
  return isBuildItem(item) ? `build:${item.build}` : isMaterialItem(item) ? `mat:${item.material}` : `gear:${item.kind}`;
}

/**
 * Everything the Craft list makes: a stack of bolts, a piece of gear, or a
 * structure (which goes into the bag, to be placed from there).
 */
export type RecipeId = 'bolts' | 'arrows' | CraftKey;

export const RECIPES: RecipeId[] = [
  'arrows',
  'bolts',
  ...GEAR_KINDS.filter((k: GearKind): boolean => !GEAR[k].junk && !GEAR[k].innate).map((k: GearKind): RecipeId => `gear:${k}`),
  ...STRUCTURE_KINDS.map((k: StructureKind): RecipeId => `build:${k}`),
];

export const BOLTS_PER_CRAFT = 3;
export const BOLT_COST: Bundle = stock({ wood: 1 });
export const ARROWS_PER_CRAFT = 4;
export const ARROW_COST: Bundle = stock({ wood: 1 });

/**
 * Ammo recipes: how many one craft makes.
 */
export function ammoMade(recipe: RecipeId): number {
  return recipe === 'arrows' ? ARROWS_PER_CRAFT : BOLTS_PER_CRAFT;
}

/**
 * What a recipe costs to craft.
 */
export function recipeCost(id: RecipeId): Bundle {
  if (id === 'bolts') {
    return BOLT_COST;
  }
  if (id === 'arrows') {
    return ARROW_COST;
  }
  const [kind, what] = id.split(':') as ['gear', GearKind] | ['build', StructureKind];
  return kind === 'gear' ? GEAR[what].cost : STRUCTURES[what].cost;
}

/**
 * Crossbow bolts in flight: speed (tiles per second).
 */
export const BOLT_SPEED = 16;

/**
 * How close (tiles) gear on the ground must be to grab it, measured from
 * the player or from the middle of the tile they face.
 */
export const GRAB_RADIUS = 0.9;

/**
 * Chance a dying monster leaves a piece of gear.
 */
export const MONSTER_LOOT_CHANCE: Record<MonsterKind, number> = { zombie: 0, vampire: 0, ghost: 0, brute: 0, skeleton: 0, witch: 0, ghoul: 0, demon: 0 };

/**
 * Chance a smashed pumpkin turns out to have hidden a piece of gear. Gear
 * otherwise only comes from chests (and zombies' junk).
 */
export const PUMPKIN_LOOT_CHANCE = 0.04;

/**
 * How much of a blood weapon's damage a vampire takes.
 */
export const VAMPIRE_BLOOD_RESIST = 0.25;

/**
 * What a weapon (or its shot) does to a monster: everything to what it
 * slays, extra to vampires if it's holy, and little to vampires if it runs
 * on blood.
 */
export function damageTo(kind: MonsterKind, weapon: WeaponStats, amount: number): number {
  if (weapon.slays === kind) {
    return Infinity;
  }
  if (kind === 'ghost') {
    return Math.max(1, Math.round(amount * GHOST_DAMAGE));
  }
  if (kind !== 'vampire') {
    return amount;
  }
  if (weapon.holy) {
    return amount * weapon.holy;
  }
  return weapon.ammo === 'blood' || weapon.hpCost ? amount * VAMPIRE_BLOOD_RESIST : amount;
}

/**
 * Found gear (from chests, pumpkins, and zombies) is partly worn: at least
 * this much of a fresh one's use is left.
 */
export const LOOT_MIN_WEAR = 0.5;

/**
 * What a kind of item is called on the phone and in the kill feed.
 */
export function itemLabel(key: ItemKey): string {
  const [kind, what] = key.split(':') as ['gear', GearKind] | ['build', StructureKind] | ['mat', Material];
  return kind === 'gear' ? GEAR[what].label : kind === 'build' ? STRUCTURES[what].label : GOODS_LABELS[what];
}

/**
 * How much of a material is in a bag, across its stacks.
 */
export function bagCount(bag: readonly (BagItem | null)[], material: Material): number {
  return bag.reduce((n: number, item: BagItem | null): number => n + (item && isMaterialItem(item) && item.material === material ? item.count : 0), 0);
}

/**
 * How many times over candy and blood in the pockets and materials in the
 * bag cover `cost` (at most `cap`).
 */
export function affordableCount(cost: Bundle, inventory: Inventory, bag: readonly (BagItem | null)[], cap = 99): number {
  let n = cap;
  for (const r of RESOURCES) {
    if (cost[r] > 0) {
      n = Math.min(n, Math.floor(inventory[r] / cost[r]));
    }
  }
  for (const m of MATERIALS) {
    if (cost[m] > 0) {
      n = Math.min(n, Math.floor(bagCount(bag, m) / cost[m]));
    }
  }
  return n;
}

/**
 * Whether candy and blood in the pockets and materials in the bag cover
 * `cost`.
 */
export function canAfford(cost: Bundle, inventory: Inventory, bag: readonly (BagItem | null)[]): boolean {
  return RESOURCES.every((r: Resource): boolean => inventory[r] >= cost[r])
    && MATERIALS.every((m: Material): boolean => bagCount(bag, m) >= cost[m]);
}
