// Local Imports
import { FOLLOW_THROUGH } from './config/monster-motion';
import { MonsterAvatar } from './monster-avatar';

/**
 * One of the newer kinds, whose attack charges through the windup and
 * strikes with a follow through (skeletons, witches, ghouls, demons).
 */
export abstract class ChargingMonsterAvatar extends MonsterAvatar {
  /**
   * The windup plus the follow through.
   * @returns Seconds.
   */
  protected attackDuration(): number {
    return this._attack.windup + FOLLOW_THROUGH;
  }

  /**
   * How far into its attack it is: `charge` (0..1, eased) builds through
   * the windup and lets go just after, and `strike` (0..1) snaps up as the
   * attack lands and fades through the follow through.
   * @returns The charge and strike.
   */
  protected attackPhase(): { charge: number; strike: number } {
    const a = this._attack.age;
    if (a >= this._attack.time) {
      return { charge: 0, strike: 0 };
    }
    if (a < this._attack.windup) {
      const t = a / this._attack.windup;
      return { charge: t * t * (3 - 2 * t), strike: 0 };
    }
    const s = (a - this._attack.windup) / (this._attack.time - this._attack.windup);
    return { charge: Math.max(0, 1 - s * 4), strike: s < 0.2 ? s / 0.2 : (1 - s) / 0.8 };
  }
}
