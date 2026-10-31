// Types
import type { GearKind } from '../../types/gear-def';
import type { WeaponPaths } from '../types/variant';

/**
 * The infusion paths of the ranged weapons, the shield, and the torch
 * (see `docs/infusions.md`). Each level-2 twist repeats what it keeps from
 * level 1. The torch and shield twists aren't weapon stats: read them
 * through `variantOf`.
 */
export const RANGED_VARIANTS: Partial<Record<GearKind, WeaponPaths>> = {
  'bow': {
    ecto: [
      {
        name: 'Spirit Bow',
        blurb: 'Arrows slow what they hit by 30% for 2s',
        twist: { slowOnHit: { chance: 1, factor: 0.7, seconds: 2 }, shotKind: 'spirit-arrow' },
      },
      {
        name: 'Wraithstring',
        blurb: 'Full-draw arrows pass through walls',
        twist: { slowOnHit: { chance: 1, factor: 0.7, seconds: 2 }, wallPass: 'drawn', shotKind: 'spirit-arrow' },
      },
    ],
    brimstone: [
      { name: 'Flame Bow', blurb: 'Arrows set what they hit burning', twist: { shotKind: 'fire-arrow' } },
      {
        name: 'Pyre Bow',
        blurb: 'Arrows leave a trail of fire on the ground',
        twist: { shotKind: 'fire-arrow', fireTrail: { seconds: 3, radius: 0.5 } },
      },
    ],
  },
  'crossbow': {
    holy: [
      { name: 'Silver Bolter', blurb: 'Also x1.5 to ghouls', twist: { bane: { ghoul: 1.5 } } },
      {
        name: 'Hunter\'s Arbalest',
        blurb: 'Pins vampires and ghouls 1s, cancelling a dash or pounce; aims twice as fast',
        twist: { bane: { ghoul: 1.5 }, pin: { seconds: 1, bonus: 1, kinds: ['vampire', 'ghoul'] }, sight: 0.175 },
      },
    ],
  },
  'repeating-crossbow': {
    fang: [
      { name: 'Bone Choir', blurb: 'Bolts bounce once off walls', twist: { bounces: 1 } },
      {
        name: 'Bone Rattler',
        blurb: 'A kill makes the next reload twice as fast',
        twist: { bounces: 1, reloadOnKill: 0.5 },
      },
    ],
  },
  'blood-gun': {
    brimstone: [
      { name: 'Brimstone Blunderbuss', blurb: 'Every pellet sets what it hits burning', twist: {} },
      {
        name: 'Hellmouth',
        blurb: 'A flamethrower: hold Action to spray a 3-tile cone, 1 blood every 0.5s',
        twist: { spray: { cone: 0.5, range: 3, rate: 6.5, targets: 3, falloff: 0.5, bloodEvery: 0.5 } },
      },
    ],
  },
  'musket': {
    ecto: [
      {
        name: 'Ephemeral Musket',
        blurb: 'The shot passes through walls, trees, and anything else in the way',
        twist: { wallPass: 'always', shotKind: 'ghost-bullet' },
      },
      {
        name: 'Ghostlock',
        blurb: 'Also pierces every monster in its line',
        twist: { wallPass: 'always', pierceAll: true, shotKind: 'ghost-bullet' },
      },
    ],
  },
  'shield': {
    silver: [
      { name: 'Mirror Shield', blurb: 'A raised block sends back arrows, potions, and ectoplasm', twist: { reflect: true } },
    ],
  },
  'torch': {
    brimstone: [
      { name: 'Brimstone Torch', blurb: 'Light reaches 60% farther', replacesPackage: true, twist: { lightMult: 1.6 } },
    ],
  },
};
