// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { ShotState } from '@halloween/shared/protocol/state/world-state';
import type { Player } from '../players/player';

/**
 * A bolt or gob of blood in flight: tiles of range left, and who shot it
 * (nobody for a sentry's, which never hit players).
 */
export interface Shot extends ShotState {
  /**
   * Tiles of range left.
   */
  left: number;

  /**
   * How high it flies; it stops at ground rising above this.
   */
  height: number;

  /**
   * Who shot it (null for a turret's or a monster's).
   */
  owner: Player | null;

  /**
   * Damage on a hit.
   */
  damage: number;

  /**
   * How far a hit knocks back.
   */
  knockback: number;

  /**
   * Tiles per second.
   */
  speed: number;

  /**
   * Whether it's a monster's (it hits players and flies through monsters).
   */
  hostile: boolean;

  /**
   * The weapon that fired it, for what it does to each monster (null for
   * a monster's shot).
   */
  weapon: GearKind | null;

  /**
   * Whose it is for the kill feed.
   */
  by: string;

  /**
   * For a potion, how far it flies before bursting (it hits nothing on
   * the way).
   */
  land?: number;

  /**
   * More monsters a piercing bolt goes through.
   */
  pierce?: number;

  /**
   * The monsters a piercing bolt already hit.
   */
  struck?: number[];
}
