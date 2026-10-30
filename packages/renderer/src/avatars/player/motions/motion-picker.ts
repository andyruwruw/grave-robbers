// Local Imports
import { AxeSwingMotion } from './axe-swing-motion';
import { DigMotion } from './dig-motion';
import { FistsMotion } from './fists-motion';
import { LashMotion } from './lash-motion';
import { ReloadMotion } from './reload-motion';
import { ShotMotion } from './shot-motion';
import { StabMotion } from './stab-motion';
import { StaffMotion } from './staff-motion';
import { SweepMotion } from './sweep-motion';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { WeaponMotion } from './weapon-motion';

/**
 * The axe-style swing (one shared instance: motions hold no state).
 */
const AXE_SWING = new AxeSwingMotion();

/**
 * The scythe's (and glaive's) sweep.
 */
const SWEEP = new SweepMotion();

/**
 * The spear's (and glaive's) stab.
 */
const STAB = new StabMotion();

/**
 * Digging with the spade.
 */
const DIG = new DigMotion();

/**
 * The morning star's lash.
 */
const LASH = new LashMotion();

/**
 * The quarterstaff.
 */
const STAFF = new StaffMotion();

/**
 * The gauntlets.
 */
const FISTS = new FistsMotion();

/**
 * How a gun fires.
 */
export const SHOT_MOTION = new ShotMotion();

/**
 * How a crossbow reloads.
 */
export const RELOAD_MOTION = new ReloadMotion();

/**
 * The motion for a melee swing of what's in hand: digging with the spade,
 * the morning star's lash, the quarterstaff, the gauntlets, the glaive
 * (its second hit stabs, the others sweep), the scythe's sweep, the
 * spear's stab, and an axe-style swing for everything else.
 * @param held What's in hand (null for the bare hammer).
 * @param digging Whether it's digging a grave.
 * @param combo Which hit of a combo this swing is.
 * @returns The motion.
 */
export function pickMeleeMotion(held: GearKind | null, digging: boolean, combo: number): WeaponMotion {
  if (digging) {
    return DIG;
  } else if (held === 'morning-star') {
    return LASH;
  } else if (held === 'quarterstaff') {
    return STAFF;
  } else if (held === 'spiked-gauntlet') {
    return FISTS;
  } else if (held === 'glaive') {
    return combo === 1 ? STAB : SWEEP;
  } else if (held === 'scythe') {
    return SWEEP;
  } else if (held === 'spear') {
    return STAB;
  }
  return AXE_SWING;
}
