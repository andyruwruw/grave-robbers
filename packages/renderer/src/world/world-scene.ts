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
import {
  DEFAULT_PIXEL_LIMIT,
  FAR,
  NEAR,
  PIXEL_SCALE,
} from './camera/config/camera';
import { pixelScaleFor } from './camera/helpers/pixel-scale';
import { MapOverview } from './chunks/map-overview';
import { Scenery } from './chunks/scenery';
import { TerrainChunks } from './chunks/terrain-chunks';
import { TileAnimations } from './chunks/tile-animations';
import { DisplayApplier } from './display/display-applier';
import { CrossbowReticles } from './effects/crossbow-reticles';
import { EventEffects } from './effects/event-effects';
import { Projectiles } from './effects/projectiles';
import { FrameLoop } from './frame-loop';
import { FrameStats } from './frame-stats';
import { FogStampCollector } from './lights/fog-stamp-collector';
import { LightCollector } from './lights/light-collector';
import { SkyLighting } from './lights/sky-lighting';
import { WorldEventLook } from './lights/world-event-look';
import { freeScene } from './helpers/free-scene';
import { WorldContext } from './world-context';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { LightState, PatchState, PuddleState, ShotState, VictimState } from '@halloween/shared/protocol/state/world-state';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { WorldEventState } from '@halloween/shared/world-events/types/world-events';
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
   * Screen pixels per rendered pixel right now (see `syncPixelScale`).
   */
  private _pixelScale = PIXEL_SCALE;

  /**
   * A pixel size the view picked for itself (/play), or null to grow
   * pixels with the zoom up to DEFAULT_PIXEL_LIMIT (see `pixelScaleFor`).
   */
  protected _pixelOverride: number | null = null;

  /**
   * What the zoom's own pixel size is multiplied by (the TV's scenic
   * Incognito look coarsens it), 1 for none.
   */
  protected _pixelBoost = 1;

  /**
   * The largest pixel size the zoom may grow to (the TV's Pixel Size
   * slider), DEFAULT_PIXEL_LIMIT unless set.
   */
  protected _pixelLimit = DEFAULT_PIXEL_LIMIT;

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
    const overview = new MapOverview(ctx);
    const events = new EventEffects(ctx, monsters, tiles, players, rig);
    const preview = new BuildPreview(ctx, players.avatars, monsters.monsters);

    ctx.lightMap.darken(ctx.piles.group);
    ctx.lightMap.darken(ctx.chips.group);
    ctx.lightMap.darken(ctx.gore.group);
    ctx.scene.add(ctx.puddles.group, ctx.patches.group);
    ctx.scene.add(chunks.group, overview.mesh, scenery.outskirts, ctx.flames.group, ctx.piles.group, ctx.chips.group, ctx.gore.group, ctx.pickups.group, ctx.altarGauges.group, ctx.fountainVictims.group, ctx.fog.group, ctx.bolts.group, ctx.rings.group, ctx.cracks.group);
    const projectiles = new Projectiles(ctx);

    rig.aim();
    ctx.camera.near = NEAR;
    ctx.camera.far = FAR;

    const post = new PostEffects(ctx.renderer, ctx.scene, ctx.camera);
    this._parts = { stats: new FrameStats(), rig, chunks, overview, scenery, tiles, events, projectiles, sky, look: new WorldEventLook(ctx), interp, monsters, players, reticles: new CrossbowReticles(ctx), preview, lights: new LightCollector(ctx), fogStamps: new FogStampCollector(ctx), post, display: new DisplayApplier(ctx, rig, post) };
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
   * Screen pixels per world pixel right now (the pixelation), for /play's
   * HUD to pixelate to match.
   * @returns The scale.
   */
  get pixelScale(): number {
    return this._pixelScale;
  }

  /**
   * The element the world's canvas fills, for overlays drawn over it.
   * @returns The container.
   */
  get container(): HTMLElement {
    return this._ctx.container;
  }

  /**
   * Applies the TV's look settings (focus, vibrance, glow, aberration,
   * fog).
   * @param style The settings.
   */
  setStyle(style: StyleSettings): void {
    this._parts.display.setStyle(style);
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
    this._parts.overview.setMap();
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
   * Applies a tick's ground items, burning lights, and fountain victims,
   * and plays its one-off effects.
   * @param items Items on the ground.
   * @param lights Burning lights.
   * @param events The tick's events.
   * @param victims Monsters blood fountains hold.
   */
  setWorldState(items: ItemState[], lights: LightState[], events: GameEvent[], victims: VictimState[] = []): void {
    this._ctx.items = items;
    this._ctx.piles.set(items);
    this._ctx.lightMap.darken(this._ctx.piles.group);
    this._ctx.lights = lights;
    this._ctx.victims = victims;
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
   * Scorched ground, fire trails, and incense on the ground this tick.
   * @param patches The patches.
   */
  setPatches(patches: PatchState[]): void {
    this._ctx.patches.set(patches);
  }

  /**
   * Applies the latest monsters: creates, updates, and removes avatars.
   * Vanished avatars wait for this tick's death events to tear them apart.
   * @param monsters Every monster.
   */
  setMonsters(monsters: MonsterState[]): void {
    this._parts.monsters.set(monsters);
  }

  /**
   * The world events that are up, whose looks ease in (and out once they
   * end).
   * @param events The events.
   */
  setWorldEvents(events: WorldEventState[]): void {
    this._parts.look.active = events.map((e: WorldEventState) => e.kind);
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
    this.setMonsters([]);
    this.setWorldState([], [], []);
    freeScene(this._ctx, this._parts);
  }

  /**
   * Resizes the low-res buffer when the zoom changes the pixel scale.
   */
  private syncPixelScale(): void {
    const scale = this._pixelOverride ?? Math.max(1, Math.round(pixelScaleFor(this._ctx.camera.top, this._pixelLimit) * this._pixelBoost));
    if (scale !== this._pixelScale) {
      this._pixelScale = scale;
      this.resize();
    }
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
    const lowW = Math.max(1, Math.floor(w / this._pixelScale));
    const lowH = Math.max(1, Math.floor(h / this._pixelScale));
    this._ctx.renderer.setSize(lowW, lowH, false);
    this._parts.post.setSize(lowW, lowH);
    this._parts.rig.fit();
  }

  /**
   * When a frame last logged an error (ms), to log one every few seconds.
   */
  private _failedAt = 0;

  /**
   * Draws a frame and asks for the next. A frame that throws is logged (at
   * most every 5s) and the next one tries again, so one bad model can't
   * freeze the screen.
   */
  private _loop = (): void => {
    this._frame = requestAnimationFrame(this._loop);
    try {
      this.syncPixelScale();
      const dt = Math.min(this._ctx.clock.getDelta(), 0.1);
      const time = this._ctx.clock.elapsedTime;
      this._frameLoop.run(dt, time);
    } catch (err) {
      if (performance.now() - this._failedAt > 5000) {
        this._failedAt = performance.now();
        console.error('[renderer] a frame failed', err);
      }
    }
  };
}
