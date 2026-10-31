// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * A monster as an area effect sees it (what `Horde.targets` lists).
 */
export interface MonsterSpot {
  /**
   * Its id.
   */
  id: number;

  /**
   * What it is.
   */
  kind: MonsterKind;

  /**
   * Where it is (tiles).
   */
  x: number;

  /**
   * Where it is (tiles).
   */
  y: number;
}
