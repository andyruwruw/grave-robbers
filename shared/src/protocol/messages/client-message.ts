// Types
import type { TvControl, TvStatus } from '../../audio/tv-control';
import type { RecipeId } from '../../crafting/recipes';
import type { GearSlot } from '../../gear/types/gear-def';
import type { Essence } from '../../gear/types/infusion';
import type { Resource } from '../../goods/goods';
import type { MapEdit } from '../../map-editor/map-edit';
import type { MapGenSettings } from '../../map-gen/settings';
import type { NodeId } from '../../skill-tree/types/skill-tree';
import type { WorldEventKind } from '../../world-events/types/world-events';
import type { GameSettings } from '../game-settings';
import type { SortKey, SortSide } from '../../structures/sorting';
import type { PadState } from '../pads';
import type { LiftTarget, SpawnKind } from '../tv-tools';
import type { RegrowthTile } from '../../world/regrowth';

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
   * Joins the game with a name and color. A name that already has a
   * character needs proof: a token this device held for it before
   * (`tokens`), or a transfer code from the device that has it (`code`).
   */
  | { t: 'join'; name: string; color: string; tokens?: string[]; code?: string }
  /**
   * Asks for a code that moves this phone's character to another device.
   */
  | { t: 'transfer-code' }
  /**
   * The admin asks for the saved worlds and the characters in this one.
   */
  | { t: 'world-slots' }
  /**
   * The admin makes a new, empty world slot.
   */
  | { t: 'slot-create'; name: string }
  /**
   * The admin plays another world slot (everyone goes back to the join
   * form).
   */
  | { t: 'slot-open'; id: string }
  /**
   * The admin deletes a world slot that isn't being played (it's backed up
   * first).
   */
  | { t: 'slot-delete'; id: string }
  /**
   * The admin deletes a character, freeing their name.
   */
  | { t: 'character-release'; id: string }
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
   * The aim stick, each axis -1 to 1. Snapped to eight ways like walking,
   * unless `free` (/play's mouse and right stick aim any way).
   */
  | { t: 'aim'; x: number; y: number; free?: boolean }
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
   * USE on the facing tile: opens what it can (a storage chest, a bone
   * digger, a station, a research table's tree, an anvil's armory), or
   * does what it can (relights, loads, offers, waters, opens a chest).
   * Never hurts what's there. `at` (the mouse on /play) points the way
   * to look for it (`useTarget`); without it, the player's facing.
   */
  | { t: 'use'; at?: { x: number; y: number } | null }
  /**
   * Closes the open digger or station panel.
   */
  | { t: 'use-close' }
  /**
   * Feeds the open station one batch from the bag (`all`: as many as fit).
   */
  | { t: 'use-feed'; all?: boolean }
  /**
   * Takes what the open bone digger dug up.
   */
  | { t: 'use-collect' }
  /**
   * Sends one thing out one side of the open belt sorter (null: nothing
   * goes that way). Only things the player has unlocked (`sortableKeys`).
   */
  | { t: 'use-route'; side: SortSide; item: SortKey | null }
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
   * Infuses a piece of gear at an anvil with an essence (its path's next
   * level): an equipped slot, a bag index, or 'hammer' for the hammer
   * everyone has (which makes an infused hammer).
   */
  | { t: 'infuse'; from: GearSlot | number | 'hammer'; essence: Essence }
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
   * The TV starts a world event.
   */
  | { t: 'start-world-event'; kind: WorldEventKind }
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
   * The TV or admin conjures something: at a random spot, or at `at` (tile
   * space) when given (the admin's Spawn page, clicking the map).
   */
  | { t: 'spawn'; kind: SpawnKind; at?: { x: number; y: number } }
  /**
   * The admin sets how many of a tile the map keeps growing back to.
   */
  | { t: 'regrowth-target'; tile: RegrowthTile; target: number }
  /**
   * The admin destroys every item on the ground.
   */
  | { t: 'clear-items' }
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
   * Picks the look the next wall is built in (see `WALL_STYLES`).
   */
  | { t: 'build-style'; style: number }
  /**
   * A display watches these players (only nearby things are sent on a huge
   * world).
   */
  | { t: 'watch'; ids: string[] }
  /**
   * The answer to the server's ping.
   */
  | { t: 'pong' };
