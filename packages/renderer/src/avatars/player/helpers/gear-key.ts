// Types
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * An infusion as a short tag (`@ecto2`), or nothing for plain gear.
 * @param infusion The infusion, if any.
 * @returns The tag.
 */
const tag = (infusion: Infusion | undefined): string => (infusion ? `@${infusion.essence}${infusion.level}` : '');

/**
 * Everything that decides what a player holds and wears (each slot's kind
 * and infusion, what's drawn, digging, a thrown glaive), as one string, so
 * the avatar rebuilds its gear only when it changes.
 * @param t The player's state.
 * @returns The key.
 */
export const gearKeyOf = (t: PlayerState): string => {
  const infusions = t.gearInfusion ?? {};
  const weapon = t.drawn ? t.drawn : `${t.gear.weapon}${tag(infusions.weapon)}`;
  return `${weapon}|${t.gear.offhand}${tag(infusions.offhand)}|${t.gear.armor}|${t.digging}|${t.thrown === true}`;
};
