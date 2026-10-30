// Packages
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { PAN_WIDTH } from '../config/sound';

// Types
import type { MusicPlayer } from '@halloween/ui/audio/music/music-player';
import type { SfxEngine } from '@halloween/ui/audio/sfx/sfx-engine';
import type { SfxName } from '@halloween/ui/types/sfx';
import type { Cue } from '../types/sound';

/**
 * What the TV's sound watchers share: the map (for panning), the sound
 * engine, the music, and when anyone was last hit. Plays sounds panned by
 * where on the map they happen.
 */
export class SoundStage {
  /**
   * The map as last sent, kept current with tile changes.
   */
  map: WorldMap | null = null;

  /**
   * When (seconds) anyone (or anything) was last hit, for the music's fight
   * mood.
   */
  lastHitAt = -Infinity;

  /**
   * Plays on the page's sound engine and ducks its music.
   *
   * @param sfx - The page's sound engine.
   * @param music - The page's music player.
   */
  constructor(readonly sfx: SfxEngine, readonly music: MusicPlayer) {}

  /**
   * Decodes a new world's map.
   *
   * @param width - The map's width in tiles.
   * @param tiles - The encoded tiles.
   * @param levels - The encoded terrain levels.
   * @param ramps - The encoded ramps, if any.
   */
  setMap(width: number, tiles: string, levels: string, ramps?: string): void {
    this.map = WorldMap.decode(tiles, levels, ramps, width);
  }

  /**
   * A cue, its pitch nudged by up to `spread`.
   *
   * @param cue - The sound, its pitch, and its volume.
   * @param x - The tile column it happens at.
   * @param spread - How far the pitch may be nudged up.
   */
  cue([name, pitch, volume]: Cue, x: number, spread = 0.15): void {
    this.play(name, x, volume, pitch + Math.random() * spread);
  }

  /**
   * An attack's sounds: one as it winds up, and the hit itself as it lands
   * `windup` seconds later.
   *
   * @param windup - The windup sound, if any.
   * @param strike - The sounds as it lands.
   * @param delay - Seconds from windup to the hit.
   * @param x - The tile column it happens at.
   */
  attackCues(windup: Cue | null, strike: Cue[], delay: number, x: number): void {
    if (windup) {
      this.cue(windup, x);
    }
    if (strike.length > 0) {
      setTimeout((): void => strike.forEach((c: Cue): void => this.cue(c, x, 0.08)), delay * 1000);
    }
  }

  /**
   * Plays a sound panned to tile column `x`.
   *
   * @param name - The sound.
   * @param x - The tile column it happens at.
   * @param volume - Its volume.
   * @param pitch - Its pitch.
   */
  play(name: SfxName, x: number, volume = 1, pitch = 1): void {
    this.sfx.play(name, { volume, pitch, pan: ((x / (this.map?.width ?? MAP_WIDTH)) * 2 - 1) * PAN_WIDTH });
  }
}
