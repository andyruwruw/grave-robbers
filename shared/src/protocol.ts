// Types
import type { BlendAreas } from './blend';
import type { PhoneSound, TvControl, TvStatus } from './audio';
import type { MapEdit } from './map-edit';
import type { MapGenSettings } from './map-gen';
import type {
  Gear,
  GearKind,
  GearSlot,
  ItemKey,
  RecipeId,
} from './gear';
import type {
  Goods,
  Inventory,
  ItemState,
  Resource,
} from './items';
import type { MonsterArmor } from './levels';
import type { MonsterKind } from './monsters';
import type { StructureKind } from './structures';
import type { NodeId, TreeState } from './tree';
import type { TileChange } from './world';

/**
 * Wire protocol between the server, the TV display, and phone controllers.
 * Every message is a JSON object discriminated by `t`.
 */

/**
 * A player as the server broadcasts it.
 */
export interface PlayerState {
  /**
   * Stable public id (never the secret token).
   */
  id: string;

  /**
   * Display name chosen on the phone.
   */
  name: string;

  /**
   * Body color, one of PLAYER_COLORS.
   */
  color: string;

  /**
   * World position in tiles (x east, y south).
   */
  x: number;

  /**
   * World position in tiles (x east, y south).
   */
  y: number;

  /**
   * Facing angle in radians, 0 = east, PI/2 = south.
   */
  facing: number;

  /**
   * Whether the player is currently moving.
   */
  moving: boolean;

  /**
   * Slowed by a ghost's ectoplasm.
   */
  slowed: boolean;

  /**
   * Picked up by the TV's mouse.
   */
  lifted: boolean;

  /**
   * Whether the phone is currently connected.
   */
  connected: boolean;

  /**
   * Swing counter; the display animates a swing whenever it goes up.
   */
  swings: number;

  /**
   * Structure picked from the bag to place, previewed on the facing tile.
   */
  building: StructureKind | null;

  /**
   * Health, 0..MAX_HP (fractional while regenerating).
   */
  hp: number;

  /**
   * Health lost to damage too fresh to heal yet, above `hp`.
   */
  wounded: number;

  /**
   * Hit counter; the display flashes the player whenever it goes up.
   */
  hurts: number;

  /**
   * Waiting to respawn; hidden on the display.
   */
  dead: boolean;

  /**
   * Under spawn protection: can't be hurt.
   */
  protected: boolean;

  /**
   * Holding their shield up.
   */
  blocking: boolean;

  /**
   * What's equipped in each slot (null: the wood axe, the lantern, no
   * armor).
   */
  gear: Record<GearSlot, GearKind | null>;
}

/**
 * Something shot in flight: a crossbow bolt, or a gob of blood from a
 * blunderbuss or a sentry.
 */
export interface ShotState {
  id: number;
  x: number;
  y: number;

  /**
   * Direction of travel in radians.
   */
  angle: number;

  /**
   * A crossbow bolt, a gob of blood (blunderbuss or sentry), a ghost's
   * ball of ectoplasm, a skeleton's arrow, or a witch's potion.
   */
  kind: 'bolt' | 'blood' | 'ecto' | 'arrow' | 'potion';

  /**
   * How far through its flight a lobbed potion is, 0 to 1 (for its arc).
   */
  lob?: number;
}

/**
 * A monster as the server broadcasts it.
 */
export interface MonsterState {
  id: number;
  kind: MonsterKind;

  /**
   * World position in tiles.
   */
  x: number;
  y: number;

  /**
   * Facing angle in radians, 0 = east, PI/2 = south.
   */
  facing: number;
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
   * A witch's broom swipes, counted like `attacks`.
   */
  swipes: number;
}

/**
 * A puddle a witch's potion left: where, and how much of its life is
 * left (1 fresh to 0 gone).
 */
export interface PuddleState {
  id: number;
  x: number;
  y: number;
  life: number;
}

/**
 * Why a phone is looking at the death screen.
 */
export interface DeathInfo {
  /**
   * Who or what did it: a player name, or e.g. "Spikes".
   */
  killer: string;

  /**
   * Seconds the character lived.
   */
  survived: number;

  /**
   * Seconds until respawn, as of sending.
   */
  respawnIn: number;
}

/**
 * Health and death state for the phone's own player.
 */
export interface Vitals {
  hp: number;
  wounded: number;
  protected: boolean;
  death: DeathInfo | null;
}

/**
 * A burning torch or campfire.
 */
export interface LightState {
  /**
   * Row-major tile index.
   */
  i: number;

  /**
   * Seconds of glow left, capped at LOW_FUEL (a light burns for good, so
   * only stations and altars ever run low).
   */
  fuel: number;

  /**
   * How far (tiles) and how bright it shines, with its builder's upgrades.
   */
  radius: number;
  intensity: number;
}

/**
 * One-off things that happened during a tick, for display effects. A hit
 * on a tile carries how much of it is left, 0 to 1 (0 once it's gone).
 */
export type GameEvent =
  | { t: 'chips'; tx: number; ty: number; chip: 'wood' | 'stone'; health: number }
  | { t: 'dig'; tx: number; ty: number; tile: 'tombstone' | 'cross' | 'statue' | 'crypt' | 'mausoleum'; done: boolean; health: number }
  | { t: 'blueprint'; finder: string; finderColor: string; label: string }
  | { t: 'research'; finder: string; finderColor: string; label: string; level: number; opens: string[] }
  | { t: 'candy'; x: number; y: number; amount: number }
  | { t: 'pickup'; x: number; y: number; goods: Exclude<Goods, 'candy'> }
  | { t: 'kill'; killer: string; killerColor: string | null; victim: string; victimColor: string }
  | { t: 'monster-death'; x: number; y: number; kind: MonsterKind; angle: number; held: GearKind | null; armor: MonsterArmor | null }
  | { t: 'snuff'; tx: number; ty: number }
  | { t: 'splash'; x: number; y: number }
  | { t: 'blink'; fromX: number; fromY: number; x: number; y: number }
  | { t: 'grow'; tx: number; ty: number; tile: GrownTile }
  | { t: 'smash'; tx: number; ty: number; tile: 'pumpkin' | 'chest'; broke: boolean; health: number };

/**
 * Things that appear on the map by themselves: trees rise out of the
 * ground, pumpkins swell up, chests surface, and new gravestones rise from
 * dug-up mounds.
 */
export type GrownTile = 'tree' | 'pumpkin' | 'chest' | 'tombstone' | 'cross';

/**
 * Testing switches from the TV's Game tab.
 */
export interface GameSettings {
  /**
   * Zombies and vampires hunt players (off: they only wander).
   */
  aggressive: boolean;

  /**
   * A server-run player that gathers, builds, and fights on its own.
   */
  testPlayer: boolean;

  /**
   * Every light is out: pumpkins, lamps, torches, campfires, lanterns.
   */
  lightsOff: boolean;

  /**
   * Broad daylight on the TV (just how it looks; monsters act the same).
   */
  daytime: boolean;

  /**
   * The TV's mouse can pick up players and monsters and drop them
   * anywhere.
   */
  tvDrag: boolean;

  /**
   * Holding the TV's right mouse button carries a light around.
   */
  tvLight: boolean;

  /**
   * Levels the Game tab adds to the world level on top of what the
   * players call for (0 to WORLD_LEVEL_BOOST_MAX).
   */
  levelBoost: number;

  /**
   * Testing: every recipe and skill tree node is open to everyone (All
   * unlocks), and crafting costs nothing (Free crafting).
   */
  allUnlocks: boolean;
  freeCrafting: boolean;

  /**
   * Things come on their own: monsters walk in (and a few wander with
   * nobody playing), blood moons rise, and trees, pumpkins, and chests grow
   * back. Off (the sandbox), only what the Game tab spawns shows up.
   */
  spawning: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = { aggressive: true, testPlayer: false, lightsOff: false, daytime: false, tvDrag: true, tvLight: true, levelBoost: 0, allUnlocks: false, freeCrafting: false, spawning: true };

/**
 * Whether two sets of switches match, so pages only re-render on a change.
 */
export function sameGameSettings(a: GameSettings, b: GameSettings): boolean {
  return (Object.keys(DEFAULT_GAME_SETTINGS) as (keyof GameSettings)[]).every((key): boolean => a[key] === b[key]);
}

/**
 * Something on the map the TV's mouse can pick up.
 */
export type LiftTarget = { kind: 'player'; id: string } | { kind: 'monster'; id: number };

/**
 * The part of the map the TV frames (tiles), for a map that only uses
 * part of the grid (the sandbox), or null for the whole map.
 */
export interface MapView {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Server health for the TV's Overview tab, averaged over the last second.
 */
export interface ServerStats {
  /**
   * Ticks actually run per second (TICK_RATE when keeping up).
   */
  tps: number;

  /**
   * Average simulation time per tick, in ms.
   */
  stepMs: number;

  /**
   * The hidden world level and each player's level, by player id.
   */
  worldLevel: number;
  levels: Record<string, number>;
}

/**
 * What the Game tab can conjure next to a player.
 */
export type SpawnKind = 'tree' | 'pumpkin' | 'chest' | 'rock' | 'loot' | MonsterKind;

export const SPAWN_KINDS: SpawnKind[] = ['tree', 'pumpkin', 'chest', 'rock', 'loot', 'zombie', 'vampire', 'ghost', 'brute', 'skeleton', 'witch', 'ghoul', 'demon'];

/**
 * The private identity a controller keeps to rejoin as the same player.
 */
export interface PlayerIdentity {
  /**
   * Secret token, stored on the phone.
   */
  token: string;

  /**
   * Public state at the time of joining.
   */
  player: PlayerState;
}

/**
 * Messages a client sends to the server.
 */
export type ClientMessage =
  | { t: 'hello-display'; admin?: boolean }
  | { t: 'hello-controller'; token?: string }
  | { t: 'join'; name: string; color: string }
  | { t: 'leave' }
  | { t: 'input'; x: number; y: number }
  | { t: 'action'; down: boolean }
  | { t: 'block'; down: boolean }
  | { t: 'aim'; x: number; y: number }
  | { t: 'drop'; resource: Resource }
  | { t: 'grab' }
  | { t: 'equip'; bag: number }
  | { t: 'drink'; bag: number }
  | { t: 'panic' }
  | { t: 'unequip'; slot: GearSlot }
  | { t: 'drop-gear'; from: GearSlot | number }
  | { t: 'move-item'; from: GearSlot | number; to: GearSlot | number }
  | { t: 'craft'; recipe: RecipeId; count?: number }
  | { t: 'upgrade'; node: NodeId }
  | { t: 'build-select'; slot: number | null }
  | { t: 'build-place' }
  | { t: 'reset-world'; preset: string | null; gen?: MapGenSettings }
  | { t: 'tv-control'; control: TvControl }
  | { t: 'tv-status'; status: TvStatus }
  | { t: 'claim-music' }
  | { t: 'edit-map'; edits: MapEdit[] }
  | { t: 'save-preset'; name: string }
  | { t: 'force-blood-moon' }
  | { t: 'kill-monsters' }
  | { t: 'tv-lift'; target: LiftTarget; x: number; y: number; drop: boolean }
  | { t: 'tv-light'; at: { x: number; y: number } | null }
  | { t: 'game-settings'; settings: Partial<GameSettings> }
  | { t: 'spawn'; kind: SpawnKind };

/**
 * Messages the server sends to a display.
 */
export type DisplayMessage =
  | { t: 'display-welcome'; lanAddress: string | null; presets: { id: string; name: string }[] }
  | { t: 'world'; seed: number; tiles: string; levels: string; ramps: string; blends: BlendAreas; view: MapView | null }
  | { t: 'presets'; presets: { id: string; name: string }[] }
  | { t: 'tiles'; changes: TileChange[] }
  | { t: 'tv-control'; control: TvControl }
  | { t: 'tv-status'; status: TvStatus }
  | { t: 'music-owner'; owner: boolean }
  | { t: 'state'; tick: number; players: PlayerState[]; monsters: MonsterState[]; shots: ShotState[]; puddles: PuddleState[]; bloodMoon: boolean; items: ItemState[]; lights: LightState[]; cursorLight: { x: number; y: number } | null; events: GameEvent[]; settings: GameSettings; stats: ServerStats };

/**
 * Messages the server sends to a controller.
 */
export type ControllerMessage =
  | { t: 'controller-welcome'; identity: PlayerIdentity | null }
  | { t: 'joined'; identity: PlayerIdentity }
  | { t: 'join-error'; error: string }
  | { t: 'inventory'; inventory: Inventory; gear: Gear; tree: TreeState; research: boolean }
  | { t: 'reach'; item: ItemKey | null }
  | { t: 'build-error'; error: string }
  | { t: 'vitals'; vitals: Vitals }
  | { t: 'sounds'; names: PhoneSound[] }
  | { t: 'left' };

/**
 * Any message the server sends.
 */
export type ServerMessage = DisplayMessage | ControllerMessage;

/**
 * Path the WebSocket server listens on.
 */
export const SOCKET_PATH = '/ws';
