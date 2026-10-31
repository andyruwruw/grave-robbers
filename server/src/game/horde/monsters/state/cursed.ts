// Local Imports
import { Wound } from './wound';

/**
 * A hex curse: damage a second, slower, and hurt more by everyone.
 */
export class Cursed<P> extends Wound<P> {
  /**
   * What damage from anyone is multiplied by while it lasts.
   */
  taken = 1;

  /**
   * What its speed is multiplied by while it lasts.
   */
  slow = 1;
}
