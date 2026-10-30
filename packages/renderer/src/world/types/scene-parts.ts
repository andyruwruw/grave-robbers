// Types
import type { PostEffects } from '../../effects/post/post-effects';
import type { MonsterAvatars } from '../actors/monster-avatars';
import type { PlayerAvatars } from '../actors/player-avatars';
import type { SnapshotInterpolator } from '../actors/snapshot-interpolator';
import type { BuildPreview } from '../build/build-preview';
import type { CameraRig } from '../camera/camera-rig';
import type { Scenery } from '../chunks/scenery';
import type { TerrainChunks } from '../chunks/terrain-chunks';
import type { TileAnimations } from '../chunks/tile-animations';
import type { CrossbowReticles } from '../effects/crossbow-reticles';
import type { EventEffects } from '../effects/event-effects';
import type { Projectiles } from '../effects/projectiles';
import type { FrameStats } from '../frame-stats';
import type { FogStampCollector } from '../lights/fog-stamp-collector';
import type { LightCollector } from '../lights/light-collector';
import type { SkyLighting } from '../lights/sky-lighting';

/**
 * The parts of the TV's scene the frame loop steps each frame.
 */
export interface SceneParts {
  /**
   * The frame rate counter.
   */
  stats: FrameStats;

  /**
   * The camera.
   */
  rig: CameraRig;

  /**
   * The world's voxels.
   */
  chunks: TerrainChunks;

  /**
   * The outskirts and the watchtower.
   */
  scenery: Scenery;

  /**
   * Tiles growing in, sinking, and breaking.
   */
  tiles: TileAnimations;

  /**
   * A tick's one-off events and the queued dirt tosses.
   */
  events: EventEffects;

  /**
   * Shots in flight.
   */
  projectiles: Projectiles;

  /**
   * The moon and the sky.
   */
  sky: SkyLighting;

  /**
   * Where everyone is drawn in the past.
   */
  interp: SnapshotInterpolator;

  /**
   * Every monster's avatar.
   */
  monsters: MonsterAvatars;

  /**
   * Every player's avatar.
   */
  players: PlayerAvatars;

  /**
   * The targets over monsters a crossbow is locked onto.
   */
  reticles: CrossbowReticles;

  /**
   * Each player's facing-tile marker and build preview.
   */
  preview: BuildPreview;

  /**
   * Gathers each frame's lights.
   */
  lights: LightCollector;

  /**
   * Gathers each frame's fog disturbances.
   */
  fogStamps: FogStampCollector;

  /**
   * The post-processing that draws the frame.
   */
  post: PostEffects;
}
