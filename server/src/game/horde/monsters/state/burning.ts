// Local Imports
import { Wound } from './wound';

/**
 * Burning (Enflamed hits, scorched ground, fire trails, flamethrowers).
 * Never on a ghost.
 */
export class Burning<P> extends Wound<P> {
  /**
   * Radius (tiles) of the light it gives off while it burns (Hell's
   * Edge), or 0.
   */
  light = 0;
}
