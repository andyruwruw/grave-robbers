// Packages
import { Color } from 'three';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { DEFAULT_STYLE } from '../effects/post/config/post';
import { PostEffects } from '../effects/post/post-effects';
import { setMapSize } from '../space/world-coords';
import { ActorLift } from './actors/actor-lift';
import { MonsterAvatars } from './actors/monster-avatars';
import { PlayerAvatars } from './actors/player-avatars';
import { SnapshotInterpolator } from './actors/snapshot-interpolator';
import { BuildPreview } from './build/build-preview';
import { CameraRig } from './camera/camera-rig';
import { PIXEL_SCALE } from './camera/config/camera';
import { Scenery } from './chunks/scenery';
import { TerrainChunks } from './chunks/terrain-chunks';
import { TileAnimations } from './chunks/tile-animations';
import { CrossbowReticles } from './effects/crossbow-reticles';
import { EventEffects } from './effects/event-effects';
import { Projectiles } from './effects/projectiles';
import { FrameLoop } from './frame-loop';
import { FrameStats } from './frame-stats';
import { FogStampCollector } from './lights/fog-stamp-collector';
import { LightCollector } from './lights/light-collector';
import { SkyLighting } from './lights/sky-lighting';
import { WorldContext } from './world-context';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { LightState, PuddleState, ShotState } from '@halloween/shared/protocol/state/world-state';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { TileChange } from '@halloween/shared/world/tiles';
import type { StyleSettings } from '../types/effects';
import type { SceneParts } from './types/scene-parts';

/**
 * Owns the three.js scene for the TV: the graveyard voxels (rebuilt when
 * tiles change), darkness from a light map, flames, ground items, and one
 * avatar per player and monster. Snapshots go in through the setters; it
 * renders on its own animation frame loop. This is everything a screen
 * needs to show the game, with no mouse, map editor, or /play input layer
 * (`WorldRenderer` adds those).
 */
export class WorldScene {
  /**
   * What every part of the scene shares.
   */
  protected readonly _ctx: WorldContext;

  /**
   * The parts of the scene, each owning one concern.
   */
  protected readonly _parts: SceneParts;

  /**
   * One frame of the scene.
   */
  private readonly _frameLoop: FrameLoop;

  /**
   * Refits the camera when the container changes size.
   */
  private _resizeObserver: ResizeObserver;

  /**
   * The pending animation frame.
   */
  private _frame = 0;

  /**
   * Builds the scene into a container and starts drawing it.
   * @param container The element the canvas fills.
   * @param labelLayer The HTML layer name labels and health bars go in.
   */
  constructor(container: HTMLElement, labelLayer: HTMLElement) {
    const ctx = new WorldContext(container, labelLayer);
    this._ctx = ctx;
    ctx.scene.background = new Color('#07080f');
    const sky = new SkyLighting(ctx);
    const scenery = new Scenery(ctx);
    const rig = new CameraRig(ctx, scenery);
    const interp = new SnapshotInterpolator(ctx);
    const lift = new ActorLift(ctx);
    const players = new PlayerAvatars(ctx, rig, interp, lift);
    const monsters = new MonsterAvatars(ctx, rig, interp, lift, players);
    const chunks = new TerrainChunks(ctx, rig, (): Iterable<number> => tiles.growing.keys());
    const tiles = new TileAnimations(ctx, chunks, players);
    const events = new EventEffects(ctx, monsters, tiles, players);
    const preview = new BuildPreview(ctx, players.avatars, monsters.monsters);

    ctx.lightMap.darken(ctx.piles.group);
    ctx.lightMap.darken(ctx.chips.group);
    ctx.lightMap.darken(ctx.gore.group);
    ctx.scene.add(ctx.puddles.group);
    ctx.scene.add(chunks.group, scenery.outskirts, ctx.flames.group, ctx.piles.group, ctx.chips.group, ctx.gore.group, ctx.pickups.group, ctx.altarGauges.group, ctx.fog.group);
    const projectiles = new Projectiles(ctx);

    rig.aim();
    ctx.camera.near = 1;
    ctx.camera.far = 200;

    const post = new PostEffects(ctx.renderer, ctx.scene, ctx.camera);
    this._parts = { stats: new FrameStats(), rig, chunks, scenery, tiles, events, projectiles, sky, interp, monsters, players, reticles: new CrossbowReticles(ctx), preview, lights: new LightCollector(ctx), fogStamps: new FogStampCollector(ctx), post };
    this.setStyle(DEFAULT_STYLE);
    this._frameLoop = new FrameLoop(ctx, this._parts);

    this._resizeObserver = new ResizeObserver((): void => this.resize());
    this._resizeObserver.observe(container);
    this.resize();
    this._frame = requestAnimationFrame(this._loop);
  }

  /**
   * Broad daylight (the Game tab's daytime), fading in over a couple of
   * seconds.
   * @param on Whether it's day.
   */
  setDaytime(on: boolean): void {
    this._parts.sky.daytime = on;
  }

  /**
   * Puts out every light on the TV, glowing pumpkin faces and candles
   * included (the Game tab's Lights off).
   * @param off Whether the lights are out.
   */
  setLightsOff(off: boolean): void {
    this._ctx.lightsOff = off;
    this._parts.chunks.showGlow();
  }

  /**
   * Applies the TV's look settings (focus, vibrance, glow, aberration).
   * @param style The settings.
   */
  setStyle(style: StyleSettings): void {
    this._parts.post.setStyle(style);
    this._ctx.fog.setDensity(style.fog * 2);
    this._ctx.lightMap.setBoost(1 + style.vibrance * 0.5);
  }

  /**
   * Replaces the whole world, on connect or after a reset.
   * @param seed The world's seed.
   * @param width The map's width in tiles.
   * @param tiles The encoded tiles.
   * @param levels The encoded terrain levels.
   * @param ramps The encoded stairs directions.
   * @param view The part of the map to frame, or null for all of it.
   */
  setWorld(seed: number, width: number, tiles: string, levels: string, ramps?: string, view: MapView | null = null): void {
    const map = WorldMap.decode(tiles, levels, ramps, width);
    if (!map) {
      return;
    }
    this._ctx.map = map;
    this._ctx.mapWidth = map.width;
    this._ctx.mapHeight = map.height;
    setMapSize(map.width, map.height);
    this._ctx.lightMap.resize(map.width, map.height);
    this._ctx.fog.resize(map.width, map.height);
    this._ctx.seed = seed;
    this._parts.rig.view = view;
    this._parts.chunks.rebuild();
    this._parts.scenery.buildOutskirts();
    this._parts.scenery.buildTower();
    this._parts.rig.aim();
    this._parts.rig.fit();
  }

  /**
   * Mirrors server tile changes; the next frame rebuilds the voxels.
   * @param changes The tile changes.
   */
  applyTiles(changes: TileChange[]): void {
    this._parts.tiles.apply(changes);
  }

  /**
   * Applies a tick's ground items and burning lights, and plays its one-off
   * effects.
   * @param items Items on the ground.
   * @param lights Burning lights.
   * @param events The tick's events.
   */
  setWorldState(items: ItemState[], lights: LightState[], events: GameEvent[]): void {
    this._ctx.items = items;
    this._ctx.piles.set(items);
    this._ctx.lightMap.darken(this._ctx.piles.group);
    this._ctx.lights = lights;
    this._parts.events.play(events);
    this._ctx.lightMap.darken(this._ctx.chips.group);
    this._parts.monsters.flushDying();
  }

  /**
   * Bolts and blood in flight this tick.
   * @param shots The shots.
   */
  setShots(shots: ShotState[]): void {
    this._parts.projectiles.set(shots);
  }

  /**
   * Witches' puddles on the ground this tick.
   * @param puddles The puddles.
   */
  setPuddles(puddles: PuddleState[]): void {
    this._ctx.puddles.set(puddles);
  }

  /**
   * Applies the latest monsters: creates, updates, and removes avatars.
   * Vanished avatars wait for this tick's death events to tear them apart.
   * @param monsters Every monster.
   * @param bloodMoon Whether a blood moon is up.
   */
  setMonsters(monsters: MonsterState[], bloodMoon: boolean): void {
    this._parts.sky.bloodMoon = bloodMoon;
    this._parts.monsters.set(monsters);
  }

  /**
   * Applies the latest server snapshot: creates, updates, and removes avatars.
   * @param players Every player.
   */
  setPlayers(players: PlayerState[]): void {
    this._parts.players.set(players);
  }

  /**
   * Stops drawing and frees everything on the GPU.
   */
  dispose(): void {
    cancelAnimationFrame(this._frame);
    this._resizeObserver.disconnect();
    this._parts.players.removeAll();
    this.setMonsters([], false);
    this.setWorldState([], [], []);
    this._ctx.gore.dispose();
    this._ctx.puddles.dispose();
    this._ctx.pickups.dispose();
    this._ctx.altarGauges.dispose();
    this._ctx.healthBars.dispose();
    this._parts.tiles.disposeDebris();
    this._ctx.shotMaterials.dispose();
    this._parts.chunks.clear();
    this._parts.scenery.dispose();
    this._parts.tiles.dispose();
    this._ctx.lightMap.dispose();
    this._parts.post.dispose();
    this._ctx.flames.dispose();
    this._ctx.piles.dispose();
    this._ctx.chips.dispose();
    this._ctx.fog.dispose();
    this._ctx.renderer.dispose();
    this._ctx.renderer.domElement.remove();
  }

  /**
   * Fits the whole map in the container, fills the rest of the screen with
   * scenery beyond the fence, and resizes the low-res buffer.
   */
  private resize(): void {
    const w = this._ctx.container.clientWidth;
    const h = this._ctx.container.clientHeight;
    if (w === 0 || h === 0) {
      return;
    }
    const lowW = Math.max(1, Math.floor(w / PIXEL_SCALE));
    const lowH = Math.max(1, Math.floor(h / PIXEL_SCALE));
    this._ctx.renderer.setSize(lowW, lowH, false);
    this._parts.post.setSize(lowW, lowH);
    this._parts.rig.fit();
  }

  /**
   * Draws a frame and asks for the next.
   */
  private _loop = (): void => {
    this._frame = requestAnimationFrame(this._loop);
    const dt = Math.min(this._ctx.clock.getDelta(), 0.1);
    const time = this._ctx.clock.elapsedTime;
    this._frameLoop.run(dt, time);
  };
}
