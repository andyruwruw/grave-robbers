// Packages
import { BRUTE_MAX_HIT, BRUTE_WALL_DAMAGE } from '@halloween/shared/monsters/kinds/brute';

// Local Imports
import { Zombie } from './zombie';

// Types
import type { HitEffects, Target } from '../../types/hooks';

/**
 * A huge, slow zombie: stuns and staggers don't work on it, only a
 * brute-bane weapon pushes it around (and hurts it extra), it bites walls
 * harder, and its hits are capped.
 */
export class Brute<P extends Target> extends Zombie<P> {
  /**
   * Stuns and staggers don't work on it.
   * @returns False.
   */
  protected get staggers(): boolean {
    return false;
  }

  /**
   * How hard it bites a structure.
   * @returns The damage per bite.
   */
  protected get wallDamage(): number {
    return BRUTE_WALL_DAMAGE;
  }

  /**
   * Only a brute-bane hit pushes it, and only half as far.
   * @param knockback The knockback (tiles).
   * @param effects What the hit does besides damage.
   * @returns The knockback it takes.
   */
  protected adjustKnockback(knockback: number, effects: HitEffects<P>): number {
    return effects.bruteBane ? knockback * 0.5 : 0;
  }

  /**
   * A brute-bane hit hurts it extra.
   * @param amount The damage.
   * @param effects What the hit does besides damage.
   * @returns The damage it takes.
   */
  protected adjustDamage(amount: number, effects: HitEffects<P>): number {
    return amount * (effects.bruteBane ?? 1);
  }

  /**
   * What one of its hits does to a player, capped.
   * @returns The damage.
   */
  protected blow(): number {
    return Math.min(BRUTE_MAX_HIT, super.blow());
  }
}
