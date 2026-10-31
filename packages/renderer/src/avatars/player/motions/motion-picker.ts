// Packages
import { variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';

// Local Imports
import { GLAIVE_SWEEP, SCYTHE_SWEEP } from '../config/player-poses';
import { AxeSwingMotion } from './axe-swing-motion';
import { DigMotion } from './dig-motion';
import { FistsMotion } from './fists-motion';
import { LashMotion } from './lash-motion';
import { ReloadMotion } from './reload-motion';
import { ShotMotion } from './shot-motion';
import { SprayMotion } from './spray-motion';
import { StabMotion } from './stab-motion';
import { StaffMotion } from './staff-motion';
import { SweepMotion } from './sweep-motion';
import { ThrowMotion } from './throw-motion';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { WeaponMotion } from './weapon-motion';

/**
 * The Soulbound and Wraith Glaive's throw.
 */
const THROW = new ThrowMotion();

/**
 * The Hellmouth's held spray.
 */
const SPRAY = new SprayMotion();

/**
 * The axe-style swing (one shared instance: motions hold no state).
 */
const AXE_SWING = new AxeSwingMotion();

/**
 * The scythe's sweep, nearly all the way around.
 */
const SCYTHE = new SweepMotion(SCYTHE_SWEEP);

/**
 * The glaive's sweep, narrower than the scythe's.
 */
const GLAIVE = new SweepMotion(GLAIVE_SWEEP);

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
 * (its second hit stabs, or throws when infused to throw, the others
 * sweep), the scythe's sweep, the spear's stab, and an axe-style swing for
 * everything else.
 * @param held What's in hand (null for the bare hammer).
 * @param digging Whether it's digging a grave.
 * @param combo Which hit of a combo this swing is.
 * @param infusion What's in hand's infusion, if any.
 * @returns The motion.
 */
export function pickMeleeMotion(held: GearKind | null, digging: boolean, combo: number, infusion: Infusion | null = null): WeaponMotion {
  if (digging) {
    return DIG;
  } else if (held === 'morning-star') {
    return LASH;
  } else if (held === 'quarterstaff') {
    return STAFF;
  } else if (held === 'spiked-gauntlet') {
    return FISTS;
  } else if (held === 'glaive') {
    return combo !== 1 ? GLAIVE : variantOf(held, infusion)?.twist.throwStab ? THROW : STAB;
  } else if (held === 'scythe') {
    return SCYTHE;
  } else if (held === 'spear') {
    return STAB;
  }
  return AXE_SWING;
}

/**
 * The motion for firing a gun: the Hellmouth's held spray (a weapon
 * infused to `spray`), or the usual kick.
 * @param held The gun in hand.
 * @param infusion Its infusion, if any.
 * @returns The motion.
 */
export function pickShotMotion(held: GearKind, infusion: Infusion | null = null): WeaponMotion {
  return variantOf(held, infusion)?.twist.spray ? SPRAY : SHOT_MOTION;
}
