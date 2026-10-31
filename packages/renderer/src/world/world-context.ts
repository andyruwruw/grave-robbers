// Packages
import {
  BasicShadowMap,
  Clock,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';
import { resolveEffects } from '@halloween/shared/world-events/helpers/resolve-effects';

// Local Imports
import { AltarGauges } from '../effects/altar-gauges';
import { ChainBolts } from '../effects/chain-bolts';
import { ChipBursts } from '../effects/chip-bursts';
import { Fissures } from '../effects/fissures';
import { Flames } from '../effects/flames';
import { FountainVictims } from '../effects/fountain-victims';
import { Gore } from '../effects/gore/gore';
import { GroundPatches } from '../effects/ground-patches';
import { HealthBars } from '../effects/health-bars';
import { PickupPopups } from '../effects/pickup-popups';
import { Puddles } from '../effects/puddles';
import { ShockRings } from '../effects/shock-rings';
import { TreeSway } from '../effects/tree-sway';
import { ItemPiles } from '../items/item-piles';
import { Fog } from '../lighting/fog/fog';
import { LightMap } from '../lighting/light-map';
import { DEFAULT_DISPLAY_SETTINGS } from './config/display-settings';
import { ProjectileMaterials } from './effects/projectile-materials';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { LightState, VictimState } from '@halloween/shared/protocol/state/world-state';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { EventModifiers } from '@halloween/shared/world-events/types/event-effects';
import type { DisplaySettings } from '../types/display-settings';
import type { LightFlash } from './effects/types/light-flash';

/**
 * What every part of the TV's scene shares: the three.js renderer, scene,
 * camera and clock, the world as last received (map, seed, size, ground
 * items, burning lights), the display switches, and the effect systems
 * several parts draw into. Created once by `WorldScene`. The effect systems
 * are created in the order the old single renderer created them, since
 * three.js breaks draw-order ties by material id.
 */
export class WorldContext {
  /**
   * Draws the scene into the low-res canvas.
   */
  readonly renderer = new WebGLRenderer({ antialias: false });

  /**
   * Everything drawn.
   */
  readonly scene = new Scene();

  /**
   * The camera (placed by `CameraRig`).
   */
  readonly camera = new OrthographicCamera();

  /**
   * Frame timing.
   */
  readonly clock = new Clock();

  /**
   * Items on the ground this tick.
   */
  items: ItemState[] = [];

  /**
   * Every light is out (the Game tab's Lights off).
   */
  lightsOff = false;

  /**
   * How the world events that are up look this frame, eased in and out
   * (set by `WorldEventLook`).
   */
  look: EventModifiers = resolveEffects([]);

  /**
   * Monsters and their shots are hidden (the map editor's view).
   */
  monstersHidden = false;

  /**
   * The map editor's x-ray: trees, structures, and landmarks left out.
   */
  xray = false;

  /**
   * How this screen draws the world (see `DisplayApplier`); parts read it
   * live.
   */
  display: DisplaySettings = { ...DEFAULT_DISPLAY_SETTINGS };

  /**
   * This screen's own player's id (/play), or null (the TV).
   */
  localPlayer: string | null = null;

  /**
   * The light the TV's right mouse button carries, or null.
   */
  cursorLight: { x: number; y: number } | null = null;

  /**
   * The map as this screen has it (tile changes applied).
   */
  map: WorldMap | null = null;

  /**
   * The map's width in tiles (the classic size until a world arrives).
   */
  mapWidth = MAP_WIDTH;

  /**
   * The map's height in tiles (see `mapWidth`).
   */
  mapHeight = MAP_HEIGHT;

  /**
   * The world's seed, for the voxels' seeded detail.
   */
  seed = 0;

  /**
   * Burning lights this tick.
   */
  lights: LightState[] = [];

  /**
   * Monsters blood fountains hold this tick.
   */
  victims: VictimState[] = [];

  /**
   * Darkness and colored light over the whole scene.
   */
  readonly lightMap = new LightMap();

  /**
   * Flames over burning structures.
   */
  readonly flames = new Flames();

  /**
   * Things on the ground.
   */
  readonly piles = new ItemPiles((x: number, y: number): number => this.elevation(x, y));

  /**
   * Chips, puffs, sparks, and jets of particles.
   */
  readonly chips = new ChipBursts();

  /**
   * Goods floating up from whoever picked them up.
   */
  readonly pickups = new PickupPopups();

  /**
   * Fuel gauges over altars.
   */
  readonly altarGauges = new AltarGauges();

  /**
   * Blood and floating heads in fountains that caught a monster.
   */
  readonly fountainVictims = new FountainVictims(this.lightMap);

  /**
   * The materials of shots in flight (made here, between the altar gauges
   * and the fog, to keep the old material creation order).
   */
  readonly shotMaterials = new ProjectileMaterials();

  /**
   * The drifting ground fog.
   */
  readonly fog = new Fog(this.lightMap);

  /**
   * Trees shivering around heavy things.
   */
  readonly treeSway = new TreeSway();

  /**
   * Witches' puddles on the ground.
   */
  readonly puddles = new Puddles();

  /**
   * Scorched ground, fire trails, and incense infused weapons leave.
   */
  readonly patches = new GroundPatches();

  /**
   * Chain lightning arcs.
   */
  readonly bolts = new ChainBolts();

  /**
   * Shockwave rings on the ground (wails, slams, novas, blasts).
   */
  readonly rings = new ShockRings();

  /**
   * Earthshaker fissures.
   */
  readonly cracks = new Fissures();

  /**
   * Short bursts of light from effects, lit and pruned by
   * `LightCollector`.
   */
  flashes: LightFlash[] = [];

  /**
   * Health bars over hit tiles and monsters.
   */
  readonly healthBars: HealthBars;

  /**
   * Blood splats, gibs, and things torn apart.
   */
  readonly gore: Gore;

  /**
   * How many slams each monster had made when last seen, by `m<id>`.
   */
  readonly impacts = new Map<string, number>();

  /**
   * The element the canvas fills.
   */
  readonly container: HTMLElement;

  /**
   * The HTML layer name labels and health bars go in.
   */
  readonly labelLayer: HTMLElement;

  /**
   * Starts with no world, its canvas prepended to the container.
   * @param container The element the canvas fills.
   * @param labelLayer The HTML layer name labels and health bars go in.
   */
  constructor(container: HTMLElement, labelLayer: HTMLElement) {
    this.container = container;
    this.labelLayer = labelLayer;
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
    this.gore = new Gore(this.scene, (x: number, y: number): number => this.elevation(x, y));
  }

  /**
   * The ground height at a tile-space point (0 before a world arrives).
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @returns The ground height.
   */
  elevation(x: number, y: number): number {
    return this.map ? this.map.elevationAt(x, y) : 0;
  }
}
