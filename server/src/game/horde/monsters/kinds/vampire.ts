// Packages
import { VAMPIRE_WALL_DAMAGE } from '@halloween/shared/monsters/kinds/vampire';

// Local Imports
import { ShadowWalker } from '../shadow-walker';

// Types
import type { Target } from '../../types/hooks';

/**
 * A vampire: fast, keeps to the dark, smashes walls hard, and is hurt by
 * being knocked down a level.
 */
export class Vampire<P extends Target> extends ShadowWalker<P> {
  /**
   * A knockback drop down a level hurts it.
   * @returns True.
   */
  protected get takesFallDamage(): boolean {
    return true;
  }

  /**
   * How hard it bites a structure.
   * @returns The damage per bite.
   */
  protected get wallDamage(): number {
    return VAMPIRE_WALL_DAMAGE;
  }
}
