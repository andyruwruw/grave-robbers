// Types
import type { GearKind } from '../../gear/types/gear-def';
import type { MonsterArmor } from '../../monsters/armor';
import type { MonsterKind } from '../../monsters/monster-kinds';

/**
 * A monster as the server broadcasts it.
 */
export interface MonsterState {
  /**
   * Unique id among the monsters.
   */
  id: number;

  /**
   * What it is.
   */
  kind: MonsterKind;

  /**
   * World position in tiles.
   */
  x: number;

  /**
   * World y in tiles.
   */
  y: number;

  /**
   * Facing angle in radians, 0 = east, PI/2 = south.
   */
  facing: number;

  /**
   * Walking (or drifting) this tick.
   */
  moving: boolean;

  /**
   * Picked up by the TV's mouse.
   */
  lifted: boolean;

  /**
   * Junk a zombie carries (and drops when it dies), if any.
   */
  held: GearKind | null;

  /**
   * What a zombie or brute wears, which shrugs off part of each hit.
   */
  armor: MonsterArmor | null;

  /**
   * Hit counter; the display flashes the monster whenever it goes up.
   */
  hurts: number;

  /**
   * Health left, 0 to 1.
   */
  health: number;

  /**
   * Attack counter; the display animates a lunge whenever it goes up.
   */
  attacks: number;

  /**
   * Stumble counter; the display plays a lurch-and-flail whenever it goes
   * up.
   */
  stumbles: number;

  /**
   * Chasing (or searching for) someone it saw.
   */
  hunting: boolean;

  /**
   * A ghost sitting in a light, about to snuff it.
   */
  draining: boolean;

  /**
   * Shadow-step counter: when it goes up the display jumps the monster to
   * its new spot instead of sliding it there.
   */
  blinks: number;

  /**
   * A witch's broom swipes (a werewolf's pounces, a necromancer's novas), counted like `attacks`.
   */
  swipes: number;

  /**
   * What's afflicting it, as STATUS_ bits (`monsters/monster-status.ts`;
   * 0 for nothing).
   */
  status: number;
}
