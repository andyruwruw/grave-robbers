// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { MonsterArmor } from '@halloween/shared/monsters/armor';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * What an idle zombie is drawn toward when it picks where to shamble
 * (`ZOMBIE_LURES`), if anything.
 */
export type Lure = 'players' | 'graves' | null;

/**
 * A new monster's random rolls, made in a fixed order (see `rollTraits`).
 */
export interface MonsterTraits {
  /**
   * Which way it faces.
   */
  facing: number;

  /**
   * The junk weapon it carries, or null.
   */
  held: GearKind | null;

  /**
   * The armor it wears, or null.
   */
  armor: MonsterArmor | null;

  /**
   * What it's drawn toward when idle.
   */
  lure: Lure;

  /**
   * Its own speed multiplier, so a crowd doesn't move in step.
   */
  pace: number;
}

/**
 * Everything a monster is made with.
 */
export interface MonsterInit {
  /**
   * Its id.
   */
  id: number;

  /**
   * What it is.
   */
  kind: MonsterKind;

  /**
   * Where it appears (tiles).
   */
  x: number;

  /**
   * Where it appears (tiles).
   */
  y: number;

  /**
   * Full health, set by the world level when it appeared.
   */
  hp: number;

  /**
   * How hard it hits, set by the world level when it appeared.
   */
  power: number;

  /**
   * Its random rolls.
   */
  traits: MonsterTraits;
}
