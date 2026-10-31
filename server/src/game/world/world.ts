// Packages
import { MIN_LEVEL } from '@halloween/shared/world/dimensions';

// Local Imports
import { PUMPKIN_COUNT } from '../world-gen/config/classic';
import { ChunkTracker } from '../storage/chunk-tracker';
import { CHUNK_SIZE, WORLD_SAVE_VERSION } from '../storage/config/save';
import { TILE_PALETTE } from '../storage/helpers/chunk-codec';
import { CHEST_TARGET, ROCK_TARGET } from './config/growth';
import { MapEditor } from './editor/map-editor';
import { Planter } from './growth/planter';
import { Regrowth } from './growth/regrowth';
import { countTiles, inView, perArea } from './helpers/tiles';
import { Conveyor } from './items/conveyor';
import { GroundItems } from './items/ground-items';
import { StationOutput } from './structures/station-output';
import { StructureDamage } from './structures/structure-damage';
import { StructureQueries } from './structures/structure-queries';
import { StructureStore } from './structures/structure-store';
import { StructureTicker } from './structures/structure-ticker';
import { Diggers } from './structures/features/diggers';
import { Fountains } from './structures/features/fountains';
import { Gardens } from './structures/features/gardens';
import { Stations } from './structures/features/stations';
import { TurretAmmo } from './structures/features/turret-ammo';
import { WorldLights } from './structures/features/world-lights';
import { ResourceNodes } from './terrain/resource-nodes';
import { TileTimers } from './terrain/tile-timers';
import { WorldClock } from './world-clock';
import { openMap, restoreSave, seedPresetStructures } from './world-setup';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { LoadedWorld, MapPreset, WorldSave } from '../storage/types/save';
import type { GrownSpot, Occupant } from './types/growth';
import type { WorldSite } from './types/site';

/**
 * The persistent part of the game: tiles, built structures, partly gathered
 * resource nodes, rotting stumps, and items on the ground. Everything here
 * is saved. It also keeps the map stocked: when there are fewer trees,
 * pumpkins, or chests than its targets, one more appears now and then (on
 * open grass, never where it would cut anywhere off), so a server left
 * alone never fills up. Each part of that is its own feature; World puts
 * them together and steps them in order.
 */
export class World {
  /**
   * The seed the map was made from.
   */
  readonly seed: number;

  /**
   * The tiles.
   */
  readonly map: WorldMap;

  /**
   * The part of the map the TV frames (the sandbox's arena), or null for
   * all of it.
   */
  readonly view: MapView | null;

  /**
   * Started from a test map (the sandbox): natural spawning starts off.
   */
  readonly quiet: boolean;

  /**
   * Which chunks of the map changed since the last save.
   */
  readonly chunks: ChunkTracker;

  /**
   * The world's game clock; only World moves it.
   */
  private readonly _clock = new WorldClock();

  /**
   * Everything lying on the ground.
   */
  readonly items = new GroundItems(this._clock);

  /**
   * Every built structure's state.
   */
  readonly structures: StructureStore;

  /**
   * Where structures are and how strong.
   */
  readonly structureQueries: StructureQueries;

  /**
   * Structures taking damage, and what broken storage chests spill.
   */
  readonly structureDamage: StructureDamage;

  /**
   * Every light on the map.
   */
  readonly lights: WorldLights;

  /**
   * Turrets' ammo and cooldowns.
   */
  readonly turretAmmo: TurretAmmo;

  /**
   * Crafting stations.
   */
  readonly stations: Stations;

  /**
   * Bone diggers.
   */
  readonly diggers: Diggers;

  /**
   * Blood fountains.
   */
  readonly fountains: Fountains;

  /**
   * Planted pumpkin seeds and sprouts.
   */
  readonly gardens: Gardens;

  /**
   * Trees, rocks, hedges, graves, landmarks, pumpkins, lamps, and chests
   * being worn down.
   */
  readonly resources: ResourceNodes;

  /**
   * What grows back, and how much of it the map keeps.
   */
  readonly growth: Regrowth;

  /**
   * The TV's map editor.
   */
  readonly editor: MapEditor;

  /**
   * Per-tile counters and timers.
   */
  private readonly _timers: TileTimers;

  /**
   * Where what stations, diggers, and fountains make goes.
   */
  private readonly _output: StationOutput;

  /**
   * Steps every structure.
   */
  private readonly _ticker: StructureTicker;

  /**
   * Moves what lies on belts.
   */
  private readonly _conveyor: Conveyor;

  /**
   * Finds room for what grows.
   */
  private readonly _planter: Planter;

  /**
   * Loads a saved world, or starts fresh: from a preset's map if given
   * (and it fits), else a newly generated one.
   * @param loaded The saved world to load, or null.
   * @param preset The preset to start from when there's no save.
   * @param gen The generator knobs, for a generated map.
   */
  constructor(loaded: LoadedWorld | null, preset: MapPreset | null = null, gen?: MapGenSettings) {
    const opened = openMap(loaded, preset, gen);
    this.seed = opened.seed;
    this.map = opened.map;
    this.view = opened.view;
    this.quiet = opened.quiet;
    this._clock.now = opened.time;
    this._timers = new TileTimers(opened.save);
    this.structures = new StructureStore(this.map, opened.save?.structures);
    const site: WorldSite = { map: this.map, view: this.view, clock: this._clock, structures: this.structures, items: this.items, timers: this._timers };
    this.structureQueries = new StructureQueries(site);
    this.structureDamage = new StructureDamage(site);
    this._output = new StationOutput(site);
    this.lights = new WorldLights(site, this.structureQueries);
    this.turretAmmo = new TurretAmmo(site);
    this.stations = new Stations(site, this._output);
    this.diggers = new Diggers(site, this._output);
    this.fountains = new Fountains(site, this._output);
    this.gardens = new Gardens(site);
    this._ticker = new StructureTicker(site, this.diggers, this.turretAmmo, this.lights, this.stations);
    this._conveyor = new Conveyor(site);
    this.resources = new ResourceNodes(site);
    this.editor = new MapEditor(site, this.lights, opened.blends);
    if (opened.save) {
      restoreSave(this.map, this.structures, this.items, opened.save);
    } else {
      seedPresetStructures(this.map, this.structures, this.lights);
    }
    this._planter = new Planter(site);
    this.growth = new Regrowth(site, this._planter, {
      tree: opened.save?.treeTarget ?? countTiles(this.map, 'tree', 'stump'),
      hedge: opened.save?.hedgeTarget ?? countTiles(this.map, 'hedge'),
      pumpkin: opened.save?.pumpkinTarget ?? perArea(this.map, PUMPKIN_COUNT),
      chest: opened.save?.chestTarget ?? perArea(this.map, CHEST_TARGET),
      rock: opened.save?.rockTarget ?? ROCK_TARGET,
    });
    this.chunks = new ChunkTracker(this.map, opened.save !== null && !loaded?.rewrite);
  }

  /**
   * World seconds since the world began.
   * @returns The clock's time.
   */
  get time(): number {
    return this._clock.now;
  }

  /**
   * Storage chests belts took something out of since the last call, so
   * whoever has one open sees it change.
   * @returns Their tile indexes.
   */
  takeTouchedStashes(): number[] {
    return this._conveyor.takeTouchedStashes();
  }

  /**
   * Everything about the world that is written to `world.json` (the
   * terrain goes in chunk files; `Game.save` adds the settings and the
   * world level).
   * @returns The save.
   */
  save(): Omit<WorldSave, 'settings' | 'worldLevel'> {
    return {
      version: WORLD_SAVE_VERSION,
      seed: this.seed,
      width: this.map.width,
      height: this.map.height,
      palette: TILE_PALETTE,
      chunkSize: CHUNK_SIZE,
      minLevel: MIN_LEVEL,
      blends: this.editor.blendAreas(),
      view: this.view,
      quiet: this.quiet,
      time: this.time,
      nodes: [...this._timers.nodes],
      regrow: [...this._timers.regrow],
      mounds: [...this._timers.mounds],
      treeTarget: this.growth.targets.tree,
      hedgeTarget: this.growth.targets.hedge,
      pumpkinTarget: this.growth.targets.pumpkin,
      chestTarget: this.growth.targets.chest,
      rockTarget: this.growth.targets.rock,
      items: this.items.itemStates(),
      structures: this.structures.saveEntries(),
    };
  }

  /**
   * Advances the clock, burns fuel, works stations, diggers, and turrets,
   * runs the belts, then rots stumps, regrows rocks, raises new
   * gravestones from mounds whose time has come, and grows trees,
   * pumpkins, and chests back toward their targets, never onto a tile
   * someone is standing on.
   * @param dt Seconds since the last step.
   * @param occupants Everyone standing on the map.
   * @returns Whatever grew this step.
   */
  step(dt: number, occupants: Occupant[]): GrownSpot[] {
    this._clock.now += dt;
    this._ticker.step(dt);
    this._conveyor.convey(dt);
    return this.growth.step(occupants);
  }

  /**
   * Whether a tile is inside the map's view (always, unless the map only
   * uses part of the grid, like the sandbox).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether the tile is in view.
   */
  inView(tx: number, ty: number): boolean {
    return inView(this.view, tx, ty);
  }
}
