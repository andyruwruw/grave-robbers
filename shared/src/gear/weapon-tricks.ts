// Types
import type { GearKind } from './types/gear-def';

/**
 * One line on each weapon's trick, for the phone.
 */
export const WEAPON_TRICKS: Partial<Record<GearKind, string>> = {
  'spear': 'Stabs straight ahead: hits everything in a line, nothing beside it',
  'scythe': 'A flat sweep nearly all the way around: hits everything near you at once',
  'battle-axe': 'Slow, crushing swings that cleave: harder for every monster caught in one',
  'short-sword': 'Quick, with a hand free for a shield',
  'greatsword': 'Huge sweeping blows',
  'flail': 'Ignores helmets, plate, and shields',
  'morning-star': 'A holy whip: lashes far in a line, double damage to vampires and witches, full damage to ghosts, and can stagger',
  'warhammer': 'Slow, crushing swings; half again as hard on brutes, and shoves them',
  'quarterstaff': 'A three-hit combo (top, bottom, twirl: the twirl hits harder); turns aside 15% of hits from the front, and can stun',
  'glaive': 'Alternates a wide sweep and a long stab; the tip hits 40% harder',
  'spiked-gauntlet': 'Two-fisted: jab, punch, uppercut, and wounds bleed. Landed hits charge a super uppercut that launches you and stuns',
  'bow': 'Hold to draw: a full draw hits twice as hard',
  'crossbow': 'Takes aim (it locks onto the nearest monster you point at), hits hard, and pierces; reloads between shots',
  'repeating-crossbow': 'A spinning drum fires bursts of holy bolts, then you must reload (slowly)',
  'blood-gun': 'A tight cone of heavy blood pellets',
  'musket': 'One devastating long-range shot',
};
