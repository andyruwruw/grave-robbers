// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Goods } from '../goods/goods';
import type { MonsterArmor } from '../monsters/armor';
import type { MonsterKind } from '../monsters/monster-kinds';

/**
 * One-off things that happened during a tick, for display effects. A hit
 * on a tile carries how much of it is left, 0 to 1 (0 once it's gone).
 */
export type GameEvent =
  /**
   * A tree, rock, or structure was hit.
   */
  | { t: 'chips'; tx: number; ty: number; chip: 'wood' | 'stone'; health: number }
  /**
   * A turret fired.
   */
  | { t: 'turret'; tx: number; ty: number; fires: 'shot' | 'sweep' | 'flame'; angle: number }
  /**
   * A grave or landmark was dug at (`done` once it's emptied).
   */
  | { t: 'dig'; tx: number; ty: number; tile: 'tombstone' | 'cross' | 'statue' | 'crypt' | 'mausoleum'; done: boolean; health: number }
  /**
   * Someone found a blueprint.
   */
  | { t: 'blueprint'; finder: string; finderColor: string; label: string }
  /**
   * Someone upgraded a node, opening others.
   */
  | { t: 'research'; finder: string; finderColor: string; label: string; level: number; opens: string[] }
  /**
   * Candy fell out of something.
   */
  | { t: 'candy'; x: number; y: number; amount: number }
  /**
   * Someone picked up goods.
   */
  | { t: 'pickup'; x: number; y: number; goods: Exclude<Goods, 'candy'> }
  /**
   * Someone was killed.
   */
  | { t: 'kill'; killer: string; killerColor: string | null; victim: string; victimColor: string }
  /**
   * A monster died.
   */
  | { t: 'monster-death'; x: number; y: number; kind: MonsterKind; angle: number; held: GearKind | null; armor: MonsterArmor | null }
  /**
   * A ghost snuffed a light.
   */
  | { t: 'snuff'; tx: number; ty: number }
  /**
   * A witch's potion burst.
   */
  | { t: 'splash'; x: number; y: number }
  /**
   * A demon stepped through shadow.
   */
  | { t: 'blink'; fromX: number; fromY: number; x: number; y: number }
  /**
   * Something grew on the map.
   */
  | { t: 'grow'; tx: number; ty: number; tile: GrownTile }
  /**
   * A pumpkin or chest was hit (`broke` once it's smashed).
   */
  | { t: 'smash'; tx: number; ty: number; tile: 'pumpkin' | 'chest'; broke: boolean; health: number };

/**
 * Things that appear on the map by themselves: trees rise out of the
 * ground, pumpkins swell up, chests surface, and new gravestones rise from
 * dug-up mounds.
 */
export type GrownTile = 'tree' | 'pumpkin' | 'chest' | 'tombstone' | 'cross';
