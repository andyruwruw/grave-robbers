// Types
import type { GearKind } from '../../types/gear-def';
import type { WeaponPaths } from '../types/variant';

/**
 * The infusion paths of the heavy and late melee weapons (see
 * `docs/infusions.md`). Each level-2 twist repeats what it keeps from
 * level 1.
 */
export const HEAVY_VARIANTS: Partial<Record<GearKind, WeaponPaths>> = {
  'morning-star': {
    holy: [
      {
        name: 'Dawn\'s Scourge',
        blurb: 'Hits chain lightning to 2 nearby for 1',
        twist: { chain: { targets: 2, damage: 1, radius: 2.5, stun: 0 } },
      },
      {
        name: 'The Seraphic Chain',
        blurb: 'Chain jumps to 3 for 0.75, further, with a 15% stun',
        twist: { chain: { targets: 3, damage: 0.75, radius: 3.5, stun: 0.15 } },
      },
    ],
    brimstone: [
      {
        name: 'Requiem Lash',
        blurb: 'Dying monsters explode in righteous glory',
        twist: { deathBlast: { damage: 2, radius: 1.5, perSecond: 3 } },
      },
      {
        name: 'Requiem Pyre',
        blurb: 'Deaths explode harder and set nearby monsters burning',
        twist: { deathBlast: { damage: 3, radius: 2, perSecond: 3, ignite: true } },
      },
    ],
  },
  'warhammer': {
    tendons: [
      {
        name: 'Titan\'s Maul',
        blurb: 'Every strike is a ground slam: 30% damage and a 2-tile shove around you',
        twist: { slam: { mult: 0.3, radius: 2, knockback: 1.5 } },
      },
      {
        name: 'Earthshaker',
        blurb: 'Every 3rd hit cracks a 4-tile fissure ahead that launches and stuns',
        twist: { slam: { mult: 0.3, radius: 2, knockback: 1.5 }, fissure: { every: 3, length: 4, width: 0.6, mult: 0.5, stun: 1, knockback: 1.5 } },
      },
    ],
  },
  'quarterstaff': {
    holy: [
      {
        name: 'Pilgrim\'s Staff',
        blurb: 'The combo\'s last hit does +40% with +0.6 reach',
        twist: { combo: [{ mult: 1 }, { mult: 1 }, { mult: 1.82, reach: 0.6 }] },
      },
      {
        name: 'Bishop\'s Crozier',
        blurb: 'The combo\'s last hit does +75% and heals 1',
        twist: { combo: [{ mult: 1 }, { mult: 1 }, { mult: 2.28, reach: 0.6 }], finishHeal: 1 },
      },
    ],
  },
  'glaive': {
    hex: [
      {
        name: 'Soulbound Glaive',
        blurb: 'The stab becomes a throw that flies back to you',
        twist: { throwStab: { range: 5, speed: 12, autoAim: false, arc: 0 } },
      },
      {
        name: 'Wraith Glaive',
        blurb: 'The throw auto-aims and arcs on the way back to hit more',
        twist: { throwStab: { range: 5, speed: 12, autoAim: true, arc: 1.2 } },
      },
    ],
  },
  'spiked-gauntlet': {
    holy: [
      { name: 'Holy Gauntlets', blurb: 'Glow gold while charged', twist: {} },
      {
        name: 'Archangel\'s Fists',
        blurb: 'The super uppercut sends out a holy nova that shoves demons away',
        twist: { nova: { radius: 3, knockback: 3, kinds: ['demon'] } },
      },
    ],
    hex: [
      {
        name: 'Plague Knuckles',
        blurb: '25% chance a bleeding zombie turns on other monsters for 3s',
        twist: { turn: { chance: 0.25, seconds: 3, kinds: ['zombie'] } },
      },
      {
        name: 'Grave Fists',
        blurb: 'Zombies that die from bleed rise on your side for 3s',
        twist: { turn: { chance: 0.25, seconds: 3, kinds: ['zombie'] }, raise: { seconds: 3, kinds: ['zombie'] } },
      },
    ],
  },
};
