// Local Imports
import { AddedPerk } from './added-perk';
import { CustomPerk } from './custom-perk';
import { ScaledPerk } from './scaled-perk';
import { WeaponPerk } from './weapon-perk';

// Types
import type { GearKind } from '../types/gear-def';
import type { WeaponStats } from '../types/weapon-stats';

/**
 * What each upgrade of a weapon does (applied in `weaponStats`). Only the
 * axe and hammer line hits harder; every other weapon gets better at its
 * own trick.
 */
export const WEAPON_PERKS: Partial<Record<GearKind, WeaponPerk>> = {
  'hammer': new AddedPerk('Handy', 'chops, mines, and digs one more per hit', 'chop', 1, 'exact'),
  'spear': new ScaledPerk('Longer reach', '+8% reach', 'reach', 0.08, 'tenth'),
  'stake': new WeaponPerk('Seasoned wood', 'one more use before it breaks'),
  'ritual-knife': new AddedPerk('Bloodthirst', 'each kill heals 2 more', 'feast', 2, 'exact'),
  'scythe': new CustomPerk('Soul harvest', '+1 blood from each kill', (stats: WeaponStats, base: WeaponStats, level: number): void => {
    stats.harvest = level;
  }),
  'battle-axe': new ScaledPerk('Heavy blows', '+20% damage', 'damage', 0.2, 'tenth'),
  'warhammer': new ScaledPerk('Heavy blows', '+20% damage', 'damage', 0.2, 'tenth'),
  'short-sword': new ScaledPerk('Relentless assault', 'swings 8% faster', 'cooldown', -0.08, 'hundredth'),
  'greatsword': new CustomPerk('Execution', '+25% damage to the badly wounded', (stats: WeaponStats, base: WeaponStats, level: number): void => {
    stats.execute = 1 + 0.25 * level;
  }),
  'flail': new ScaledPerk('Long chain', '+10% reach', 'reach', 0.1, 'tenth'),
  'morning-star': new AddedPerk('Concussion', '+15% chance to stagger', 'stagger', 0.15, 'tenth'),
  'quarterstaff': new AddedPerk('Parry', 'turns aside 10% more of each hit from the front', 'deflect', -0.1, 'tenth'),
  'glaive': new CustomPerk('Wide sweep', '+15% wider sweep', (stats: WeaponStats, base: WeaponStats, level: number): void => {
    stats.arcCos = Math.round(Math.cos(Math.min(Math.PI, Math.acos(base.arcCos) * (1 + 0.15 * level))) * 100) / 100;
  }),
  'spiked-gauntlet': new ScaledPerk('Lacerate', 'wounds bleed 50% faster', 'bleed', 0.5, 'exact'),
  'bow': new ScaledPerk('Quick draw', 'draws 20% faster', 'draw', -0.2, 'hundredth'),
  'crossbow': new AddedPerk('Piercing bolts', 'bolts go through one more monster', 'pierce', 1, 'exact'),
  'repeating-crossbow': new AddedPerk('Bigger magazine', 'one more bolt before reloading', 'burst', 1, 'exact'),
  'blood-gun': new AddedPerk('Wider bore', 'one more pellet a shot', 'pellets', 1, 'exact'),
  'musket': new ScaledPerk('Quick reload', 'shoots 10% faster', 'cooldown', -0.1, 'hundredth'),
};
