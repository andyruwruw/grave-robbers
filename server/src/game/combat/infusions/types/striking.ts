// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Player } from '../../../players/player';

/**
 * The melee strike landing right now (see `InfusionSystem.begin`): who
 * swings, with what, and how many monsters it has killed so far, so kills
 * during it go by the swing's own stats.
 */
export interface Striking {
  /**
   * Who swings.
   */
  by: Player;

  /**
   * The swing's stats (its combo step, a charged wail, or what it's made
   * with when it isn't the weapon).
   */
  weapon: WeaponStats;

  /**
   * Monsters it has killed so far (blasts and chains included).
   */
  kills: number;

  /**
   * The status bits of the monster the strike's blow is landing on, from
   * just before it landed, for a kill by that blow that cares what it
   * was suffering from already (cleared once the blow is in).
   */
  before: Map<number, number>;
}
