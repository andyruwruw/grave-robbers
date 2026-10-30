// Types
import type { Bundle, Goods } from '../../goods/goods';

/**
 * Everything a player can build. Each kind is also a tile.
 */
export type StructureKind =
  | 'wood-wall' | 'stone-wall' | 'palisade' | 'door' | 'wood-fence' | 'spikes' | 'iron-spikes' | 'barbed-wire' | 'scarecrow'
  | 'torch' | 'lantern' | 'ghost-lamp' | 'campfire' | 'soul-fire' | 'platform' | 'steps'
  | 'research-table' | 'sawmill' | 'furnace' | 'stash'
  | 'effigy' | 'altar' | 'bloodforge' | 'sifter' | 'sentry' | 'digger' | 'bone-wall' | 'coffin' | 'bell' | 'cauldron'
  | 'obelisk' | 'blood-fountain' | 'soul-cage' | 'mirror'
  | 'anvil' | 'oven' | 'belt' | 'seeds' | 'sprout'
  | 'bolt-turret' | 'swiper' | 'flamethrower' | 'ballista';

/**
 * A light something gives off. Built lights never burn out (`burn` is
 * Infinity; only stations and altars glow for a while, while they work).
 */
export interface LightDef {
  /**
   * Reach in tiles.
   */
  radius: number;

  /**
   * Seconds a glow lasts (Infinity for lights that burn for good).
   */
  burn: number;

  /**
   * The light's color, as a CSS hex string.
   */
  color: string;

  /**
   * How bright it is at its middle (1 when missing).
   */
  intensity?: number;
}

/**
 * Build rules and stats for one kind of structure.
 */
export interface StructureDef {
  /**
   * Name shown on the phone.
   */
  label: string;

  /**
   * What one costs to craft.
   */
  cost: Bundle;

  /**
   * Health at level 0.
   */
  hp: number;

  /**
   * The light it gives off, if any.
   */
  light?: LightDef;

  /**
   * Grown, not crafted (pumpkin seeds and sprouts): never in the Craft
   * list or the skill tree.
   */
  wild?: boolean;

  /**
   * Only crafted within ANVIL_RADIUS of an anvil.
   */
  anvil?: boolean;
}

/**
 * A structure that turns materials into others: Action on it feeds one
 * batch of `input` from the bag (up to `queue` waiting), and every
 * `seconds` one batch comes out beside it as `output`. A station with a
 * light glows only while it works.
 */
export interface Station {
  /**
   * What one batch takes.
   */
  input: Bundle;

  /**
   * What one batch makes.
   */
  output: Bundle;

  /**
   * Seconds one batch takes at level 0.
   */
  seconds: number;

  /**
   * Most batches waiting.
   */
  queue: number;
}

/**
 * A structure that fights on its own, weakest to strongest. `ammo` is
 * what loads it (Action from the bag or pockets, or piles in
 * STATION_REACH, so belts feed it), `shots` what one ammo buys and
 * `most` the most it holds; null ammo never runs out. It acts every
 * `cooldown` seconds on monsters within `range` tiles:
 * - `shot`: a bolt (or blood) at the nearest, through `pierce` more.
 * - `sweep`: blades around it hit every monster in range.
 * - `flame`: a gout of fire hits every monster within `cone` radians of
 *   the nearest, and sets them burning (`burn` damage a second, ghosts
 *   aside).
 * Damage grows 20% a level (`turretDamage`). Turrets never hurt players.
 */
export interface TurretDef {
  /**
   * How it attacks.
   */
  fires: 'shot' | 'sweep' | 'flame';

  /**
   * What loads it, or null for none.
   */
  ammo: Goods | null;

  /**
   * Shots one ammo buys.
   */
  shots: number;

  /**
   * Most shots it holds.
   */
  most: number;

  /**
   * Tiles it reaches.
   */
  range: number;

  /**
   * Seconds between attacks.
   */
  cooldown: number;

  /**
   * Damage per hit at level 0.
   */
  damage: number;

  /**
   * Tiles its hits throw a monster.
   */
  knockback: number;

  /**
   * Monsters a `shot` goes through after the first.
   */
  pierce?: number;

  /**
   * Radians either side of the nearest monster a `flame` covers.
   */
  cone?: number;

  /**
   * Damage a second a `flame` sets burning.
   */
  burn?: number;
}
