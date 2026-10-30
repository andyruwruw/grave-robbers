// Local Imports
import { MonsterRoster } from './monster-roster';
import { HeatMap } from './senses/heat-map';
import { LightField } from './senses/light-field';
import { Sight } from './senses/sight';
import { Wards } from './wards';

// Types
import type { Monster } from './monsters/monster';
import type { HordeHooks, Target } from './types/hooks';

/**
 * What the horde's parts and every monster share: the game's hooks, the
 * roster, the senses and the wards. Monsters reach the horde only through
 * this, never through Horde itself.
 */
export class HordeContext<P extends Target> {
  /**
   * Every monster on the map.
   */
  readonly roster = new MonsterRoster<P>();

  /**
   * Which tiles are lit this tick.
   */
  readonly light = new LightField();

  /**
   * Where players have been and where the graves are.
   */
  readonly heat = new HeatMap();

  /**
   * Who each monster can see this tick.
   */
  readonly sight = new Sight<P>(this);

  /**
   * This tick's effigies, obelisks and soul cages.
   */
  readonly wards = new Wards<P>(this);

  /**
   * Sets up the shared state.
   * @param hooks How the horde reaches back into the game.
   */
  constructor(readonly hooks: HordeHooks<P>) {}

  /**
   * Removes a monster that was killed; `angle` is the way the killing blow
   * pushed it, so the display can throw the pieces that way.
   * @param m The monster.
   * @param angle The way it was pushed (radians).
   * @param killer Who gets the kill when it wasn't a hit landing now.
   */
  kill(m: Monster<P>, angle: number, killer?: P | null): void {
    this.roster.delete(m.id);
    this.hooks.event({ t: 'monster-death', x: m.x, y: m.y, kind: m.kind, angle, held: m.held, armor: m.armor }, killer ?? undefined);
  }
}
