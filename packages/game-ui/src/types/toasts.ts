// Types
import type { Resource } from '@halloween/shared/goods/goods';

/**
 * One "+6 candy" note: what was gained, how much (added up while it shows),
 * and an id that changes with each bump so it pops again.
 */
export interface PickupToast {
  /**
   * What was gained.
   */
  resource: Resource;

  /**
   * How much, added up while it shows.
   */
  amount: number;

  /**
   * Changes with each bump so the note pops again.
   */
  id: number;
}
