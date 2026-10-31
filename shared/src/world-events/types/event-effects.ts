// Types
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * A sound a world event can announce itself with.
 */
export type EventSound = 'blood-moon';

/**
 * One thing a world event does to one system. An event lists as many as
 * it likes; `resolveEffects` combines every active event's effects into
 * `EventModifiers`, which the systems read. `blackout` and `announce` act
 * once, as the event starts.
 *
 * - `spawning`: replaces the spawner's pace (any left out keep their usual
 *   value).
 * - `spawn-mix`: adds weight (percent points, like SPAWN_MIX) to kinds in
 *   the trickle's mix, the only way some kinds (werewolves) come at all.
 * - `monster-power`, `monster-speed`: scale how hard monsters hit and how
 *   fast they move.
 * - `monster-hunt`: every monster knows where the nearest player is and
 *   goes for them.
 * - `blackout`: burning built lights sputter for `sputter` seconds and go
 *   out, each at its own moment within `within` seconds.
 * - `sky`: tints the moon, the ambient darkness (linear rgb), and the fog,
 *   which also thickens by `fogThicken`.
 * - `eyes`: turns monsters' glowing eyes this color.
 * - `aberration`: adds to the chromatic aberration (screen uv).
 * - `music`: keeps the drums at least this loud (0..1) outside a fight.
 * - `announce`: the TV plays `sound` and ducks the music to `duck` for
 *   `seconds`.
 */
export type EventEffect =
  | { on: 'spawning'; interval?: number; perPlayer?: number; lightsPerGhost?: number }
  | { on: 'spawn-mix'; mix: Partial<Record<MonsterKind, number>> }
  | { on: 'monster-power'; scale: number }
  | { on: 'monster-speed'; scale: number }
  | { on: 'monster-hunt' }
  | { on: 'blackout'; within: number; sputter: number }
  | { on: 'sky'; moon: string; ambient: [number, number, number]; fog: string; fogThicken: number }
  | { on: 'eyes'; color: string }
  | { on: 'aberration'; add: number }
  | { on: 'music'; drums: number }
  | { on: 'announce'; sound: EventSound; duck: number; seconds: number };

/**
 * Every active world event's effects combined, for the systems to read.
 */
export interface EventModifiers {
  /**
   * Spawner pace overrides (null keeps the usual value).
   */
  spawning: { interval: number | null; perPlayer: number | null; lightsPerGhost: number | null };

  /**
   * Weight added to kinds in the trickle's mix, each by its event's weight.
   */
  spawnMix: Partial<Record<MonsterKind, number>>;

  /**
   * Multiplier on monster damage.
   */
  monsterPower: number;

  /**
   * Multiplier on monster speed.
   */
  monsterSpeed: number;

  /**
   * Monsters go for the nearest player wherever they are.
   */
  hunt: boolean;

  /**
   * The sky's tint and how far it has come in, or null.
   */
  sky: { moon: string; ambient: [number, number, number]; fog: string; fogThicken: number; amount: number } | null;

  /**
   * Monster eye color and how far it has come in, or null.
   */
  eyes: { color: string; amount: number } | null;

  /**
   * Extra chromatic aberration (screen uv).
   */
  aberration: number;

  /**
   * Least drums level outside a fight, 0..1.
   */
  drums: number;
}
