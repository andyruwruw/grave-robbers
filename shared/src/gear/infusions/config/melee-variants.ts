// Local Imports
import { stock } from '../../../goods/goods';
import { GHOST_SLOW, GHOST_SLOW_SECONDS } from '../../../monsters/kinds/ghost';

// Types
import type { GearKind } from '../../types/gear-def';
import type { WeaponPaths } from '../types/variant';

/**
 * The infusion paths of the infused hammer and the lighter melee weapons
 * (see `docs/infusions.md`). Each level-2 twist repeats what it keeps from
 * level 1.
 */
export const MELEE_VARIANTS: Partial<Record<GearKind, WeaponPaths>> = {
  'infused-hammer': {
    tendons: [
      { name: 'Monster Mash', blurb: 'Two-handed and brutal: hits harder, throws farther, and can stun', twist: {} },
      { name: 'Flesh-Sprung Maul', blurb: 'Swings through a 200° arc and kicks up dust', twist: { arcCos: -0.17 } },
    ],
    brimstone: [
      { name: 'Enflamed Hammer', blurb: 'Sets what it hits burning; harder on zombies, brutes, and ghouls', twist: {} },
      {
        name: 'Hellfire Hammer',
        blurb: 'Hits scorch the ground for 4s; zombies, brutes, and ghouls in it keep burning',
        twist: { scorch: { seconds: 4, radius: 0.8, kinds: ['zombie', 'brute', 'ghoul'] } },
      },
    ],
  },
  'spear': {
    fang: [
      { name: 'Ghoul Poker', blurb: '20% chance to poison (0.5 a second for 4s)', twist: { poison: { chance: 0.2, rate: 0.5, seconds: 4 } } },
      {
        name: 'The Impaler',
        blurb: 'A monster on the tip is pinned 1.5s and takes +50% from other players',
        twist: { poison: { chance: 0.2, rate: 0.5, seconds: 4 }, pin: { seconds: 1.5, bonus: 1.5, tip: true } },
      },
    ],
  },
  'short-sword': {
    ecto: [
      { name: 'Ephemeral Blade', blurb: 'Cuts skeletons deep, and ghosts take it in full', twist: {} },
      {
        name: 'Phantom Edge',
        blurb: '20% chance to slow what it hits like a ghost\'s ectoplasm',
        twist: { slowOnHit: { chance: 0.2, factor: GHOST_SLOW, seconds: GHOST_SLOW_SECONDS } },
      },
    ],
    holy: [
      {
        name: 'Silvered Shortsword',
        blurb: 'x1.4 to vampires and ghouls',
        prefix: 'Silvered',
        cost: stock({ silver: 6, 'holy-water': 12 }),
        replacesPackage: true,
        twist: { bane: { vampire: 1.4, ghoul: 1.4 } },
      },
      {
        name: 'Moonsilver Saber',
        blurb: 'Glows faintly; one-shots a vampire or ghoul, then dims for 12s',
        cost: stock({ silver: 12, 'holy-water': 24 }),
        twist: { lightRadius: 1, slayEvery: { kinds: ['vampire', 'ghoul'], seconds: 12 } },
      },
    ],
  },
  'ritual-knife': {
    hex: [
      { name: 'Bloodletter', blurb: 'Hits bleed; bleeding kills heal double', twist: { bleed: 1, bleedKillHealMult: 2 } },
      {
        name: 'Heart Devourer',
        blurb: 'Kill heals past full become up to 2 overheal hearts',
        twist: { bleed: 1, bleedKillHealMult: 2, overheal: { max: 2, seconds: 15 } },
      },
    ],
  },
  'scythe': {
    ecto: [
      { name: 'Ghostreaper', blurb: 'Reaps skeletons, and ghosts take it in full across the sweep', twist: {} },
      {
        name: 'Wailing Sickle',
        blurb: 'Every 2 kills, the next sweep is a 3-tile wail all around',
        twist: { wail: { kills: 2, radius: 3, mult: 1.5, knockback: 2.5 } },
      },
    ],
    hex: [
      { name: 'Reaper\'s Call', blurb: 'Kills steal 1 health', twist: { killHeal: 1 } },
      {
        name: 'Death\'s Harvest',
        blurb: 'Stolen health overheals; while overhealed, +10% damage',
        twist: { killHeal: 1, overheal: { max: 2, seconds: 15 }, overhealDamage: 1.1 },
      },
    ],
  },
  'battle-axe': {
    tendons: [
      { name: 'Bonesplitter', blurb: 'Each extra monster in the swing adds +5% stun chance', twist: { stunPerExtra: 0.05 } },
      {
        name: 'Headsman\'s Axe',
        blurb: 'A swing that kills 2 or more makes the next one skip its windup',
        twist: { stunPerExtra: 0.05, multiKillSkip: 2 },
      },
    ],
  },
  'greatsword': {
    brimstone: [
      { name: 'Hell\'s Edge', blurb: 'Burning monsters give off light', twist: { burn: { light: 1.5 } } },
      {
        name: 'Infernal Mandate',
        blurb: 'Burning kills explode for 3, at most 3 blasts a second',
        twist: { burn: { light: 1.5 }, deathBlast: { damage: 3, radius: 1.5, perSecond: 3, burningOnly: true } },
      },
    ],
    hex: [
      { name: 'Doomblade', blurb: 'Execution also counts cursed monsters', twist: { executeCursed: 1.25 } },
      {
        name: 'Executioner\'s Oath',
        blurb: 'A cursed monster under 20% health dies outright',
        twist: { executeCursed: 1.25, cursedKillBelow: 0.2 },
      },
    ],
  },
  'flail': {
    holy: [
      {
        name: 'Censer Flail',
        blurb: 'Swings leave incense ghosts won\'t enter and demons burn in',
        twist: { incense: { seconds: 4, radius: 1.2, rate: 1, heal: 0, max: 3 } },
      },
      {
        name: 'Thurible of Judgment',
        blurb: 'Incense lasts 6s and slowly heals players in it',
        twist: { incense: { seconds: 6, radius: 1.2, rate: 1, heal: 0.25, max: 3 } },
      },
    ],
  },
};
