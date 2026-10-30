// Types
import type { HordeContext } from './horde-context';
import type { MonsterRoster } from './monster-roster';
import type { HordeHooks, Target } from './types/hooks';

/**
 * One part of the horde. Parts hold the shared context and read through
 * it live, never keeping copies of its state.
 */
export abstract class HordePart<P extends Target> {
  /**
   * Sets the part up on the horde's shared state.
   * @param _horde What the horde's parts share.
   */
  constructor(protected readonly _horde: HordeContext<P>) {}

  /**
   * Every monster on the map.
   * @returns The roster.
   */
  protected get roster(): MonsterRoster<P> {
    return this._horde.roster;
  }

  /**
   * How the horde reaches back into the game.
   * @returns The hooks.
   */
  protected get hooks(): HordeHooks<P> {
    return this._horde.hooks;
  }
}
