// Types
import type { BurnTrick } from '@halloween/shared/gear/types/status-tricks';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { PatchState } from '@halloween/shared/protocol/state/world-state';
import type { Player } from '../../../players/player';

/**
 * A patch of ground an infused weapon left: scorched ground, a bit of
 * fire trail, or a cloud of incense (see `PatchSystem`).
 */
export interface Patch {
  /**
   * Stable id for the display.
   */
  id: number;

  /**
   * What it is.
   */
  kind: PatchState['kind'];

  /**
   * Where it is (tiles).
   */
  x: number;

  /**
   * Where it is (tiles).
   */
  y: number;

  /**
   * Its radius (tiles).
   */
  radius: number;

  /**
   * When it was laid or last refreshed (game clock).
   */
  at: number;

  /**
   * When it's gone (game clock).
   */
  until: number;

  /**
   * Whose it is: credited with its kills, and counted against their
   * incense limit.
   */
  by: Player;

  /**
   * The burn it keeps monsters standing in it under, if any.
   */
  burn: BurnTrick | null;

  /**
   * Only these kinds burn in it (null: anything with a body).
   */
  kinds: MonsterKind[] | null;

  /**
   * Damage a second to a demon inside (incense), or 0.
   */
  rate: number;

  /**
   * Health a second it gives players inside (incense), or 0.
   */
  heal: number;
}
