// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Infusion } from '../gear/types/infusion';
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
  | { t: 'monster-death'; x: number; y: number; kind: MonsterKind; angle: number; held: GearKind | null; armor: MonsterArmor | null; raised: boolean }
  /**
   * A bloater burst.
   */
  | { t: 'burst'; x: number; y: number }
  /**
   * A necromancer raised a skeleton out of the ground here.
   */
  | { t: 'raise'; x: number; y: number }
  /**
   * A ghost snuffed a light.
   */
  | { t: 'snuff'; tx: number; ty: number }
  /**
   * A blood fountain caught a monster.
   */
  | { t: 'catch'; tx: number; ty: number; kind: MonsterKind }
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
  | { t: 'smash'; tx: number; ty: number; tile: 'pumpkin' | 'chest'; broke: boolean; health: number }
  /**
   * Chain lightning jumped (Dawn's Scourge, The Seraphic Chain): a path
   * in tiles, from the monster first hit through each one it jumped to.
   */
  | { t: 'chain'; points: { x: number; y: number }[] }
  /**
   * A dying monster burst (Requiem Lash and Pyre, Infernal Mandate);
   * `ignite` when it set what it hit burning.
   */
  | { t: 'death-blast'; x: number; y: number; radius: number; ignite: boolean }
  /**
   * A Wailing Sickle's sweep wailed all around its wielder.
   */
  | { t: 'wail'; x: number; y: number; radius: number }
  /**
   * A Titan's Maul or Earthshaker strike slammed the ground around its
   * wielder.
   */
  | { t: 'slam'; x: number; y: number; radius: number }
  /**
   * An Earthshaker cracked a fissure from (x, y) along `angle` for
   * `length` tiles.
   */
  | { t: 'fissure'; x: number; y: number; angle: number; length: number }
  /**
   * A Hellmouth sprayed fire from (x, y) along `angle`: a cone `cone`
   * radians either side, `range` tiles long (one per spray pulse).
   */
  | { t: 'flame-spray'; x: number; y: number; angle: number; cone: number; range: number }
  /**
   * An Archangel's Fists super uppercut sent out a holy nova.
   */
  | { t: 'nova'; x: number; y: number; radius: number }
  /**
   * A Mirror Shield sent a shot back.
   */
  | { t: 'reflect'; x: number; y: number }
  /**
   * Someone infused a piece of gear at an anvil (the result: its kind and
   * new infusion).
   */
  | { t: 'infused'; x: number; y: number; finder: string; finderColor: string; kind: GearKind; infusion: Infusion };

/**
 * Things that appear on the map by themselves: trees and hedges rise out of the
 * ground, pumpkins swell up, chests surface, and new gravestones rise from
 * dug-up mounds.
 */
export type GrownTile = 'tree' | 'hedge' | 'pumpkin' | 'chest' | 'tombstone' | 'cross';
