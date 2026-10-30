// Types
import type { TvControl, TvStatus } from '../../audio/tv-control';
import type { RecipeId } from '../../crafting/recipes';
import type { GearSlot } from '../../gear/types/gear-def';
import type { Resource } from '../../goods/goods';
import type { MapEdit } from '../../map-editor/map-edit';
import type { MapGenSettings } from '../../map-gen/settings';
import type { NodeId } from '../../skill-tree/types/skill-tree';
import type { GameSettings } from '../game-settings';
import type { PadState } from '../pads';
import type { LiftTarget, SpawnKind } from '../tv-tools';

/**
 * Messages a client sends to the server.
 */
export type ClientMessage =
  /**
   * A display connects: the TV, the admin page (`admin`), or a /play viewer
   * (`viewer`).
   */
  | { t: 'hello-display'; admin?: boolean; viewer?: boolean }
  /**
   * A phone (or /play) connects, resuming a player by `token` if it has one.
   */
  | { t: 'hello-controller'; token?: string }
  /**
   * Joins the game with a name and color.
   */
  | { t: 'join'; name: string; color: string }
  /**
   * Leaves the game for good.
   */
  | { t: 'leave' }
  /**
   * The movement stick, each axis -1 to 1.
   */
  | { t: 'input'; x: number; y: number }
  /**
   * Action pressed or let go.
   */
  | { t: 'action'; down: boolean }
  /**
   * Block pressed or let go.
   */
  | { t: 'block'; down: boolean }
  /**
   * The aim stick, each axis -1 to 1.
   */
  | { t: 'aim'; x: number; y: number }
  /**
   * Drops some candy or blood.
   */
  | { t: 'drop'; resource: Resource }
  /**
   * Equips the gear in a bag slot.
   */
  | { t: 'equip'; bag: number }
  /**
   * Drinks a tonic from a bag slot.
   */
  | { t: 'drink'; bag: number }
  /**
   * Panics: runs from nearby monsters, then walks back.
   */
  | { t: 'panic' }
  /**
   * Moves what's in an equipped slot back to the bag.
   */
  | { t: 'unequip'; slot: GearSlot }
  /**
   * Drops a piece of gear (or a stack) from an equipped slot or a bag slot.
   */
  | { t: 'drop-gear'; from: GearSlot | number }
  /**
   * Moves an item between equipped slots and bag slots.
   */
  | { t: 'move-item'; from: GearSlot | number; to: GearSlot | number }
  /**
   * Moves an item between the bag and the open storage chest.
   */
  | { t: 'stash-move'; from: 'bag' | 'stash'; index: number }
  /**
   * Closes the open storage chest.
   */
  | { t: 'stash-close' }
  /**
   * Takes down the open storage chest.
   */
  | { t: 'stash-take-down' }
  /**
   * Crafts a recipe, `count` times (once when missing).
   */
  | { t: 'craft'; recipe: RecipeId; count?: number }
  /**
   * Upgrades a skill tree node.
   */
  | { t: 'upgrade'; node: NodeId }
  /**
   * Picks a bag slot's structure to place, or stops building (null).
   */
  | { t: 'build-select'; slot: number | null }
  /**
   * Places the structure being built.
   */
  | { t: 'build-place' }
  /**
   * Aims the build at a tile-space point (the mouse on /play), or back at the
   * facing tile (null).
   */
  | { t: 'build-aim'; at: { x: number; y: number } | null }
  /**
   * The TV starts a new world from a preset, or a random map with `gen`.
   */
  | { t: 'reset-world'; preset: string | null; gen?: MapGenSettings }
  /**
   * The admin page asks the TV to do something with its music.
   */
  | { t: 'tv-control'; control: TvControl }
  /**
   * The TV reports its music, for the admin page.
   */
  | { t: 'tv-status'; status: TvStatus }
  /**
   * A TV takes over playing the music.
   */
  | { t: 'claim-music' }
  /**
   * The TV's map editor changes the map.
   */
  | { t: 'edit-map'; edits: MapEdit[] }
  /**
   * The TV saves the map as a preset.
   */
  | { t: 'save-preset'; name: string }
  /**
   * The TV summons a blood moon.
   */
  | { t: 'force-blood-moon' }
  /**
   * The TV kills every monster.
   */
  | { t: 'kill-monsters' }
  /**
   * The TV's mouse carries a player or monster to (x, y), dropping it when
   * `drop`.
   */
  | { t: 'tv-lift'; target: LiftTarget; x: number; y: number; drop: boolean }
  /**
   * The TV's right mouse button carries a light to a point, or puts it away
   * (null).
   */
  | { t: 'tv-light'; at: { x: number; y: number } | null }
  /**
   * The TV changes some of the Game tab's switches.
   */
  | { t: 'game-settings'; settings: Partial<GameSettings> }
  /**
   * The TV conjures something next to a player.
   */
  | { t: 'spawn'; kind: SpawnKind }
  /**
   * The TV lists the game controllers plugged into it.
   */
  | { t: 'tv-pads'; pads: { index: number; name: string }[] }
  /**
   * The TV relays a claimed controller's state.
   */
  | { t: 'pad'; index: number; state: PadState }
  /**
   * A phone claims a controller plugged into a TV.
   */
  | { t: 'claim-pad'; id: string }
  /**
   * A phone lets go of its claimed controller.
   */
  | { t: 'release-pad' }
  /**
   * Turns a quarter turn left (-1) or right (1): the structure being built, or
   * else the player.
   */
  | { t: 'turn'; dir: -1 | 1 }
  /**
   * A display watches these players (only nearby things are sent on a huge
   * world).
   */
  | { t: 'watch'; ids: string[] }
  /**
   * The answer to the server's ping.
   */
  | { t: 'pong' };
