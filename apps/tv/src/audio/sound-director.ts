// Local Imports
import { SoundStage } from './sound-stage';
import { EventSounds } from './watchers/event-sounds';
import { MonsterSounds } from './watchers/monster-sounds';
import { MoodWatcher } from './watchers/mood-watcher';
import { PlayerSounds } from './watchers/player-sounds';
import { ShotSounds } from './watchers/shot-sounds';
import { TileSounds } from './watchers/tile-sounds';

// Types
import type { TileChange } from '@halloween/shared/world/tiles';
import type { MusicPlayer } from '@halloween/ui/audio/music/music-player';
import type { SfxEngine } from '@halloween/ui/audio/sfx/sfx-engine';
import type { StateMessage } from '../types/sound';
import type { SoundWatcher } from './watchers/sound-watcher';

/**
 * Turns the TV's game feed into sound: watches counters and flags between
 * snapshots (swings and shots, hits, bites, respawns, the blood moon), one-off events
 * (chips, kills, monster deaths, snuffed lights), and tile changes (builds
 * and breaks), panned by where on the map they happen. Monsters also groan,
 * hiss, and moan now and then. Big moments duck the music, and fights bring
 * in more of a song's parts. Each part is a `SoundWatcher` over one shared
 * `SoundStage`.
 */
export class SoundDirector {
  /**
   * The map, sound engine, and music the watchers share.
   */
  private readonly _stage: SoundStage;

  /**
   * The snapshot watchers, in the order they play.
   */
  private readonly _watchers: SoundWatcher[];

  /**
   * Builds and breaks.
   */
  private readonly _tiles: TileSounds;

  /**
   * Plays on the page's sound engine and music.
   *
   * @param sfx - The page's sound engine.
   * @param music - The page's music player.
   */
  constructor(sfx: SfxEngine, music: MusicPlayer) {
    this._stage = new SoundStage(sfx, music);
    this._watchers = [new ShotSounds(this._stage), new PlayerSounds(this._stage), new MonsterSounds(this._stage), new EventSounds(this._stage), new MoodWatcher(this._stage)];
    this._tiles = new TileSounds(this._stage);
  }

  /**
   * Takes a new world's map.
   *
   * @param width - The map's width in tiles.
   * @param tiles - The encoded tiles.
   * @param levels - The encoded terrain levels.
   * @param ramps - The encoded ramps, if any.
   */
  onWorld(width: number, tiles: string, levels: string, ramps?: string): void {
    this._stage.setMap(width, tiles, levels, ramps);
  }

  /**
   * Plays builds and breaks, and keeps the map current.
   *
   * @param changes - The changed tiles.
   */
  onTiles(changes: TileChange[]): void {
    this._tiles.onTiles(changes);
  }

  /**
   * Plays what changed in a snapshot.
   *
   * @param msg - The snapshot.
   */
  onState(msg: StateMessage): void {
    const now = performance.now() / 1000;
    for (const watcher of this._watchers) {
      watcher.onState(msg, now);
    }
  }
}
