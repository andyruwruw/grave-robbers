// Local Imports
import { Wound } from './wound';

// Types
import type { RaiseTrick } from '@halloween/shared/gear/types/special-tricks';

/**
 * A bleeding wound. It remembers whether the weapon that opened it
 * raises what dies of it (Grave Fists).
 */
export class Bleeding<P> extends Wound<P> {
  /**
   * What a death from this bleed rises as on its maker's side, if
   * anything (the last bleeding hit's `raise`).
   */
  raise: RaiseTrick | null = null;
}
