// Packages
import { resolveEffects } from '@halloween/shared/world-events/helpers/resolve-effects';

// Local Imports
import { MonsterRoster } from './monster-roster';
import { HeatMap } from './senses/heat-map';
import { LightField } from './senses/light-field';
import { ReachMap } from './senses/reach-map';
import { Sight } from './senses/sight';
import { Wards } from './wards';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { EventModifiers } from '@halloween/shared/world-events/types/event-effects';
import type { Monster } from './monsters/monster';
import type { DeathCause } from './types/death';
import type { HordeHooks, Target } from './types/hooks';
import type { Burst } from './types/monster';

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
   * This tick's world event effects (see `resolveEffects`).
   */
  mods: EventModifiers = resolveEffects([]);

  /**
   * Share of the usual monster caps spawning fills, lowered by the
   * server's `LoadGovernor` while ticks run slow.
   */
  loadScale = 1;

  /**
   * Which goals chasing monsters can actually get to (see `ReachMap`).
   */
  readonly reach = new ReachMap();

  /**
   * What all damage monsters take is multiplied by (the server's
   * difficulty, `DifficultyLevel.dealt`).
   */
  dealt = 1;

  /**
   * Bloaters that died since the last tick, waiting to burst (see `Bursts`).
   */
  readonly bursts: Burst[] = [];

  /**
   * Brings a monster up at (x, y) for a necromancer (set by `Horde`).
   * @returns Its id, or null.
   */
  raise: (kind: MonsterKind, x: number, y: number) => number | null = (): null => null;

  /**
   * The game clock as of the last step (for status bits).
   */
  now = 0;

  /**
   * This tick's incense clouds, which ghosts won't enter (set by the game
   * through `Horde.setIncense`).
   */
  incense: { x: number; y: number; radius: number }[] = [];

  /**
   * Sets up the shared state.
   * @param hooks How the horde reaches back into the game.
   */
  constructor(readonly hooks: HordeHooks<P>) {}

  /**
   * Removes a monster that was killed; `angle` is the way the killing blow
   * pushed it, so the display can throw the pieces that way. A zombie
   * that bled out from a Grave Fists wound rises on its maker's side.
   * @param m The monster.
   * @param angle The way it was pushed (radians).
   * @param killer Who gets the kill when it wasn't a hit landing now.
   * @param cause What finished it off.
   */
  kill(m: Monster<P>, angle: number, killer?: P | null, cause: DeathCause = 'other'): void {
    const status = m.status();
    const bleedBy = m.bleeding.active(this.now) ? m.bleeding.by : null;
    this.roster.delete(m.id);
    m.dying();
    this.hooks.event({ t: 'monster-death', x: m.x, y: m.y, kind: m.kind, angle, held: m.held, armor: m.armor, raised: m.raised }, killer ?? undefined);
    this.hooks.died?.({ id: m.id, kind: m.kind, x: m.x, y: m.y, killer: killer ?? null, cause, status, bleedBy, raised: m.raised, ally: m.turned.ally });
    const rise = m.bleeding.raise;
    if (cause === 'bleed' && !m.raised && rise && rise.kinds.includes(m.kind) && m.bleeding.by) {
      this.raiseAlly(m.kind, m.x, m.y, rise.seconds, m.bleeding.by);
    }
  }

  /**
   * Brings a monster up at (x, y) on a player's side for `seconds`, then
   * it falls for good (Grave Fists). It leaves nothing when it dies.
   * @param kind What rises.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param seconds How long it fights.
   * @param by Who it fights for.
   * @returns Its id, or null if it couldn't rise.
   */
  raiseAlly(kind: MonsterKind, x: number, y: number, seconds: number, by: P | null): number | null {
    const id = this.raise(kind, x, y);
    const m = id === null ? undefined : this.roster.get(id);
    if (!m || !m.turnOn(seconds, by, true, this.now)) {
      if (m) {
        this.roster.delete(m.id);
      }
      return null;
    }
    this.hooks.event({ t: 'raise', x, y });
    return m.id;
  }
}
