// Types
import type { RegrowthTile } from '../../world/regrowth';
import type { TvControl, TvStatus } from '../../audio/tv-control';
import type { ItemState } from '../../goods/ground-items';
import type { CharacterInfo, WorldSlotInfo } from '../../saves/world-slots';
import type { BlendAreas } from '../../map-editor/blend/blend-areas';
import type { TileChange } from '../../world/tiles';
import type { WorldEventState } from '../../world-events/types/world-events';
import type { GameEvent } from '../game-events';
import type { GameSettings } from '../game-settings';
import type { TvPadEntry } from '../pads';
import type { ServerStats } from '../server-stats';
import type { MonsterState } from '../state/monster-state';
import type { PlayerState } from '../state/player-state';
import type { LightState, PatchState, PuddleState, ShotState, VictimState } from '../state/world-state';
import type { MapView } from '../tv-tools';

/**
 * Messages the server sends to a display.
 */
export type DisplayMessage =
  /**
   * The server's LAN address and the presets, sent on connecting.
   */
  | { t: 'display-welcome'; lanAddress: string | null; presets: { id: string; name: string }[] }
  /**
   * The whole map: a new world, or after a map edit.
   */
  | { t: 'world'; seed: number; width: number; tiles: string; levels: string; ramps: string; blends: BlendAreas; view: MapView | null }
  /**
   * A huge world is being generated; the `world` message follows when
   * it's ready.
   */
  | { t: 'generating' }
  /**
   * The presets, after one is saved.
   */
  | { t: 'presets'; presets: { id: string; name: string }[] }
  /**
   * The saved worlds and the characters in the one being played (to the
   * admin, when asked and after any change).
   */
  | { t: 'world-slots'; slots: WorldSlotInfo[]; characters: CharacterInfo[] }
  /**
   * Tiles changed this tick.
   */
  | { t: 'tiles'; changes: TileChange[] }
  /**
   * What the admin page asks the TV to do with its music.
   */
  | { t: 'tv-control'; control: TvControl }
  /**
   * The TV's music, for the admin page.
   */
  | { t: 'tv-status'; status: TvStatus }
  /**
   * Whether this TV plays the music.
   */
  | { t: 'music-owner'; owner: boolean }
  /**
   * Which of this TV's controllers are claimed.
   */
  | { t: 'pad-claims'; indices: number[] }
  /**
   * Every controller plugged into a TV, for the Controllers tab.
   */
  | { t: 'tv-pad-list'; pads: TvPadEntry[] }
  /**
   * Everything that moves, sent every tick.
   */
  | { t: 'state'; tick: number; players: PlayerState[]; monsters: MonsterState[]; shots: ShotState[]; puddles: PuddleState[]; patches?: PatchState[]; worldEvents: WorldEventState[]; items: ItemState[]; lights: LightState[]; victims?: VictimState[]; cursorLight: { x: number; y: number } | null; events: GameEvent[]; settings: GameSettings; regrowth: Record<RegrowthTile, number>; stats: ServerStats; watched: string[] };
