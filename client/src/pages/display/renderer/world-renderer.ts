// Packages
import {
  BasicShadowMap,
  Box3,
  BoxGeometry,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OrthographicCamera,
  Plane,
  Raycaster,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { BOLT_SPEED, GEAR } from '@halloween/shared/gear';
import { GATHERABLE, GRAVE_TILES } from '@halloween/shared/items';
import { ARROW_SPEED, GHOST_SHOT_SPEED, MONSTER_RADIUS, POTION_SPEED } from '@halloween/shared/monsters';
import { PLAYER_RADIUS } from '@halloween/shared/players';
import { brushRadius } from '@halloween/shared/map-edit';
import {
  BUILDABLE_FLOORS,
  CANDLE_LIGHT,
  CURSOR_LIGHT,
  LAMP_LIGHT,
  LANTERN_LIGHT,
  LOW_FUEL,
  PUMPKIN_LIGHT,
  RAISED,
  STRUCTURES,
  isStructure,
} from '@halloween/shared/structures';
import {
  LEVEL_HEIGHT,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_LEVEL,
  MIN_LEVEL,
  RAMP_DIRS,
  WorldMap,
  facingTile,
  placeTile,
  isSolidTile,
} from '@halloween/shared/world';

// Local Imports
import {
  buildGraveyard,
  buildOutskirts,
  buildShrub,
  buildTile,
  buildTilePieces,
  buildTower,
  isGround,
  shrubBetween,
  toWorld,
} from './build-graveyard';
import { AltarGauges } from './altar-gauges';
import { ChipBursts } from './chip-bursts';
import { Dangle } from './dangle';
import { Flames } from './flames';
import { Fog } from './fog';
import { Gore } from './gore';
import { HealthBars } from './health-bars';
import { ItemPiles } from './item-piles';
import { LightMap } from './light-map';
import { MonsterAvatar } from './monster-avatar';
import { PickupPopups } from './pickup-popups';
import { DEFAULT_STYLE, NO_BLOOM_LAYER, PostEffects } from './post-effects';
import {
  LABEL_HEIGHT,
  PlayerAvatar,
} from './player-avatar';
import { Puddles } from './puddles';
import { TreeSway } from './tree-sway';

// Types
import type { ItemState } from '@halloween/shared/items';
import type {
  GameEvent,
  GrownTile,
  LiftTarget,
  LightState,
  MapView,
  MonsterState,
  PlayerState,
  PuddleState,
  ShotState,
} from '@halloween/shared/protocol';
import type { MonsterKind } from '@halloween/shared/monsters';
import type { LightDef, StructureKind } from '@halloween/shared/structures';
import type { Tile, TileChange } from '@halloween/shared/world';
import type { StaticLight } from './build-graveyard';
import type { FlameSpot } from './flames';
import type { FogStamp } from './fog';
import type { ShakeSource } from './tree-sway';
import type { LightSource } from './light-map';
import type { PlacePreview } from './player-avatar';
import type { StyleSettings } from './post-effects';

/**
 * Screen pixels per rendered pixel. The scene renders at 1/PIXEL_SCALE
 * resolution and is upscaled with nearest-neighbor for the chunky look.
 */
const PIXEL_SCALE = 3;

/**
 * Camera elevation above the horizon, in radians.
 */
const CAMERA_ELEVATION = (55 * Math.PI) / 180;

/**
 * The map editor's top-down view: steep enough that a level's wall hides
 * only a sliver of the tile behind it. The camera eases between the two at
 * CAMERA_TILT_RATE radians a second.
 */
const TOP_VIEW_ELEVATION = (80 * Math.PI) / 180;
const CAMERA_TILT_RATE = 1.2;
const CAMERA_DISTANCE = 60;

/**
 * Head-room above the ground plane the camera keeps in frame, in tiles.
 */
const VIEW_MARGIN = 1.2;

/**
 * Puff colors when a monster dies, and smoke from a snuffed light.
 */
const DEATH_PUFF: Record<MonsterKind, string> = { zombie: '#7fa36a', vampire: '#8a1022', ghost: '#cfe3ff', brute: '#6f7f62', skeleton: '#e6e0cc', witch: '#5a3a7a', ghoul: '#8a8a7a', demon: '#24141c' };
const SMOKE = '#55565c';

/**
 * Strength of the light a player carries; full strength blows out a bright
 * hood right beside it.
 */
const PLAYER_LIGHT = 0.75;

/**
 * Bits flying off a smashed pumpkin (flesh, then candle sparks when it
 * bursts) and a chest breaking open (splinters and a glint of gold).
 */
const PUMPKIN_FLESH = '#d9661e';
const CANDLE_SPARK = '#ffb347';
const CHEST_SPLINTER = '#6b4527';
const GOLD_SPARK = '#f5d76e';

/**
 * Earth thrown up by things growing, and how long each takes to grow in
 * (seconds).
 */
const DIRT = '#3a2e24';

/**
 * Broken things fall apart into chunks no longer than this (world units).
 */
const DEBRIS_CHUNK = 0.22;
const GROW_TIME: Record<GrownTile, number> = { tree: 2.6, pumpkin: 1.6, chest: 1.4, tombstone: 1.8, cross: 1.8 };

/**
 * How long a dug-up gravestone takes to shudder down into the ground
 * (seconds).
 */
const SINK_TIME = 1.4;

/**
 * Blood: dark and old for zombies, bright for vampires and players.
 */
const BLOOD: Record<MonsterKind, string> = { zombie: '#b0221a', vampire: '#e8142c', ghost: '#9fb8d8', brute: '#8f1a14', skeleton: '#cfc8b0', witch: '#4f8a2a', ghoul: '#6a7a3a', demon: '#3a0814' };

/**
 * A witch's potion bursting, and the smoke a demon leaves and arrives in
 * when it steps through the shadows.
 */
const POTION_SPLASH = '#b04aff';

/**
 * Earth a brute's fists throw up when they hit the ground, and the
 * darker scuff they leave there for a while.
 */
const SLAM_DIRT = '#5a4430';
const SLAM_MARK = '#2a1f16';
const SHADOW_SMOKE = '#1a1020';
const PLAYER_BLOOD = '#e41c24';

/**
 * How far (tiles) from a struck monster the striker can be: the longest
 * melee reach, with some slack for movement.
 */
const STRIKER_RANGE = 3.2;

/**
 * Shots in flight: how many can be drawn at once, their height above the
 * ground, and their look: a crossbow bolt is a pale streak, a gob of blood
 * a glowing crimson blob trailing a darker smear.
 */
const SHOT_POOL = 24;
const SHOT_HEIGHT = 0.55;
const SHOT_COLOR = '#f2e6c4';
const SHOT_BOX = new BoxGeometry(0.45, 0.035, 0.035);
const GOB_COLOR = '#e0182c';
const GOB_BOX = new BoxGeometry(0.14, 0.12, 0.12);
const SMEAR_COLOR = '#8a0c18';
const SMEAR_BOX = new BoxGeometry(0.34, 0.06, 0.06);

/**
 * A ghost's ball of ectoplasm: a pale glowing core in a see-through halo,
 * pulsing as it drifts.
 */
const ECTO_CORE = '#d8f4ff';
const ECTO_HALO = '#8fc8f0';
const ECTO_CORE_BOX = new BoxGeometry(0.13, 0.13, 0.13);
const ECTO_HALO_BOX = new BoxGeometry(0.24, 0.24, 0.24);

/**
 * A skeleton's arrow (a dark shaft with a pale fletching) and a witch's
 * potion (a glowing green flask, lobbed high and tumbling).
 */
const ARROW_SHAFT = '#5a4028';
const ARROW_FLETCH = '#e6e0cc';
const ARROW_BOX = new BoxGeometry(0.42, 0.025, 0.025);
const FLETCH_BOX = new BoxGeometry(0.08, 0.05, 0.05);
const POTION_GLOW = '#b04aff';
const POTION_GLASS = '#e8ccff';
const POTION_BOX = new BoxGeometry(0.13, 0.13, 0.13);
const POTION_NECK_BOX = new BoxGeometry(0.05, 0.07, 0.05);
const POTION_ARC = 1.4;

/**
 * How fast each kind of shot flies, to carry it forward between ticks.
 */
const SHOT_SPEEDS: Record<ShotState['kind'], number> = { bolt: BOLT_SPEED, blood: BOLT_SPEED, ecto: GHOST_SHOT_SPEED, arrow: ARROW_SPEED, potion: POTION_SPEED };

/**
 * How high health bars float over a hit tile (low, so they don't cover the
 * name of whoever is hitting it) and over a monster's head.
 */
const TILE_BAR_LIFT = 0.35;
const MONSTER_BAR_LIFT = 1.05;

/**
 * Dust kicked up where an axe lands, and the screen shake when a hit
 * connects (seconds, world units).
 */
const DUST = '#6b6052';
const SHAKE_TIME = 0.16;
const SHAKE_AMOUNT = 0.14;

/**
 * Pale light a ghost gives off (display only: vampires still treat these
 * tiles as dark). Zombies and vampires light nothing; only their eyes are
 * bright.
 */
const GHOST_GLOW: LightDef = { radius: 1.8, burn: Infinity, color: '#b8d4ff' };
const GHOST_GLOW_INTENSITY = 0.3;

/**
 * Moonlight color normally and under a blood moon, and how fast (per
 * second) the scene shifts between them.
 */
const MOON = new Color('#9fb4ff');
const BLOOD_MOON = new Color('#ff7a66');
const BLOOD_MOON_FADE = 0.12;

/**
 * Sunlight for the Game tab's daytime, and how fast (per second) day breaks
 * or night falls.
 */
const SUN = new Color('#fff0d4');
const DAY_FADE = 0.5;
const NIGHT_SKY = new Color('#4a5a8a');
const NIGHT_GROUND = new Color('#0a0a10');
const DAY_SKY = new Color('#dfe8ff');
const DAY_GROUND = new Color('#5a5040');

/**
 * How high the TV's mouse holds up a player or monster, how fast it rises
 * and settles (per second), and how close (in tiles, on screen) a click
 * must land to grab one.
 */
const LIFT_HEIGHT = 1.2;
const LIFT_SPEED = 6;
const GRAB_RADIUS = 0.7;

/**
 * Color of the map editor's brush outline.
 */
const EDIT_CURSOR = '#ffd166';

/**
 * Height above the feet that something held up hangs from (about the top
 * of its head).
 */
const PLAYER_PIVOT = 0.85;
const MONSTER_PIVOT = 0.8;

/**
 * Flame placement per burning structure: base height and size.
 */
/**
 * How deep each kind of light's slow flicker dips (0..1): flames breathe
 * the most, lamp posts barely.
 */
const FLICKER_DEPTH = { flame: 0.22, pumpkin: 0.14, candle: 0.14, lamp: 0.06, lantern: 0.08 };

/**
 * A slow, irregular 0..1 multiplier for one light, from two out-of-step
 * waves so neighbors never pulse together.
 */
function flicker(time: number, seed: number, depth: number): number {
  const wave = 0.6 * Math.sin(time * 1.3 + seed * 1.7) + 0.4 * Math.sin(time * 2.9 + seed * 3.1);
  return 1 - depth * (0.5 + 0.5 * wave);
}

const FLAME_SHAPES: Partial<Record<StructureKind, { height: number; size: number; dy?: number; blood?: boolean; soul?: boolean }>> = {
  'ghost-lamp': { height: 1.3, size: 0.4, soul: true },
  'soul-fire': { height: 0.14, size: 1.6, soul: true },
  torch: { height: 1.0, size: 0.55 },
  lantern: { height: 1.26, size: 0.36 },
  campfire: { height: 0.12, size: 1.3 },
  furnace: { height: 0.15, size: 0.42, dy: 0.06 },
  bloodforge: { height: 0.15, size: 0.42, dy: 0.04, blood: true },
  altar: { height: 0.74, size: 0.4, dy: -0.06, blood: true },
  cauldron: { height: 0.06, size: 0.5 },
};

/**
 * Disposes and removes every voxel batch under `group`.
 */
function disposeVoxels(group: Group): void {
  group.traverse((obj): void => {
    if (obj instanceof InstancedMesh) {
      obj.geometry.dispose();
      obj.material.dispose();
    }
  });
  group.clear();
}

/**
 * Owns the three.js scene for the TV: the graveyard voxels (rebuilt when
 * tiles change), darkness from a light map, flames, ground items, and one
 * PlayerAvatar per player. React feeds it messages; it renders on its own
 * animation frame loop.
 */
export class WorldRenderer {
  private renderer = new WebGLRenderer({ antialias: false });
  private scene = new Scene();
  private camera = new OrthographicCamera();
  private clock = new Clock();
  private avatars = new Map<string, PlayerAvatar>();
  private monsters = new Map<number, MonsterAvatar>();
  private items: ItemState[] = [];
  private moon: DirectionalLight;
  private sky = new HemisphereLight(NIGHT_SKY, NIGHT_GROUND, 2);
  private bloodMoon = false;
  private lightsOff = false;
  private bloodMix = 0;
  private daytime = false;

  /**
   * The map editor's view: flat daylight, and monsters hidden.
   */
  private flat = false;
  private monstersHidden = false;
  private xray = false;
  private dayMix = 0;
  private cursorLight: { x: number; y: number } | null = null;
  private liftHeights = new Map<string, number>();
  private editCursor: Mesh | null = null;
  private stairsGhost: { key: string; group: Group } | null = null;
  private dangles = new Map<string, Dangle>();
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private ground = new Plane(new Vector3(0, 1, 0), 0);
  private hit = new Vector3();
  private resizeObserver: ResizeObserver;
  private frame = 0;
  private frames = 0;
  private fpsSince = 0;

  /**
   * Frames drawn per second, over the last second.
   */
  fps = 0;
  private projected = new Vector3();
  private map: WorldMap | null = null;
  private seed = 0;
  private worldGroup = new Group();
  private tower: { back: Group; front: Group; x: number; y: number; w: number; h: number } | null = null;
  private outskirts = new Group();
  private outskirtsSpan = { x: 0, y: 0 };
  private neededSpan = { x: 0, y: 0 };
  private staticLights: StaticLight[] = [];
  private lights: LightState[] = [];
  private lightMap = new LightMap();
  private flames = new Flames();
  private piles = new ItemPiles((x: number, y: number): number => this.elevation(x, y));
  private chips = new ChipBursts();
  private pickups = new PickupPopups();
  private altarGauges = new AltarGauges();
  private healthBars: HealthBars;
  private gore: Gore;
  private dying: MonsterAvatar[] = [];
  private debrisMaterials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();
  private growing = new Map<number, { tx: number; ty: number; tile: GrownTile; age: number; group: Group | null; height?: number }>();
  private sinking: { x: number; y: number; age: number; group: Group; height: number }[] = [];
  private shots: ShotState[] = [];
  private shotsAt = 0;
  private shotMaterial = new MeshBasicMaterial({ color: SHOT_COLOR });
  private gobMaterial = new MeshBasicMaterial({ color: GOB_COLOR });
  private smearMaterial = new MeshBasicMaterial({ color: SMEAR_COLOR });
  private shotMeshes: { bolt: Mesh; gob: Group; ecto: Group; arrow: Group; potion: Group }[] = [];
  private arrowMaterial = new MeshBasicMaterial({ color: ARROW_SHAFT });
  private fletchMaterial = new MeshBasicMaterial({ color: ARROW_FLETCH });
  private potionGlow = new MeshBasicMaterial({ color: POTION_GLOW });
  private potionGlass = new MeshBasicMaterial({ color: POTION_GLASS });
  private ectoCore = new MeshBasicMaterial({ color: ECTO_CORE });
  private ectoHalo = new MeshBasicMaterial({ color: ECTO_HALO, transparent: true, opacity: 0.35, depthWrite: false });
  private colors = new Map<string, Color>();
  private post: PostEffects;
  private fog = new Fog(this.lightMap);
  private fogStamps: FogStamp[] = [];
  private impacts = new Map<string, number>();
  private treeSway = new TreeSway();
  private puddles = new Puddles();
  private cameraHome = new Vector3();

  /**
   * The part of the map the camera frames (the sandbox's arena), or null
   * for the whole map.
   */
  private view: MapView | null = null;
  private cameraAngle = CAMERA_ELEVATION;
  private topView = false;
  private shake = 0;
  private focusPoints: { x: number; y: number }[] = [];

  constructor(private container: HTMLElement, private labelLayer: HTMLElement) {
    this.healthBars = new HealthBars(labelLayer);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;
    this.renderer.setPixelRatio(1);
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.imageRendering = 'pixelated';
    container.prepend(canvas);

    this.scene.background = new Color('#07080f');
    this.scene.add(this.sky);

    const moon = new DirectionalLight(MOON, 2.2);
    this.moon = moon;
    moon.position.set(-12, 24, -10);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    const s = moon.shadow.camera;
    s.left = -MAP_WIDTH / 2 - 2;
    s.right = MAP_WIDTH / 2 + 2;
    s.top = MAP_HEIGHT / 2 + 4;
    s.bottom = -MAP_HEIGHT / 2 - 4;
    s.near = 1;
    s.far = 80;
    this.scene.add(moon);

    this.gore = new Gore(this.scene, (x: number, y: number): number => this.elevation(x, y));
    this.lightMap.darken(this.piles.group);
    this.lightMap.darken(this.chips.group);
    this.lightMap.darken(this.gore.group);
    this.scene.add(this.puddles.group);
    this.scene.add(this.worldGroup, this.outskirts, this.flames.group, this.piles.group, this.chips.group, this.gore.group, this.pickups.group, this.altarGauges.group, this.fog.group);
    for (let i = 0; i < SHOT_POOL; i++) {
      const bolt = new Mesh(SHOT_BOX, this.shotMaterial);
      const gob = new Group();
      const smear = new Mesh(SMEAR_BOX, this.smearMaterial);
      smear.position.x = -0.16;
      gob.add(new Mesh(GOB_BOX, this.gobMaterial), smear);
      const ecto = new Group();
      ecto.add(new Mesh(ECTO_CORE_BOX, this.ectoCore), new Mesh(ECTO_HALO_BOX, this.ectoHalo));
      const arrow = new Group();
      const fletch = new Mesh(FLETCH_BOX, this.fletchMaterial);
      fletch.position.x = -0.19;
      arrow.add(new Mesh(ARROW_BOX, this.arrowMaterial), fletch);
      const potion = new Group();
      const neck = new Mesh(POTION_NECK_BOX, this.potionGlass);
      neck.position.y = 0.09;
      potion.add(new Mesh(POTION_BOX, this.potionGlow), neck);
      bolt.visible = false;
      gob.visible = false;
      ecto.visible = false;
      arrow.visible = false;
      potion.visible = false;
      this.shotMeshes.push({ bolt, gob, ecto, arrow, potion });
      this.scene.add(bolt, gob, ecto, arrow, potion);
    }

    this.aimCamera();
    this.camera.near = 1;
    this.camera.far = 200;

    this.post = new PostEffects(this.renderer, this.scene, this.camera);
    this.setStyle(DEFAULT_STYLE);

    this.resizeObserver = new ResizeObserver((): void => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.frame = requestAnimationFrame(this.loop);
  }

  /**
   * Broad daylight (the Game tab's daytime), fading in over a couple of
   * seconds.
   */
  setDaytime(on: boolean): void {
    this.daytime = on;
  }

  /**
   * The map editor's flat lighting: broad daylight with no blood moon, no
   * matter the game's own settings.
   */
  setFlatLight(on: boolean): void {
    this.flat = on;
  }

  /**
   * The map editor's x-ray for shaping the land: trees, structures, and
   * landmarks are left out (ground, cliffs, stairs, and the fence stay), so
   * every tile can be seen and clicked.
   */
  setXray(on: boolean): void {
    if (on === this.xray) {
      return;
    }
    this.xray = on;
    if (this.map) {
      this.rebuildWorld();
    }
    if (this.tower) {
      this.tower.back.visible = !on;
      this.tower.front.visible = !on;
    }
  }

  /**
   * Hides monsters and their shots (the map editor's view).
   */
  setMonstersHidden(hidden: boolean): void {
    this.monstersHidden = hidden;
  }

  /**
   * The terrain level of a tile, for the map editor.
   */
  levelAt(tx: number, ty: number): number {
    return this.map?.level(tx, ty) ?? 0;
  }

  /**
   * Rings the tiles the map editor's round brush covers (`size` tiles
   * across, around a tile), drawn over everything, or hides it (null).
   */
  setEditCursor(c: { tx: number; ty: number; size: number } | null): void {
    if (!c || !this.map) {
      if (this.editCursor) {
        this.editCursor.visible = false;
      }
      return;
    }
    if (!this.editCursor) {
      this.editCursor = new Mesh(new RingGeometry(0.86, 1, 48), new MeshBasicMaterial({ color: EDIT_CURSOR, depthTest: false, transparent: true, opacity: 0.9, side: DoubleSide }));
      this.editCursor.rotation.x = -Math.PI / 2;
      this.editCursor.renderOrder = 10;
      this.editCursor.layers.set(NO_BLOOM_LAYER);
      this.scene.add(this.editCursor);
    }
    const { x, z } = toWorld(c.tx + 0.5, c.ty + 0.5);
    const radius = brushRadius(c.size) + 0.2;
    this.editCursor.position.set(x, this.map.base(c.tx, c.ty) + 0.05, z);
    this.editCursor.scale.set(radius, radius, 1);
    this.editCursor.visible = true;
  }

  /**
   * The light the TV's right mouse button carries, or null.
   */
  setCursorLight(at: { x: number; y: number } | null): void {
    this.cursorLight = at;
  }

  /**
   * The map point (in tiles) under a screen point, on the ground there.
   */
  groundAt(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    let x = 0;
    let y = 0;
    let height = 0;
    for (let i = 0; i < 3; i++) {
      this.ground.constant = -height;
      if (!this.raycaster.ray.intersectPlane(this.ground, this.hit)) {
        break;
      }
      x = this.hit.x + MAP_WIDTH / 2;
      y = this.hit.z + MAP_HEIGHT / 2;
      height = this.elevation(x, y);
    }
    return { x, y };
  }

  /**
   * Where the map editor's stairs could go for a pointed-at tile, each with
   * the way (an index into RAMP_DIRS) they'd climb: on the tile itself, up
   * to any open neighbor standing higher, or, when nothing around it is
   * higher (the top of a wall), at the foot of each wall it stands over,
   * climbing up into it (the one facing the camera first).
   */
  stairsOptions(tx: number, ty: number): { tx: number; ty: number; dir: number }[] {
    const map = this.map;
    if (!map || map.isSolid(tx, ty) || tx <= 0 || ty <= 0 || tx >= MAP_WIDTH - 1 || ty >= MAP_HEIGHT - 1) {
      return [];
    }
    const own = map.base(tx, ty);
    const up = RAMP_DIRS.flatMap(([dx, dy], i: number) => (!map.isSolid(tx + dx, ty + dy) && map.base(tx + dx, ty + dy) > own ? [{ tx, ty, dir: i }] : []));
    if (up.length > 0) {
      return up;
    }
    return RAMP_DIRS.flatMap(([dx, dy], i: number) => {
      const fx = tx - dx;
      const fy = ty - dy;
      const ok = fx > 0 && fy > 0 && fx < MAP_WIDTH - 1 && fy < MAP_HEIGHT - 1 && !map.isSolid(fx, fy) && map.get(fx, fy) !== 'stairs' && map.base(fx, fy) < own;
      return ok ? [{ tx: fx, ty: fy, dir: i }] : [];
    }).sort((a, b): number => b.ty - a.ty);
  }

  /**
   * The way (an index into RAMP_DIRS) the stairs on a tile climb, or null.
   */
  rampDir(tx: number, ty: number): number | null {
    const up = this.map?.rampUp(tx, ty);
    return up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : null;
  }

  /**
   * Shows the stairs the map editor would place on a tile, climbing `dir`
   * if they can, else whichever way the game would pick, or hides them
   * (null). Says which way the shown stairs climb (null when nothing
   * there is higher).
   */
  setStairsGhost(g: { tx: number; ty: number; dir: number | null } | null): number | null {
    if (!g || !this.map) {
      if (this.stairsGhost) {
        this.stairsGhost.group.visible = false;
      }
      return null;
    }
    const map = WorldMap.decode(this.map.encode(), this.map.encodeLevels(), this.map.encodeRamps())!;
    map.set(g.tx, g.ty, 'stairs');
    map.setRamp(g.tx, g.ty, g.dir);
    const up = map.rampUp(g.tx, g.ty);
    const shown = up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : null;
    const key = `${g.tx},${g.ty},${shown},${this.map.encodeLevels()}`;
    if (this.stairsGhost?.key !== key) {
      if (this.stairsGhost) {
        this.scene.remove(this.stairsGhost.group);
        this.stairsGhost.group.children.forEach((o) => (o as Mesh).geometry.dispose());
        ((this.stairsGhost.group.children[0] as Mesh).material as MeshBasicMaterial).dispose();
      }
      const material = new MeshBasicMaterial({ color: EDIT_CURSOR, depthTest: false, transparent: true, opacity: 0.6 });
      const group = new Group();
      const [dx, dz] = up ?? [0, -1];
      const base = map.base(g.tx, g.ty);
      const rise = Math.max(0.2, map.top(g.tx, g.ty) - base);
      for (let i = 0; i < 4; i++) {
        const offset = -0.375 + i * 0.25;
        const h = (i + 1) * (rise / 4);
        const step = new Mesh(new BoxGeometry(dx !== 0 ? 0.22 : 0.9, h, dx !== 0 ? 0.9 : 0.22), material);
        step.position.set(dx * offset, base + h / 2, dz * offset);
        step.renderOrder = 9;
        step.layers.set(NO_BLOOM_LAYER);
        group.add(step);
      }
      const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
      group.position.set(x, 0, z);
      this.scene.add(group);
      this.stairsGhost = { key, group };
    }
    this.stairsGhost.group.visible = true;
    return shown;
  }

  /**
   * The tiles under a screen point for the map editor, nearest first: every
   * column of ground the view ray runs into as it goes on through the
   * terrain, so tiles hidden behind a raised block can be reached too (the
   * editor steps through them with the scroll wheel). When the ray meets
   * the side of a block, that block counts, unless the tile in front of the
   * wall is sunk below the ground (a pit or a valley seen across its back
   * wall), then that one does. Only tiles on the map.
   */
  pickTiles(clientX: number, clientY: number): { tx: number; ty: number; x: number; y: number }[] {
    const map = this.map;
    const hits: { tx: number; ty: number; x: number; y: number }[] = [];
    if (!map) {
      return hits;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const { origin: o, direction: d } = this.raycaster.ray;
    if (d.y >= 0) {
      return hits;
    }
    const start = (o.y - (MAX_LEVEL + 1) * LEVEL_HEIGHT) / -d.y;
    const end = (o.y - (MIN_LEVEL - 1) * LEVEL_HEIGHT) / -d.y;
    const step = 0.04 / Math.max(0.2, Math.hypot(d.x, d.z));
    const drop = step * -d.y;
    let prev: { tx: number; ty: number } | null = null;
    let inside = false;
    for (let t = Math.max(0, start); t <= end && hits.length < 6; t += step) {
      const x = o.x + d.x * t + MAP_WIDTH / 2;
      const y = o.z + d.z * t + MAP_HEIGHT / 2;
      const h = o.y + d.y * t;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const ground = map.elevationAt(x, y);
      if (h <= ground && !inside) {
        let hit = { tx, ty };
        if (prev && (prev.tx !== tx || prev.ty !== ty) && ground - h > drop * 1.5 && map.level(prev.tx, prev.ty) < 0) {
          hit = prev;
        }
        if (hit.tx >= 0 && hit.ty >= 0 && hit.tx < MAP_WIDTH && hit.ty < MAP_HEIGHT && !hits.some((o2) => o2.tx === hit.tx && o2.ty === hit.ty)) {
          hits.push({ ...hit, x, y });
        }
      }
      inside = h <= ground;
      prev = { tx, ty };
    }
    return hits;
  }

  /**
   * The map as the TV has it, for the map editor's picker.
   */
  worldMap(): WorldMap | null {
    return this.map;
  }

  /**
   * What's on a tile, for the map editor.
   */
  tileKind(tx: number, ty: number): Tile | null {
    return this.map?.get(tx, ty) ?? null;
  }

  /**
   * The living player or monster drawn closest to a screen point, if one is
   * close enough to grab.
   */
  entityAt(clientX: number, clientY: number): LiftTarget | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const reach = (GRAB_RADIUS * rect.height) / (this.camera.top - this.camera.bottom);
    let best: LiftTarget | null = null;
    let bestD = reach;
    const check = (group: Group, target: LiftTarget): void => {
      this.projected.set(group.position.x, group.position.y + 0.45, group.position.z).project(this.camera);
      const d = Math.hypot(rect.left + ((this.projected.x + 1) / 2) * rect.width - clientX, rect.top + ((1 - this.projected.y) / 2) * rect.height - clientY);
      if (d < bestD) {
        best = target;
        bestD = d;
      }
    };
    for (const avatar of this.avatars.values()) {
      if (avatar.target.connected && !avatar.target.dead) {
        check(avatar.group, { kind: 'player', id: avatar.target.id });
      }
    }
    for (const monster of this.monsters.values()) {
      check(monster.group, { kind: 'monster', id: monster.target.id });
    }
    return best;
  }

  /**
   * Swings whatever is held up like a rag doll from the top of its head;
   * forgets the swing once it's back on the ground.
   */
  private dangle(key: string, group: Group, lift: number, pivot: number, dt: number, time: number): void {
    if (lift <= 0) {
      this.dangles.delete(key);
      return;
    }
    let dangle = this.dangles.get(key);
    if (!dangle) {
      dangle = new Dangle();
      this.dangles.set(key, dangle);
    }
    dangle.update(dt, group.position.x, group.position.z);
    dangle.apply(group, pivot, lift / LIFT_HEIGHT, time);
  }

  /**
   * How high something is held up by the TV's mouse right now, easing up
   * while it's lifted and back down once it's dropped.
   */
  private liftHeight(key: string, lifted: boolean, dt: number): number {
    const before = this.liftHeights.get(key) ?? 0;
    const now = Math.min(LIFT_HEIGHT, Math.max(0, before + (lifted ? 1 : -1) * LIFT_HEIGHT * LIFT_SPEED * dt));
    if (now === 0) {
      this.liftHeights.delete(key);
    } else {
      this.liftHeights.set(key, now);
    }
    return now;
  }

  /**
   * Puts out every light on the TV, glowing pumpkin faces and candles
   * included (the Game tab's Lights off).
   */
  setLightsOff(off: boolean): void {
    this.lightsOff = off;
    this.showGlow();
  }

  private showGlow(): void {
    this.worldGroup.traverse((o): void => {
      if (o instanceof InstancedMesh && o.material instanceof MeshBasicMaterial) {
        o.visible = !this.lightsOff;
      }
    });
  }

  /**
   * Applies the TV's look settings (focus, vibrance, glow, aberration).
   */
  setStyle(style: StyleSettings): void {
    this.post.setStyle(style);
    this.fog.setDensity(style.fog * 2);
    this.lightMap.setBoost(1 + style.vibrance * 0.5);
  }

  /**
   * Replaces the whole world, on connect or after a reset.
   */
  setWorld(seed: number, tiles: string, levels: string, ramps?: string, view: MapView | null = null): void {
    const map = WorldMap.decode(tiles, levels, ramps);
    if (!map) {
      return;
    }
    this.map = map;
    this.seed = seed;
    this.view = view;
    this.rebuildWorld();
    this.buildOutskirts();
    this.buildTowerModel();
    this.aimCamera();
    this.fitCamera();
  }

  /**
   * (Re)builds the watchtower's upper walls.
   */
  private buildTowerModel(): void {
    if (this.tower) {
      disposeVoxels(this.tower.back);
      disposeVoxels(this.tower.front);
      this.scene.remove(this.tower.back, this.tower.front);
    }
    this.tower = buildTower(this.map!, this.seed);
    if (this.tower) {
      this.lightMap.darken(this.tower.back);
      this.lightMap.darken(this.tower.front);
      this.scene.add(this.tower.back, this.tower.front);
    }
  }

  /**
   * Cuts the front of the tower away while a living player
   * is inside it, so they can be seen climbing.
   */
  private updateTower(): void {
    if (!this.tower) {
      return;
    }
    const { x, y, w, h } = this.tower;
    const inside = [...this.avatars.values()].some(({ target: p }): boolean =>
      !p.dead && p.x > x && p.x < x + w && p.y > y && p.y < y + h + 0.5);
    this.tower.front.visible = !inside && !this.xray;
    this.tower.back.visible = !this.xray;
  }

  /**
   * Mirrors server tile changes; the next frame rebuilds the voxels.
   * Anything that broke (a structure, pumpkin, chest, felled tree, or
   * mined-out rock) bursts into chunks first, and a dug-up gravestone sinks
   * into the ground. Stumps rotting away just vanish.
   */
  applyTiles(changes: TileChange[]): void {
    if (!this.map) {
      return;
    }
    for (const c of changes) {
      const tx = c.i % MAP_WIDTH;
      const ty = Math.floor(c.i / MAP_WIDTH);
      const before = this.map.get(tx, ty);
      if (before === 'tree' && c.tile !== 'tree') {
        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
          if (shrubBetween(this.map, tx, ty, dx, dy)) {
            const [ax, ay] = dx + dy > 0 ? [tx, ty] : [tx + dx, ty + dy];
            this.sinkShrub(ax, ay, Math.abs(dx), Math.abs(dy));
          }
        }
      }
      if (GRAVE_TILES.has(before) && c.tile === 'mound') {
        this.sink(tx, ty);
      } else if (!isGround(before) && before !== 'stump' && (isGround(c.tile) || c.tile === 'stump')) {
        this.shatter(tx, ty);
      }
    }
    this.map.apply(changes);
  }

  /**
   * Draws a gravestone on its own so it can shudder down into the ground
   * (see `updateSinking`).
   */
  private sink(tx: number, ty: number): void {
    const group = new Group();
    group.add(buildTile(this.map!, this.seed, tx, ty));
    const { x, z } = toWorld(tx + 0.5, ty + 0.5);
    group.position.set(x, 0, z);
    this.lightMap.darken(group);
    this.scene.add(group);
    this.sinking.push({ x: tx + 0.5, y: ty + 0.5, age: 0, group, height: new Box3().setFromObject(group).max.y });
  }

  /**
   * Sinks the undergrowth between two trees into the ground, once one of
   * them falls.
   */
  private sinkShrub(tx: number, ty: number, dx: number, dy: number): void {
    const group = buildShrub(this.map!, this.seed, tx, ty, dx, dy);
    this.lightMap.darken(group);
    this.scene.add(group);
    const x = tx + 0.5 + dx / 2;
    const y = ty + 0.5 + dy / 2;
    const at = toWorld(x, y);
    group.position.set(at.x, 0, at.z);
    this.sinking.push({ x, y, age: 0, group, height: new Box3().setFromObject(group).max.y });
  }

  /**
   * Breaks the current contents of a tile into chunks thrown away from the
   * nearest player.
   */
  private shatter(tx: number, ty: number): void {
    const material = (color: string, glow: boolean): MeshLambertMaterial | MeshBasicMaterial => {
      const key = `${color}|${glow}`;
      let m = this.debrisMaterials.get(key);
      if (!m) {
        m = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
        this.debrisMaterials.set(key, m);
      }
      return m;
    };
    const pieces = buildTilePieces(this.map!, this.seed, tx, ty, material, DEBRIS_CHUNK);
    const holder = new Group();
    holder.add(...pieces);
    this.lightMap.darken(holder);
    const x = tx + 0.5;
    const y = ty + 0.5;
    let angle = Math.random() * Math.PI * 2;
    let nearest = 3;
    for (const avatar of this.avatars.values()) {
      const d = Math.hypot(avatar.target.x - x, avatar.target.y - y);
      if (d < nearest) {
        nearest = d;
        angle = Math.atan2(y - avatar.target.y, x - avatar.target.x);
      }
    }
    this.gore.shatter(pieces, this.elevation(x, y), angle);
    this.chips.puff(x, y, DUST, 12);
    this.lightMap.darken(this.chips.group);
  }

  /**
   * Applies a tick's ground items and burning lights, and plays its one-off
   * effects.
   */
  setWorldState(items: ItemState[], lights: LightState[], events: GameEvent[]): void {
    this.items = items;
    this.piles.set(items);
    this.lightMap.darken(this.piles.group);
    this.lights = lights;
    for (const e of events) {
      if (e.t === 'chips' || e.t === 'dig' || e.t === 'smash') {
        this.healthBars.hit(`t${e.tx},${e.ty}`, e.health, e.tx + 0.5, e.ty + 0.5, this.elevation(e.tx + 0.5, e.ty + 0.5), TILE_BAR_LIFT);
      }
      if (e.t === 'chips') {
        this.chips.burst(e.tx, e.ty, e.chip);
      } else if (e.t === 'dig') {
        this.chips.puff(e.tx + 0.5, e.ty + 0.75, DIRT, e.done ? 18 : 8);
        this.chips.burst(e.tx, e.ty, 'stone');
      } else if (e.t === 'monster-death') {
        this.killMonster(e.x, e.y, e.kind, e.angle);
      } else if (e.t === 'snuff') {
        this.chips.puff(e.tx + 0.5, e.ty + 0.5, SMOKE, 10);
      } else if (e.t === 'splash') {
        this.chips.puff(e.x, e.y, POTION_SPLASH, 26);
        this.gore.spatter(e.x, e.y, POTION_SPLASH, 18, null, 1.1);
        this.lightMap.darken(this.chips.group);
      } else if (e.t === 'blink') {
        this.chips.puff(e.fromX, e.fromY, SHADOW_SMOKE, 22);
        this.chips.puff(e.x, e.y, SHADOW_SMOKE, 22);
        this.lightMap.darken(this.chips.group);
      } else if (e.t === 'grow') {
        this.growing.set(e.ty * MAP_WIDTH + e.tx, { tx: e.tx, ty: e.ty, tile: e.tile, age: 0, group: null });
        this.chips.puff(e.tx + 0.5, e.ty + 0.5, DIRT, e.tile === 'pumpkin' ? 6 : 14);
      } else if (e.t === 'candy' || e.t === 'pickup') {
        this.pickups.spawn(e.t === 'candy' ? 'candy' : e.goods, e.x, e.y, this.elevation(e.x, e.y));
      } else if (e.t === 'smash' && e.tile === 'pumpkin') {
        this.chips.puff(e.tx + 0.5, e.ty + 0.5, PUMPKIN_FLESH, e.broke ? 22 : 8);
        this.gore.spatter(e.tx + 0.5, e.ty + 0.5, PUMPKIN_FLESH, e.broke ? 7 : 2, null, e.broke ? 0.9 : 0.5);
        if (e.broke) {
          this.chips.spark(e.tx + 0.5, e.ty + 0.5, CANDLE_SPARK, 8);
          this.gore.seeds(e.tx + 0.5, e.ty + 0.5, 16);
        }
      } else if (e.t === 'smash') {
        this.chips.puff(e.tx + 0.5, e.ty + 0.5, CHEST_SPLINTER, 18);
        this.chips.spark(e.tx + 0.5, e.ty + 0.5, GOLD_SPARK, 14);
      }
    }
    this.lightMap.darken(this.chips.group);
    for (const avatar of this.dying) {
      this.scene.remove(avatar.group);
      avatar.dispose();
    }
    this.dying = [];
  }

  /**
   * Bolts and blood in flight this tick.
   */
  setShots(shots: ShotState[]): void {
    this.shots = shots;
    this.shotsAt = this.clock.elapsedTime;
  }

  /**
   * Witches' puddles on the ground this tick.
   */
  setPuddles(puddles: PuddleState[]): void {
    this.puddles.set(puddles);
  }

  /**
   * A monster died at (x, y): the avatar that just vanished nearest there
   * bursts apart along `angle` in a spray of blood.
   */
  private killMonster(x: number, y: number, kind: MonsterKind, angle: number): void {
    let best = -1;
    let bestDist = 1.5;
    this.dying.forEach((avatar: MonsterAvatar, i: number): void => {
      const d = Math.hypot(avatar.target.x - x, avatar.target.y - y);
      if (avatar.target.kind === kind && d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    this.chips.puff(x, y, BLOOD[kind], 40);
    this.gore.spatter(x, y, BLOOD[kind], 22, angle, 1.8);
    this.gore.spatter(x, y, BLOOD[kind], 8, null, 0.8);
    if (best >= 0) {
      const [avatar] = this.dying.splice(best, 1);
      this.gore.tearApart(avatar.group, avatar.body, angle, (): void => avatar.dispose());
    } else {
      this.chips.puff(x, y, DEATH_PUFF[kind], 10);
    }
  }

  /**
   * Applies the latest monsters: creates, updates, and removes avatars.
   * Vanished avatars wait for this tick's death events to tear them apart.
   */
  setMonsters(monsters: MonsterState[], bloodMoon: boolean): void {
    this.bloodMoon = bloodMoon;
    const seen = new Set<number>();
    for (const m of monsters) {
      seen.add(m.id);
      const existing = this.monsters.get(m.id);
      if (existing) {
        if (m.hurts > existing.target.hurts) {
          const angle = this.knockFromNearestPlayer(existing, m);
          this.shake = SHAKE_TIME;
          this.chips.puff(m.x, m.y, BLOOD[m.kind], 30);
          this.gore.spatter(m.x, m.y, BLOOD[m.kind], 12, angle, 1.4);
          this.healthBars.hit(`m${m.id}`, m.health, m.x, m.y, this.elevation(m.x, m.y), MONSTER_BAR_LIFT);
          this.lightMap.darken(this.chips.group);
        }
        existing.target = m;
        continue;
      }
      const avatar = new MonsterAvatar(m);
      this.lightMap.darken(avatar.group);
      this.monsters.set(m.id, avatar);
      this.scene.add(avatar.group, avatar.trail);
    }
    for (const [id, avatar] of this.monsters) {
      if (!seen.has(id)) {
        this.healthBars.remove(`m${id}`);
        this.scene.remove(avatar.trail);
        this.dying.push(avatar);
        this.monsters.delete(id);
        this.impacts.delete(`m${id}`);
      }
    }
  }

  /**
   * Applies the latest server snapshot: creates, updates, and removes avatars.
   */
  setPlayers(players: PlayerState[]): void {
    const seen = new Set<string>();
    for (const p of players) {
      seen.add(p.id);
      const existing = this.avatars.get(p.id);
      if (existing) {
        if (p.hurts > existing.target.hurts) {
          this.shake = SHAKE_TIME;
          this.chips.puff(p.x, p.y, PLAYER_BLOOD, 24);
          this.gore.spatter(p.x, p.y, PLAYER_BLOOD, 10, null, 1);
          this.lightMap.darken(this.chips.group);
        }
        if (p.dead && !existing.target.dead) {
          this.chips.puff(existing.target.x, existing.target.y, PLAYER_BLOOD, 40);
          this.gore.spatter(existing.target.x, existing.target.y, PLAYER_BLOOD, 24, null, 1.6);
        }
        existing.target = p;
        continue;
      }
      const avatar = new PlayerAvatar(p, this.labelLayer);
      this.lightMap.darken(avatar.group);
      this.avatars.set(p.id, avatar);
      this.scene.add(avatar.group, avatar.marker, avatar.trail, avatar.blocker);
    }
    for (const [id, avatar] of this.avatars) {
      if (!seen.has(id)) {
        this.removeAvatar(id, avatar);
      }
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    for (const [id, avatar] of this.avatars) {
      this.removeAvatar(id, avatar);
    }
    this.setMonsters([], false);
    this.setWorldState([], [], []);
    this.gore.dispose();
    this.puddles.dispose();
    this.pickups.dispose();
    this.altarGauges.dispose();
    this.healthBars.dispose();
    this.debrisMaterials.forEach((m): void => m.dispose());
    this.shotMaterial.dispose();
    this.gobMaterial.dispose();
    this.ectoCore.dispose();
    this.ectoHalo.dispose();
    this.smearMaterial.dispose();
    this.clearWorld();
    disposeVoxels(this.outskirts);
    if (this.tower) {
      disposeVoxels(this.tower.back);
      disposeVoxels(this.tower.front);
    }
    this.growing.forEach(({ group }): void => {
      if (group) {
        disposeVoxels(group);
      }
    });
    this.sinking.forEach(({ group }): void => disposeVoxels(group));
    this.lightMap.dispose();
    this.post.dispose();
    this.flames.dispose();
    this.piles.dispose();
    this.chips.dispose();
    this.fog.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /**
   * A monster just got hit: whoever stands closest (within weapon reach)
   * swung, so the hit travels from them through the monster. Returns the
   * direction of the hit, or null if nobody was close (a bolt or spikes).
   */
  private knockFromNearestPlayer(monster: MonsterAvatar, m: MonsterState): number | null {
    let best: PlayerState | null = null;
    let bestDist = STRIKER_RANGE;
    for (const { target: p } of this.avatars.values()) {
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (!p.dead && d < bestDist) {
        best = p;
        bestDist = d;
      }
    }
    if (!best) {
      return null;
    }
    const angle = Math.atan2(m.y - best.y, m.x - best.x);
    monster.knock(angle);
    return angle;
  }

  private removeAvatar(id: string, avatar: PlayerAvatar): void {
    this.impacts.delete(id);
    this.scene.remove(avatar.group, avatar.marker, avatar.trail, avatar.blocker);
    avatar.dispose();
    this.avatars.delete(id);
  }

  /**
   * Marks the facing tile when Action would do something there, or shows
   * the build preview while the player has a structure picked.
   */
  private showTarget(avatar: PlayerAvatar): void {
    const p = avatar.target;
    if (!this.map) {
      avatar.showMarker(null);
      return;
    }
    const tile = facingTile(p.x, p.y, p.facing);
    const here = this.map.get(tile.tx, tile.ty);
    if (p.building) {
      const at = placeTile(p.x, p.y, p.facing, PLAYER_RADIUS);
      avatar.showMarker(at, this.placePreview(p.building, at.tx, at.ty), this.map.level(at.tx, at.ty) * LEVEL_HEIGHT);
      return;
    }
    avatar.showMarker(GATHERABLE[here] || GRAVE_TILES.has(here) || isStructure(here) || here === 'pumpkin' || here === 'chest' ? tile : null, null, this.elevation(tile.tx + 0.5, tile.ty + 0.5));
  }

  /**
   * Display-side copy of the server's build rules: only on open floor, and
   * anything walked into or onto needs the tile clear of people, monsters
   * (not ghosts), and items. Says what's in the way, for outlining it.
   */
  private placePreview(kind: StructureKind, tx: number, ty: number): PlacePreview {
    const map = this.map!;
    const base = map.level(tx, ty) * LEVEL_HEIGHT;
    if (!BUILDABLE_FLOORS.has(map.get(tx, ty))) {
      const tall = isSolidTile(map.get(tx, ty));
      return { kind, valid: false, blocker: tall ? { x: tx + 0.5, y: ty + 0.5, base, w: 1, h: 1.2 } : null };
    }
    if (!isSolidTile(kind) && !RAISED.has(kind)) {
      return { kind, valid: true, blocker: null };
    }
    const overlaps = (x: number, y: number, r: number): boolean => x + r > tx && x - r < tx + 1 && y + r > ty && y - r < ty + 1;
    const body = (x: number, y: number): PlacePreview => ({ kind, valid: false, blocker: { x, y, base: this.elevation(x, y), w: 0.7, h: 1.5 } });
    for (const { target: o } of this.avatars.values()) {
      if (!o.dead && overlaps(o.x, o.y, PLAYER_RADIUS)) {
        return body(o.x, o.y);
      }
    }
    for (const { target: m } of this.monsters.values()) {
      if (m.kind !== 'ghost' && overlaps(m.x, m.y, MONSTER_RADIUS)) {
        return body(m.x, m.y);
      }
    }
    const item = this.items.find((i: ItemState): boolean => Math.floor(i.x) === tx && Math.floor(i.y) === ty);
    if (item) {
      return { kind, valid: false, blocker: { x: item.x, y: item.y, base: this.elevation(item.x, item.y), w: 0.6, h: 0.35 } };
    }
    return { kind, valid: true, blocker: null };
  }

  /**
   * Gathers every light for this frame: pumpkins, burning structures (with
   * a slow flicker each, shrinking when low on fuel), player lanterns, and
   * ghosts.
   */
  private collectLights(time: number): { sources: LightSource[]; flames: FlameSpot[] } {
    const sources: LightSource[] = [];
    const flames: FlameSpot[] = [];
    const add = (x: number, y: number, def: LightDef, intensity: number, radiusScale = 1): void => {
      sources.push({ x, y, radius: def.radius * radiusScale, color: this.color(def.color), intensity });
    };

    this.staticLights.forEach((s: StaticLight, n: number): void => {
      if (this.lightsOff) {
        return;
      }
      const def = s.kind === 'lamp' ? LAMP_LIGHT : s.kind === 'candle' ? CANDLE_LIGHT : PUMPKIN_LIGHT;
      add(s.x, s.y, def, (s.kind === 'pumpkin' ? 0.8 : 1) * flicker(time, n, FLICKER_DEPTH[s.kind]));
    });
    for (const { i, fuel, radius, intensity } of this.lights) {
      const tile = this.map?.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
      const shape = tile && isStructure(tile) ? FLAME_SHAPES[tile] : undefined;
      if (!tile || !isStructure(tile) || !STRUCTURES[tile].light) {
        continue;
      }
      const x = (i % MAP_WIDTH) + 0.5;
      const y = Math.floor(i / MAP_WIDTH) + 0.5;
      const strength = Math.min(1, fuel / LOW_FUEL);
      add(x, y, { ...STRUCTURES[tile].light!, radius }, intensity * flicker(time, i, FLICKER_DEPTH.flame));
      if (shape) {
        flames.push({ x, y: y + (shape.dy ?? 0), height: this.elevation(x, y) + shape.height, size: shape.size, strength, blood: shape.blood, soul: shape.soul });
      }
    }
    for (const avatar of this.avatars.values()) {
      if (avatar.target.connected && !avatar.target.dead && !this.lightsOff) {
        const { x, y } = avatar.position;
        add(x, y, avatar.target.gear.offhand === 'torch' ? GEAR.torch.light! : LANTERN_LIGHT, PLAYER_LIGHT * avatar.lightLevel * flicker(time, avatar.target.id.charCodeAt(0) + avatar.target.id.charCodeAt(1), FLICKER_DEPTH.lantern));
      }
    }
    for (const monster of this.monsters.values()) {
      if (monster.target.kind === 'ghost' && !this.monstersHidden) {
        const { x, y } = monster.position;
        add(x, y, GHOST_GLOW, GHOST_GLOW_INTENSITY * (monster.target.draining ? 1.6 : 1));
      }
    }
    if (this.cursorLight) {
      add(this.cursorLight.x, this.cursorLight.y, CURSOR_LIGHT, 2.6);
    }
    return { sources, flames };
  }

  /**
   * What disturbs the fog this frame: players shove it aside and drag it
   * along as they walk, walking monsters do the same more gently, ghosts
   * trail mist, and lights thin it.
   */
  private collectFogStamps(flames: FlameSpot[]): FogStamp[] {
    const stamps = this.fogStamps;
    stamps.length = 0;
    for (const avatar of this.avatars.values()) {
      const p = avatar.target;
      if (p.connected && !p.dead) {
        const drag = p.moving ? 1.5 : 0;
        stamps.push({ ...avatar.position, radius: 2.6, push: 2.5, vx: Math.cos(p.facing) * drag, vy: Math.sin(p.facing) * drag });
      }
    }
    for (const monster of this.monsters.values()) {
      const m = monster.target;
      if (m.kind === 'ghost') {
        stamps.push({ ...monster.position, radius: 1.1, add: 0.8 });
      } else if (m.moving) {
        stamps.push({ ...monster.position, radius: 0.9, push: 1.2, vx: Math.cos(m.facing) * 0.8, vy: Math.sin(m.facing) * 0.8 });
      }
    }
    for (const s of this.staticLights) {
      stamps.push({ x: s.x, y: s.y, radius: s.kind === 'lamp' ? 1.4 : 1, burn: 0.25 });
    }
    for (const f of flames) {
      stamps.push({ x: f.x, y: f.y, radius: 1 + f.size * 1.2, burn: 0.5 * f.strength });
    }
    if (this.cursorLight) {
      stamps.push({ ...this.cursorLight, radius: 3, burn: 0.5 });
    }
    return stamps;
  }

  /**
   * Animates whatever just appeared, drawn on its own until it's done (then
   * the world is rebuilt with it in place): trees and chests rise out of
   * the ground with a shudder, pumpkins swell up from a bud.
   */
  private updateGrowing(dt: number): void {
    let finished = false;
    for (const [i, g] of this.growing) {
      if (!this.map || this.map.get(g.tx, g.ty) !== g.tile) {
        if (g.group) {
          disposeVoxels(g.group);
          this.scene.remove(g.group);
        }
        this.growing.delete(i);
        finished = true;
        continue;
      }
      if (!g.group) {
        g.group = new Group();
        g.group.add(buildTile(this.map, this.seed, g.tx, g.ty));
        const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
        g.group.position.set(x, 0, z);
        g.height = new Box3().setFromObject(g.group).max.y;
        this.lightMap.darken(g.group);
        this.scene.add(g.group);
      }
      g.age += dt;
      const t = Math.min(1, g.age / GROW_TIME[g.tile]);
      if (g.tile === 'pumpkin') {
        const k = t < 1 ? 0.15 + 0.85 * (1 - (1 - t) ** 3) + Math.sin(t * Math.PI * 3) * 0.08 * (1 - t) : 1;
        g.group.scale.set(k, k, k);
      } else {
        const ease = 1 - (1 - t) ** 2;
        g.group.position.y = -(g.height ?? 1) * (1 - ease);
        const shudder = (1 - t) * 0.04;
        const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
        g.group.position.x = x + (Math.random() - 0.5) * shudder;
        g.group.position.z = z + (Math.random() - 0.5) * shudder;
        if (Math.random() < dt * 10 * (1 - t)) {
          this.chips.puff(g.tx + 0.5, g.ty + 0.5, DIRT, 2);
          this.lightMap.darken(this.chips.group);
        }
      }
      if (t >= 1) {
        disposeVoxels(g.group);
        this.scene.remove(g.group);
        this.growing.delete(i);
        finished = true;
      }
    }
    if (finished && this.map) {
      this.rebuildWorld();
    }
  }

  /**
   * Dug-up gravestones shuddering down into their mounds, kicking up dirt,
   * gone once they're under.
   */
  private updateSinking(dt: number): void {
    this.sinking = this.sinking.filter((s): boolean => {
      s.age += dt;
      const t = Math.min(1, s.age / SINK_TIME);
      const { x, z } = toWorld(s.x, s.y);
      const shudder = 0.06 * (1 - t * 0.5);
      s.group.position.set(x + (Math.random() - 0.5) * shudder, -s.height * t * t, z + (Math.random() - 0.5) * shudder);
      if (Math.random() < dt * 14) {
        this.chips.puff(s.x, s.y, DIRT, 2);
        this.lightMap.darken(this.chips.group);
      }
      if (t < 1) {
        return true;
      }
      disposeVoxels(s.group);
      this.scene.remove(s.group);
      return false;
    });
  }

  private elevation(x: number, y: number): number {
    return this.map ? this.map.elevationAt(x, y) : 0;
  }

  private color(hex: string): Color {
    let c = this.colors.get(hex);
    if (!c) {
      c = new Color(hex);
      this.colors.set(hex, c);
    }
    return c;
  }

  private rebuildWorld(): void {
    this.clearWorld();
    const bare = new Set(this.growing.keys());
    if (this.xray) {
      for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
        const tile = this.map!.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
        if (!isGround(tile) && tile !== 'stairs' && tile !== 'fence') {
          bare.add(i);
        }
      }
    }
    const { group, lights } = buildGraveyard(this.map!, this.seed, bare);
    this.lightMap.darken(group);
    this.treeSway.attach(group);
    this.worldGroup.add(group);
    this.staticLights = lights;
    this.showGlow();
    this.fog.setMap(this.map!, this.seed);
  }

  private clearWorld(): void {
    disposeVoxels(this.worldGroup);
  }

  /**
   * (Re)builds the scenery beyond the fence, wide and tall enough to fill
   * the screen.
   */
  private buildOutskirts(): void {
    if (!this.map) {
      return;
    }
    disposeVoxels(this.outskirts);
    const { x, y } = this.neededSpan;
    const group = buildOutskirts(this.map, this.seed, x, y);
    this.lightMap.darken(group);
    this.outskirts.add(group);
    this.outskirtsSpan = { x, y };
  }

  /**
   * The map editor's top-down view (the camera tilts over to it and back).
   */
  setTopView(on: boolean): void {
    this.topView = on;
  }

  /**
   * Points the camera at the middle of the map from its current tilt.
   */
  private aimCamera(): void {
    const v = this.view;
    const { x, z } = v ? toWorld(v.x + v.w / 2, v.y + v.h / 2) : { x: 0, z: 0 };
    this.camera.position.set(x, Math.sin(this.cameraAngle) * CAMERA_DISTANCE, z + Math.cos(this.cameraAngle) * CAMERA_DISTANCE);
    this.camera.lookAt(x, 0, z);
    this.cameraHome.copy(this.camera.position);
  }

  /**
   * Eases the camera's tilt toward the editor's top-down view or back.
   */
  private tiltCamera(dt: number): void {
    const target = this.topView ? TOP_VIEW_ELEVATION : CAMERA_ELEVATION;
    if (this.cameraAngle === target) {
      return;
    }
    const step = CAMERA_TILT_RATE * dt;
    this.cameraAngle = Math.abs(target - this.cameraAngle) <= step ? target : this.cameraAngle + Math.sign(target - this.cameraAngle) * step;
    this.aimCamera();
    this.fitCamera();
  }

  /**
   * Fits the whole map in the container, fills the rest of the screen with
   * scenery beyond the fence, and resizes the low-res buffer.
   */
  private resize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) {
      return;
    }
    const lowW = Math.max(1, Math.floor(w / PIXEL_SCALE));
    const lowH = Math.max(1, Math.floor(h / PIXEL_SCALE));
    this.renderer.setSize(lowW, lowH, false);
    this.post.setSize(lowW, lowH);
    this.fitCamera();
  }

  /**
   * Frames the whole map (or just its `view`, the sandbox's arena) for the
   * container's shape and the camera's tilt, building more scenery beyond
   * the fence if the view now shows more.
   */
  private fitCamera(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) {
      return;
    }
    const aspect = w / h;
    const spanW = this.view?.w ?? MAP_WIDTH;
    const spanH = this.view?.h ?? MAP_HEIGHT;
    const needHalfW = (spanW + 1) / 2;
    const needHalfH = (spanH * Math.sin(this.cameraAngle) + VIEW_MARGIN * Math.cos(this.cameraAngle) + 1) / 2;
    const halfH = Math.max(needHalfH, needHalfW / aspect);
    this.camera.left = -halfH * aspect;
    this.camera.right = halfH * aspect;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.neededSpan = {
      x: Math.max(0, Math.ceil(halfH * aspect - MAP_WIDTH / 2)) + 1,
      y: Math.max(0, Math.ceil(halfH / Math.sin(this.cameraAngle) - MAP_HEIGHT / 2)) + 3,
    };
    if (this.neededSpan.x > this.outskirtsSpan.x || this.neededSpan.y > this.outskirtsSpan.y) {
      this.buildOutskirts();
    }
  }

  /**
   * Draws each shot (a bolt's pale streak, a wobbling gob of blood, a
   * ghost's pulsing ball of ectoplasm, a skeleton's arrow, or a witch's
   * tumbling potion on its arc), carried forward from where the last tick
   * put it so it flies smoothly between ticks.
   */
  private updateShots(time: number): void {
    const since = Math.min(time - this.shotsAt, 0.1);
    this.shotMeshes.forEach(({ bolt, gob, ecto, arrow, potion }, i: number): void => {
      const shot = this.shots[i];
      bolt.visible = shot?.kind === 'bolt' && !this.monstersHidden;
      gob.visible = shot?.kind === 'blood' && !this.monstersHidden;
      ecto.visible = shot?.kind === 'ecto' && !this.monstersHidden;
      arrow.visible = shot?.kind === 'arrow' && !this.monstersHidden;
      potion.visible = shot?.kind === 'potion' && !this.monstersHidden;
      if (!shot) {
        return;
      }
      const ahead = SHOT_SPEEDS[shot.kind] * since;
      const mesh = { blood: gob, ecto, bolt, arrow, potion }[shot.kind];
      const x = shot.x + Math.cos(shot.angle) * ahead;
      const y = shot.y + Math.sin(shot.angle) * ahead;
      const { x: wx, z } = toWorld(x, y);
      mesh.position.set(wx, this.elevation(x, y) + SHOT_HEIGHT, z);
      mesh.rotation.y = -shot.angle;
      if (shot.kind === 'blood') {
        const wobble = Math.sin(time * 40 + shot.id * 1.3) * 0.15;
        gob.scale.set(1 + wobble, 1 - wobble, 1 - wobble);
      } else if (shot.kind === 'potion') {
        potion.position.y += Math.sin((shot.lob ?? 0) * Math.PI) * POTION_ARC;
        potion.rotation.set(time * 9 + shot.id, 0, time * 7);
      } else if (shot.kind === 'ecto') {
        ecto.scale.setScalar(1 + Math.sin(time * 12 + shot.id) * 0.18);
        ecto.rotation.set(time * 3, time * 2 + shot.id, 0);
        ecto.position.y += Math.sin(time * 6 + shot.id) * 0.05;
      }
    });
  }

  private loop = (): void => {
    this.frame = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.elapsedTime;
    this.frames++;
    if (time - this.fpsSince >= 1) {
      this.fps = Math.round(this.frames / (time - this.fpsSince));
      this.frames = 0;
      this.fpsSince = time;
    }
    if (this.map && this.map.takeChanges().length > 0) {
      this.rebuildWorld();
    }
    this.updateGrowing(dt);
    this.updateSinking(dt);
    this.updateTower();
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.chips.update(dt);
    this.gore.update(dt);
    this.pickups.update(dt);
    this.altarGauges.update(this.lights.flatMap(({ i, fuel }) => {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      return this.map?.get(tx, ty) === 'altar' ? [{ tx, ty, fuel, height: this.elevation(tx + 0.5, ty + 0.5) }] : [];
    }), time);
    this.piles.update(time);
    this.updateShots(time);
    this.puddles.update(time, (x: number, y: number): number => this.elevation(x, y));
    this.bloodMix = Math.min(1, Math.max(0, this.bloodMix + (this.bloodMoon ? 1 : -1) * BLOOD_MOON_FADE * dt));
    this.dayMix = Math.min(1, Math.max(0, this.dayMix + (this.daytime || this.flat ? 1 : -1) * DAY_FADE * (this.flat ? 4 : 1) * dt));
    this.lightMap.setSky(this.flat ? 0 : this.bloodMix, this.dayMix);
    this.fog.setBloodMoon(this.bloodMix);
    this.fog.setDay(this.dayMix);
    this.post.setDay(this.dayMix);
    this.moon.color.copy(MOON).lerp(BLOOD_MOON, this.bloodMix).lerp(SUN, this.dayMix);
    this.moon.intensity = 2.2 + this.dayMix * 1.3;
    this.sky.intensity = 2 + this.dayMix;
    this.sky.color.copy(NIGHT_SKY).lerp(DAY_SKY, this.dayMix);
    this.sky.groundColor.copy(NIGHT_GROUND).lerp(DAY_GROUND, this.dayMix);
    for (const monster of this.monsters.values()) {
      const mLift = this.liftHeight(`m${monster.target.id}`, monster.target.lifted, dt);
      monster.update(dt, time, this.elevation(monster.target.x, monster.target.y) + mLift);
      monster.group.visible = !this.monstersHidden;
      this.dangle(`m${monster.target.id}`, monster.group, mLift, MONSTER_PIVOT, dt, time);
      monster.flail(mLift / LIFT_HEIGHT, time);
      if (monster.impactCount !== (this.impacts.get(`m${monster.target.id}`) ?? 0)) {
        this.impacts.set(`m${monster.target.id}`, monster.impactCount);
        const { x, y } = monster.position;
        const hx = x + Math.cos(monster.target.facing) * 0.9;
        const hy = y + Math.sin(monster.target.facing) * 0.9;
        this.chips.puff(hx, hy, SLAM_DIRT, 26);
        this.chips.puff(hx, hy, DIRT, 14);
        this.gore.spatter(hx, hy, SLAM_MARK, 9, null, 0.45);
        this.lightMap.darken(this.chips.group);
        this.shake = SHAKE_TIME;
      }
      const key = `m${monster.target.id}`;
      if (this.healthBars.has(key)) {
        const { x, y } = monster.position;
        this.healthBars.move(key, x, y, this.elevation(x, y));
      }
    }
    this.treeSway.update(time, [...this.monsters.values()].filter((m: MonsterAvatar): boolean => m.quake > 0 && !this.monstersHidden).map((m: MonsterAvatar): ShakeSource => ({ x: m.group.position.x, z: m.group.position.z, strength: m.quake })));
    this.healthBars.update(dt, this.camera, w, h);
    this.focusPoints.length = 0;
    this.tiltCamera(dt);
    this.shake = Math.max(0, this.shake - dt);
    const jolt = (this.shake / SHAKE_TIME) * SHAKE_AMOUNT;
    this.camera.position.set(this.cameraHome.x + (Math.random() - 0.5) * 2 * jolt, this.cameraHome.y, this.cameraHome.z + (Math.random() - 0.5) * 2 * jolt);
    for (const avatar of this.avatars.values()) {
      const pLift = this.liftHeight(`p${avatar.target.id}`, avatar.target.lifted, dt);
      avatar.update(dt, time, this.elevation(avatar.target.x, avatar.target.y) + pLift);
      this.dangle(`p${avatar.target.id}`, avatar.group, pLift, PLAYER_PIVOT, dt, time);
      avatar.flail(pLift / LIFT_HEIGHT, time);
      this.showTarget(avatar);
      this.projected.set(avatar.group.position.x, avatar.group.position.y + LABEL_HEIGHT, avatar.group.position.z).project(this.camera);
      const sx = (this.projected.x + 1) / 2 * w;
      const sy = (1 - this.projected.y) / 2 * h;
      avatar.label.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%, -100%)`;
      if (avatar.target.connected && !avatar.target.dead) {
        this.projected.set(avatar.group.position.x, avatar.group.position.y + 0.5, avatar.group.position.z).project(this.camera);
        this.focusPoints.push({ x: (this.projected.x + 1) / 2, y: (this.projected.y + 1) / 2 });
      }
    }
    const { sources, flames } = this.collectLights(time);
    this.lightMap.update(sources);
    this.flames.update(flames, time);
    this.fog.update(dt, this.collectFogStamps(flames));
    this.post.render(this.focusPoints);
  };
}
