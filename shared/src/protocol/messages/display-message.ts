// Types
import type { TvControl, TvStatus } from '../../audio/tv-control';
import type { ItemState } from '../../goods/ground-items';
import type { BlendAreas } from '../../map-editor/blend/blend-areas';
import type { TileChange } from '../../world/tiles';
import type { GameEvent } from '../game-events';
import type { GameSettings } from '../game-settings';
import type { TvPadEntry } from '../pads';
import type { ServerStats } from '../server-stats';
import type { MonsterState } from '../state/monster-state';
import type { PlayerState } from '../state/player-state';
import type { LightState, PuddleState, ShotState } from '../state/world-state';
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
   * The presets, after one is saved.
   */
  | { t: 'presets'; presets: { id: string; name: string }[] }
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
  | { t: 'state'; tick: number; players: PlayerState[]; monsters: MonsterState[]; shots: ShotState[]; puddles: PuddleState[]; bloodMoon: boolean; items: ItemState[]; lights: LightState[]; cursorLight: { x: number; y: number } | null; events: GameEvent[]; settings: GameSettings; stats: ServerStats; watched: string[] };
