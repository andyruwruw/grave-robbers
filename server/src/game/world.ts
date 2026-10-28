// Packages
import { GRAB_RADIUS, isBuildItem } from '@halloween/shared/gear';
import {
  DIG_HITS,
  ROBBABLE,
  ROB_HITS,
  ROB_REFILL,
  GATHERABLE,
  MOUND_REFILL_MIN,
  MOUND_REFILL_SPREAD,
  PICKUP_RADIUS,
  GOODS,
  stock,
} from '@halloween/shared/items';
import {
  BUILDABLE_FLOORS,
  LAMP_LIGHT,
  GHOSTPROOF,
  LIT,
  LOW_FUEL,
  PUMPKIN_LIGHT,
  STATIONS,
  STATION_REACH,
  STRUCTURES,
  WORKING_GLOW,
  isStructure,
} from '@halloween/shared/structures';
import {
  bellRadius,
  diggerSeconds,
  lightBurn,
  lightIntensity,
  lightRadius,
  stationSeconds,
  structureHp,
} from '@halloween/shared/tree';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  RAMP_DIRS,
  WorldMap,
} from '@halloween/shared/world';
import { BLEND_TILES, blendKey, blendMatches, blendTile, cleanBlend, packBlends, unpackBlends } from '@halloween/shared/blend';
import { EDITOR_LIGHT_FUEL, EDIT_TILES, brushTiles } from '@halloween/shared/map-edit';

// Local Imports
import { PUMPKIN_COUNT, generateWorld } from './world-gen';

// Types
import type { BagItem } from '@halloween/shared/gear';
import type { MapEdit } from '@halloween/shared/map-edit';
import type { MapGenSettings } from '@halloween/shared/map-gen';
import type { GrownTile, MapView } from '@halloween/shared/protocol';
import type { Tile } from '@halloween/shared/world';
import type {
  Bundle,
  Goods,
  ItemState,
} from '@halloween/shared/items';
import type { LightState } from '@halloween/shared/protocol';
import type { Station, StructureKind } from '@halloween/shared/structures';
import type { BlendAreas } from '@halloween/shared/blend';
import type { MapPreset, StructureState, WorldSave } from './world-store';

const STUMP_ROT_MIN = 120;
const STUMP_ROT_SPREAD = 120;
const PUMPKIN_HITS = 2;

/**
 * Crypt tiles this close to the one robbed belong to the same crypt.
 */
const CRYPT_SPAN = 8;

/**
 * Of new gravestones rising from mounds, the share that are headstones
 * rather than crosses.
 */
const TOMBSTONE_SHARE = 0.65;

/**
 * Things the map keeps topped up.
 */
type StockedTile = 'tree' | 'pumpkin' | 'chest';

/**
 * Roughly how often one more may appear (seconds) while below target.
 * Trees aim for the count the map was made with, pumpkins for the
 * generator's count, chests for CHEST_TARGET.
 */
const GROW_INTERVAL: Record<StockedTile, number> = { tree: 12, pumpkin: 40, chest: 60 };
const CHEST_TARGET = 3;

/**
 * New trees go at least this far in from the fence this often (when such a
 * spot exists), so the middle stays wooded instead of the edge thickening.
 */
const INNER_TREE_INSET = 6;
const INNER_TREE_CHANCE = 0.7;

/**
 * Tiles a chest likes to turn up beside.
 */
const GRAVESIDE: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross', 'mausoleum', 'crypt', 'hedge']);
const TREES: ReadonlySet<Tile> = new Set<Tile>(['tree']);
const PATHS: ReadonlySet<Tile> = new Set<Tile>(['path', 'cobble']);
const ROCK_TARGET = 20;
const ROCK_CHECK_INTERVAL = 30;
const DROPPER_PICKUP_DELAY = 2;

/**
 * Someone standing somewhere, for keeping regrowth off their tile.
 */
interface Occupant {
  x: number;
  y: number;
}

/**
 * A light on the map, for monsters: where it is and how far it reaches
 * right now. `structure` lights burn fuel and can be snuffed.
 */
export interface ActiveLight {
  tx: number;
  ty: number;
  radius: number;
  structure: boolean;
}

/**
 * Server-side item: the dropper can't re-collect it straight away.
 */
interface Item extends ItemState {
  dropperId: string | null;
  pickupAfter: number;
}

/**
 * The persistent part of the game: tiles, built structures, partly gathered
 * resource nodes, rotting stumps, and items on the ground. Everything here
 * is saved. It also keeps the map stocked: when there are fewer trees,
 * pumpkins, or chests than its targets, one more appears now and then (on
 * open grass, never where it would cut anywhere off), so a server left
 * alone never fills up.
 */
export class World {
  readonly seed: number;
  readonly map: WorldMap;
  time: number;
  private nodes: Map<number, number>;
  private regrow: Map<number, number>;
  private mounds: Map<number, number>;

  /**
   * Until when each robbed landmark tile has nothing left, by tile index
   * (in memory only).
   */
  private robbed = new Map<number, number>();
  private structures: Map<number, StructureState>;
  private items = new Map<number, Item>();
  private nextItemId = 1;
  private nextRockCheck = 0;
  private dug: { tx: number; ty: number; chip: 'wood' | 'stone' }[] = [];
  private growAt: Record<StockedTile, number>;
  readonly targets: Record<StockedTile, number>;

  /**
   * The map editor's Mix setting last painted on each tile, by index.
   */
  private blends: Map<number, string>;

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
   * Trees, pumpkins, and chests grow back toward their targets (off when
   * the Game tab turns natural spawning off).
   */
  restock = true;

  /**
   * Loads a save, or starts fresh: from a preset's map if given (and it
   * fits), else a newly generated one.
   */
  constructor(save: WorldSave | null, preset: MapPreset | null = null, gen?: MapGenSettings) {
    const loaded = save ? WorldMap.decode(save.tiles, save.levels, save.ramps) : null;
    if (save && loaded) {
      this.seed = save.seed;
      this.map = loaded;
      this.time = save.time;
      this.nodes = new Map(save.nodes);
      this.regrow = new Map(save.regrow);
      this.mounds = new Map(save.mounds);
      this.structures = new Map(save.structures);
      this.blends = unpackBlends(save.blends);
      for (const [i, s] of this.structures) {
        const tile = this.map.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
        if (s.fuel > 0 && isStructure(tile) && STRUCTURES[tile].light?.burn === Infinity) {
          s.fuel = LIT;
        }
      }
      this.view = save.view ?? null;
      this.quiet = save.quiet ?? false;
      this.targets = { tree: save.treeTarget ?? this.count('tree', 'stump'), pumpkin: PUMPKIN_COUNT, chest: CHEST_TARGET };
      for (const item of save.items) {
        if (item.held) {
          this.addHeld(item.x, item.y, item.held, null);
        } else {
          this.addItem(item.x, item.y, stock(Object.fromEntries(GOODS.map((g: Goods): [Goods, number] => [g, item[g] ?? 0]))), null);
        }
      }
    } else {
      const fromPreset = preset ? WorldMap.decode(preset.tiles, preset.levels, preset.ramps) : null;
      this.seed = fromPreset ? preset!.seed : Math.floor(Math.random() * 2 ** 31);
      this.map = fromPreset ?? generateWorld(this.seed, gen);
      this.time = 0;
      this.nodes = new Map();
      this.regrow = new Map();
      this.mounds = new Map();
      this.structures = new Map();
      this.blends = unpackBlends(fromPreset ? preset!.blends : undefined);
      this.view = fromPreset ? preset!.view ?? null : null;
      this.quiet = fromPreset ? preset!.quiet ?? false : false;
      for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
        const tile = this.map.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
        if (isStructure(tile)) {
          this.map.set(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), 'grass');
          this.place(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), tile, 0);
          this.eternal(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
        }
      }
      this.map.takeChanges();
      this.targets = { tree: this.count('tree', 'stump'), pumpkin: PUMPKIN_COUNT, chest: CHEST_TARGET };
    }
    this.growAt = { tree: this.time + GROW_INTERVAL.tree, pumpkin: this.time + GROW_INTERVAL.pumpkin, chest: this.time + GROW_INTERVAL.chest };
  }

  save(): WorldSave {
    return {
      version: 8,
      seed: this.seed,
      tiles: this.map.encode(),
      levels: this.map.encodeLevels(),
      ramps: this.map.encodeRamps(),
      blends: this.blendAreas(),
      view: this.view,
      quiet: this.quiet,
      time: this.time,
      nodes: [...this.nodes],
      regrow: [...this.regrow],
      mounds: [...this.mounds],
      treeTarget: this.targets.tree,
      items: this.itemStates(),
      structures: [...this.structures],
    };
  }

  /**
   * The map editor's remembered Mix settings, for saves, presets, and the
   * TV's picker.
   */
  blendAreas(): BlendAreas {
    return packBlends(this.blends);
  }

  /**
   * One change from the TV's map editor (see `MapEdit`). Whatever stood on
   * a repainted tile goes (a built structure, a part-chopped tree's count,
   * a mound's timer); a new built structure starts fresh. The fence stays.
   */
  edit(e: MapEdit): void {
    const map = this.map;
    if (!Number.isInteger(e.tx) || !Number.isInteger(e.ty)) {
      return;
    }
    if (e.op === 'stairs') {
      const { tx, ty } = e;
      if (tx <= 0 || ty <= 0 || tx >= MAP_WIDTH - 1 || ty >= MAP_HEIGHT - 1) {
        return;
      }
      if (map.get(tx, ty) !== 'stairs') {
        this.clear(tx, ty);
        map.set(tx, ty, 'stairs');
        if (Number.isInteger(e.dir) && e.dir! >= 0 && e.dir! < RAMP_DIRS.length) {
          map.setRamp(tx, ty, e.dir!);
        }
        return;
      }
      const own = map.base(tx, ty);
      const ways = RAMP_DIRS.flatMap(([dx, dy], i: number): number[] => (!map.isSolid(tx + dx, ty + dy) && map.base(tx + dx, ty + dy) > own ? [i] : []));
      const up = map.rampUp(tx, ty);
      const now = up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : -1;
      if (ways.length > 0) {
        map.setRamp(tx, ty, ways[(ways.indexOf(now) + 1) % ways.length]);
      }
      return;
    }
    if (e.op === 'blend') {
      const blend = cleanBlend(e.blend);
      const key = blendKey(blend);
      for (const [x, y] of brushTiles(e.tx, e.ty, e.size, MAP_WIDTH, MAP_HEIGHT)) {
        if (key) {
          this.blends.set(y * MAP_WIDTH + x, key);
        } else {
          this.blends.delete(y * MAP_WIDTH + x);
        }
        const now = map.get(x, y);
        const want = blendTile(map, blend, x, y);
        if (BLEND_TILES.has(now) && !blendMatches(now, want)) {
          this.clear(x, y);
          map.set(x, y, want);
        }
      }
      return;
    }
    const paints = e.op === 'tile' ? (Array.isArray(e.mix) && e.mix.length > 0 ? e.mix.slice(0, 8) : [e.tile]) : [];
    if (e.op === 'tile' && !paints.every((t: Tile): boolean => EDIT_TILES.has(t))) {
      return;
    }
    const scatter = e.op === 'tile' && typeof e.scatter === 'number' ? Math.min(1, Math.max(0, e.scatter)) : 1;
    if (e.op === 'erase') {
      for (const [id, item] of this.items) {
        if (brushTiles(e.tx, e.ty, e.size, MAP_WIDTH, MAP_HEIGHT).some(([x, y]): boolean => Math.floor(item.x) === x && Math.floor(item.y) === y)) {
          this.items.delete(id);
        }
      }
    }
    for (const [x, y] of brushTiles(e.tx, e.ty, e.size, MAP_WIDTH, MAP_HEIGHT)) {
      if (e.op === 'level') {
        if (Number.isInteger(e.level) && (typeof e.from !== 'number' || map.level(x, y) === e.from)) {
          map.setLevel(x, y, e.level);
        }
        continue;
      }
      if (e.op === 'tile' && Math.random() >= scatter) {
        continue;
      }
      const paint = e.op === 'tile' ? paints[Math.floor(Math.random() * paints.length)] : null;
      this.blends.delete(y * MAP_WIDTH + x);
      const wasStructure = isStructure(map.get(x, y));
      this.clear(x, y);
      if (e.op === 'erase') {
        if (!wasStructure) {
          map.set(x, y, 'grass');
        }
        continue;
      }
      if (!paint) {
        continue;
      }
      if (isStructure(paint)) {
        if (!BUILDABLE_FLOORS.has(map.get(x, y))) {
          map.set(x, y, 'grass');
        }
        this.place(x, y, paint, 0);
        this.eternal(x, y);
      } else {
        map.set(x, y, paint);
      }
    }
  }

  /**
   * Keeps a burning light (torch, lantern, campfire) lit for good: what the
   * editor places, and what a preset starts with.
   */
  private eternal(tx: number, ty: number): void {
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    const kind = this.map.get(tx, ty);
    if (s && isStructure(kind) && STRUCTURES[kind].light && !STATIONS[kind] && STRUCTURES[kind].light!.burn !== WORKING_GLOW) {
      s.fuel = EDITOR_LIGHT_FUEL;
    }
  }

  /**
   * Forgets everything about a tile's contents for the editor: a built
   * structure comes down to its floor, and growth, dig, and rob timers go.
   */
  private clear(tx: number, ty: number): void {
    const i = ty * MAP_WIDTH + tx;
    const s = this.structures.get(i);
    if (s) {
      this.structures.delete(i);
      this.map.set(tx, ty, s.floor);
    }
    this.nodes.delete(i);
    this.mounds.delete(i);
    this.regrow.delete(i);
    this.robbed.delete(i);
  }

  /**
   * Puts a structure on a tile, remembering the floor it covers and its
   * builder's skill level for it.
   */
  place(tx: number, ty: number, kind: StructureKind, level: number, owner: string | null = null): void {
    const fuel = STRUCTURES[kind].light && !STATIONS[kind] ? lightBurn(kind) : 0;
    this.structures.set(ty * MAP_WIDTH + tx, {
      hp: structureHp(kind, level),
      fuel,
      floor: this.map.get(tx, ty),
      level,
      ...(STATIONS[kind] ? { queue: 0, progress: 0, buffer: {} } : {}),
      ...(kind === 'digger' ? { progress: 0 } : {}),
      ...(kind === 'sentry' ? { ammo: 0, readyAt: 0 } : {}),
      ...(kind === 'coffin' && owner ? { owner } : {}),
    });
    this.map.set(tx, ty, kind);
  }

  /**
   * Sets a light glowing for a while without counting it as burning fuel
   * (an altar after an offering).
   */
  kindle(tx: number, ty: number, seconds: number): void {
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    if (s) {
      s.fuel = Math.max(s.fuel, seconds);
    }
  }

  /**
   * Loads a blood sentry with more shots, up to `max`. Returns false if it
   * isn't a sentry or is already full.
   */
  load(tx: number, ty: number, shots: number, max: number): boolean {
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    if (this.map.get(tx, ty) !== 'sentry' || !s || (s.ammo ?? 0) >= max) {
      return false;
    }
    s.ammo = Math.min(max, (s.ammo ?? 0) + shots);
    return true;
  }

  /**
   * Every blood sentry ready to fire: where it is, its builder's level, and
   * a callback that spends one shot and sets when it may fire again.
   */
  readySentries(): { tx: number; ty: number; level: number; fire: (cooldown: number) => void }[] {
    const ready: { tx: number; ty: number; level: number; fire: (cooldown: number) => void }[] = [];
    for (const [i, s] of this.structures) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      if (this.map.get(tx, ty) === 'sentry' && (s.ammo ?? 0) > 0 && this.time >= (s.readyAt ?? 0)) {
        ready.push({
          tx,
          ty,
          level: s.level ?? 0,
          fire: (cooldown: number): void => {
            s.ammo = (s.ammo ?? 1) - 1;
            s.readyAt = this.time + cooldown;
          },
        });
      }
    }
    return ready;
  }

  /**
   * The coffin a player rises from, if they built one that still stands.
   */
  coffinOf(owner: string): { tx: number; ty: number } | null {
    for (const [i, s] of this.structures) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      if (s.owner === owner && this.map.get(tx, ty) === 'coffin') {
        return { tx, ty };
      }
    }
    return null;
  }

  /**
   * Every silver bell: its middle and how close ghosts may come.
   */
  bells(): { x: number; y: number; radius: number }[] {
    return this.structuresOf('bell').map(({ tx, ty }): { x: number; y: number; radius: number } => ({ x: tx + 0.5, y: ty + 0.5, radius: bellRadius(this.structureLevel(tx, ty)) }));
  }

  /**
   * Units the bone diggers dug since the last call, for the TV's chips.
   */
  takeDug(): { tx: number; ty: number; chip: 'wood' | 'stone' }[] {
    const dug = this.dug;
    this.dug = [];
    return dug;
  }

  /**
   * Damages the structure on a tile, restoring the floor if it breaks.
   */
  damage(tx: number, ty: number, amount: number): void {
    const i = ty * MAP_WIDTH + tx;
    const s = this.structures.get(i);
    if (!s) {
      return;
    }
    s.hp -= amount;
    if (s.hp <= 0) {
      this.structures.delete(i);
      this.map.set(tx, ty, s.floor);
    }
  }

  /**
   * Relights a light a ghost snuffed (free; lights never burn down).
   * Returns false if it's still lit or isn't a light.
   */
  relight(tx: number, ty: number): boolean {
    const tile = this.map.get(tx, ty);
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    if (!isStructure(tile) || STRUCTURES[tile].light?.burn !== Infinity || !s || s.fuel > 0) {
      return false;
    }
    s.fuel = LIT;
    return true;
  }

  /**
   * How far and how bright a built light shines: lights by their
   * builder's level (see `lightRadius`), glowing stations and altars
   * shrinking as their glow runs out.
   */
  private shine(kind: StructureKind, s: StructureState): { radius: number; intensity: number } {
    const light = STRUCTURES[kind].light!;
    if (light.burn === Infinity) {
      return { radius: lightRadius(light.radius, s.level ?? 0), intensity: lightIntensity(light.intensity, s.level ?? 0) };
    }
    return { radius: light.radius * (0.5 + 0.5 * Math.min(1, s.fuel / LOW_FUEL)), intensity: light.intensity ?? 1 };
  }

  /**
   * Feeds one batch into the station on a tile, if `pay` can cover its
   * input. Returns false if it's not a station, it's full, or nothing was
   * paid.
   */
  feed(tx: number, ty: number, pay: (cost: Bundle) => boolean): boolean {
    const tile = this.map.get(tx, ty);
    const station = isStructure(tile) ? STATIONS[tile] : undefined;
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    if (!station || !s || (s.queue ?? 0) >= station.queue || !pay(station.input)) {
      return false;
    }
    s.queue = (s.queue ?? 0) + 1;
    return true;
  }

  /**
   * Builder's skill level of the structure on a tile (0 if none).
   */
  structureLevel(tx: number, ty: number): number {
    return this.structures.get(ty * MAP_WIDTH + tx)?.level ?? 0;
  }

  /**
   * Whether the middle of a structure of this kind is within `radius` of
   * (x, y).
   */
  nearStructure(kind: StructureKind, x: number, y: number, radius: number): boolean {
    return this.structuresOf(kind).some(({ tx, ty }): boolean => Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= radius);
  }

  /**
   * Whether a burning campfire's tile center is within `radius` of (x, y).
   */
  nearLitCampfire(x: number, y: number, radius: number): boolean {
    for (const [i, s] of this.structures) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      const tile = this.map.get(tx, ty);
      if (s.fuel > 0 && (tile === 'campfire' || tile === 'soul-fire' || tile === 'blood-fountain') && Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= radius) {
        return true;
      }
    }
    return false;
  }

  /**
   * Hit points left on a built structure, or null if there isn't one.
   */
  structureHp(tx: number, ty: number): number | null {
    return this.structures.get(ty * MAP_WIDTH + tx)?.hp ?? null;
  }

  /**
   * Tiles holding a structure of this kind.
   */
  structuresOf(kind: StructureKind): { tx: number; ty: number }[] {
    const found: { tx: number; ty: number }[] = [];
    for (const i of this.structures.keys()) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      if (this.map.get(tx, ty) === kind) {
        found.push({ tx, ty });
      }
    }
    return found;
  }

  /**
   * Puts out a burning light (a ghost got to it).
   */
  snuff(tx: number, ty: number): void {
    const s = this.structures.get(ty * MAP_WIDTH + tx);
    if (s) {
      s.fuel = 0;
    }
  }

  /**
   * Every light that's on: pumpkins and lamp posts always, built lights
   * while they have fuel (shrinking as it runs low, like on the TV).
   */
  activeLights(): ActiveLight[] {
    const lights: ActiveLight[] = [];
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const tile = this.map.get(tx, ty);
        if (tile === 'pumpkin' || tile === 'lamp') {
          lights.push({ tx, ty, radius: (tile === 'lamp' ? LAMP_LIGHT : PUMPKIN_LIGHT).radius, structure: false });
        }
      }
    }
    for (const [i, s] of this.structures) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      const tile = this.map.get(tx, ty);
      const light = isStructure(tile) ? STRUCTURES[tile].light : undefined;
      if (light && s.fuel > 0) {
        lights.push({ tx, ty, radius: this.shine(tile as StructureKind, s).radius, structure: s.queue === undefined && !GHOSTPROOF.has(tile as StructureKind) });
      }
    }
    return lights;
  }

  hasItemOn(tx: number, ty: number): boolean {
    return [...this.items.values()].some((item: Item): boolean => Math.floor(item.x) === tx && Math.floor(item.y) === ty);
  }

  /**
   * Every lit light and glowing station, with how far and bright it
   * shines.
   */
  lightStates(): LightState[] {
    const lights: LightState[] = [];
    for (const [i, s] of this.structures) {
      const tile = this.map.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH));
      if (s.fuel > 0 && isStructure(tile) && STRUCTURES[tile].light) {
        const { radius, intensity } = this.shine(tile, s);
        lights.push({ i, fuel: Math.round(Math.min(s.fuel, LOW_FUEL) * 10) / 10, radius: Math.round(radius * 100) / 100, intensity: Math.round(intensity * 100) / 100 });
      }
    }
    return lights;
  }

  /**
   * One hit on a gatherable tile. Returns true when that was the last and
   * the tile comes down (the caller hands out all of it at once).
   */
  gather(tx: number, ty: number): boolean {
    const g = GATHERABLE[this.map.get(tx, ty)];
    if (!g) {
      return false;
    }
    const i = ty * MAP_WIDTH + tx;
    const remaining = (this.nodes.get(i) ?? g.amount) - 1;
    if (remaining > 0) {
      this.nodes.set(i, remaining);
    } else {
      this.nodes.delete(i);
      this.map.set(tx, ty, g.leaves);
      if (g.leaves === 'stump') {
        this.regrow.set(i, this.time + STUMP_ROT_MIN + Math.random() * STUMP_ROT_SPREAD);
      }
      return true;
    }
    return false;
  }

  /**
   * One dig at a robbable landmark (a statue, crypt, or mausoleum). A
   * crypt's walls have gaps, so every crypt tile within CRYPT_SPAN counts as
   * the same crypt; a mausoleum is its own joined walls. Returns
   * 'done' on the dig that robs it (a crypt or mausoleum is marked robbed as
   * a whole), 'robbed' if there's nothing left to take yet, else 'dug'.
   */
  rob(tx: number, ty: number): 'dug' | 'done' | 'robbed' {
    const i = ty * MAP_WIDTH + tx;
    if ((this.robbed.get(i) ?? -Infinity) > this.time) {
      return 'robbed';
    }
    const left = (this.nodes.get(i) ?? ROB_HITS) - 1;
    if (left > 0) {
      this.nodes.set(i, left);
      return 'dug';
    }
    this.nodes.delete(i);
    const tile = this.map.get(tx, ty);
    const until = this.time + ROB_REFILL;
    const stack = [i];
    this.robbed.set(i, until);
    if (tile === 'crypt') {
      for (let y = Math.max(0, ty - CRYPT_SPAN); y <= Math.min(MAP_HEIGHT - 1, ty + CRYPT_SPAN); y++) {
        for (let x = Math.max(0, tx - CRYPT_SPAN); x <= Math.min(MAP_WIDTH - 1, tx + CRYPT_SPAN); x++) {
          if (this.map.get(x, y) === 'crypt') {
            this.robbed.set(y * MAP_WIDTH + x, until);
            this.nodes.delete(y * MAP_WIDTH + x);
          }
        }
      }
      stack.length = 0;
    }
    while (stack.length > 0 && tile !== 'statue') {
      const at = stack.pop()!;
      const ax = at % MAP_WIDTH;
      const ay = Math.floor(at / MAP_WIDTH);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = (ay + dy) * MAP_WIDTH + ax + dx;
        if (this.map.get(ax + dx, ay + dy) === tile && (this.robbed.get(n) ?? -Infinity) < until) {
          this.robbed.set(n, until);
          this.nodes.delete(n);
          stack.push(n);
        }
      }
    }
    return 'done';
  }

  /**
   * Knocks down a lamp post (a landmark), leaving the floor most of its
   * neighbors have.
   */
  breakLamp(tx: number, ty: number): void {
    const floors = ['path', 'cobble', 'flagstone', 'grass'] as const;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => this.map.get(tx + dx, ty + dy));
    const floor = floors.reduce((best, f) => (near.filter((n) => n === f).length > near.filter((n) => n === best).length ? f : best), 'grass' as (typeof floors)[number]);
    this.map.set(tx, ty, floor);
  }

  /**
   * One dig at a grave. On the last one the stone sinks away and leaves a
   * mound, which a new gravestone rises from in a few minutes. Returns
   * whether it was dug up.
   */
  dig(tx: number, ty: number): boolean {
    const i = ty * MAP_WIDTH + tx;
    const left = (this.nodes.get(i) ?? DIG_HITS) - 1;
    if (left > 0) {
      this.nodes.set(i, left);
      return false;
    }
    this.nodes.delete(i);
    this.map.set(tx, ty, 'mound');
    this.mounds.set(i, this.time + MOUND_REFILL_MIN + Math.random() * MOUND_REFILL_SPREAD);
    return true;
  }

  /**
   * One hit on a pumpkin. Returns whether it burst (leaving grass).
   */
  hitPumpkin(tx: number, ty: number): boolean {
    const i = ty * MAP_WIDTH + tx;
    const left = (this.nodes.get(i) ?? PUMPKIN_HITS) - 1;
    if (left > 0) {
      this.nodes.set(i, left);
      return false;
    }
    this.nodes.delete(i);
    this.map.set(tx, ty, 'grass');
    return true;
  }

  /**
   * How much of a tile is left before it breaks, 0 to 1: a structure's hp,
   * what's left of a tree, rock, or hedge, a grave's digs, or a pumpkin's
   * hits. 0 when there's nothing there to break.
   */
  health(tx: number, ty: number): number {
    const i = ty * MAP_WIDTH + tx;
    const tile = this.map.get(tx, ty);
    const s = this.structures.get(i);
    const full = s && isStructure(tile) ? Math.max(s.hp, structureHp(tile, s.level ?? 0))
      : GATHERABLE[tile]?.amount ?? (tile === 'tombstone' || tile === 'cross' ? DIG_HITS : tile === 'pumpkin' ? PUMPKIN_HITS : ROBBABLE.has(tile) ? ROB_HITS : 0);
    if (ROBBABLE.has(tile) && (this.robbed.get(i) ?? -Infinity) > this.time) {
      return 0;
    }
    if (!full) {
      return 0;
    }
    return Math.round(Math.max(0, (s ? s.hp : this.nodes.get(i) ?? full) / full) * 100) / 100;
  }

  /**
   * Breaks a chest open, leaving grass; the caller spills what was inside.
   */
  openChest(tx: number, ty: number): void {
    this.map.set(tx, ty, 'grass');
  }

  /**
   * Puts a pile on the ground. The dropper (if any) can't pick it back up
   * for a moment, so a pile dropped underfoot doesn't vanish instantly.
   */
  addItem(x: number, y: number, contents: Bundle, dropperId: string | null): void {
    const id = this.nextItemId++;
    this.items.set(id, { id, x, y, ...stock(contents), held: null, dropperId, pickupAfter: this.time + DROPPER_PICKUP_DELAY });
  }

  /**
   * Leaves what a station made beside it: on the open tile below it if
   * there is one (toward the TV), otherwise any open neighbor, joining a
   * pile already there.
   */
  private output(tx: number, ty: number, made: Bundle): void {
    made = { ...made };
    for (const [j, other] of this.structures) {
      const ox = j % MAP_WIDTH;
      const oy = Math.floor(j / MAP_WIDTH);
      const kind = this.map.get(ox, oy);
      const station = isStructure(kind) ? STATIONS[kind] : undefined;
      if (!station || !other.buffer || (ox === tx && oy === ty) || Math.hypot(ox - tx, oy - ty) > STATION_REACH) {
        continue;
      }
      for (const g of GOODS) {
        const room = station.input[g] * 2 - (other.buffer[g] ?? 0);
        const moved = Math.min(made[g], Math.max(0, room));
        other.buffer[g] = (other.buffer[g] ?? 0) + moved;
        made[g] -= moved;
      }
    }
    if (GOODS.every((g: Goods): boolean => made[g] === 0)) {
      return;
    }
    const sides: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    const side = sides.find(([dx, dy]): boolean => !this.map.isSolid(tx + dx, ty + dy) && this.map.get(tx + dx, ty + dy) !== 'door');
    const x = tx + 0.5 + (side ? side[0] * 0.75 : 0);
    const y = ty + 0.5 + (side ? side[1] * 0.75 : 0.6);
    const pile = [...this.items.values()].find((item: Item): boolean => !item.held && Math.hypot(item.x - x, item.y - y) < 0.3);
    if (pile) {
      for (const g of GOODS) {
        pile[g] += made[g];
      }
      return;
    }
    this.addItem(x, y, made, null);
  }

  /**
   * Puts one bag item (a piece of gear or a stack of structures) on the
   * ground, to be picked up with Grab.
   */
  addHeld(x: number, y: number, held: BagItem, dropperId: string | null): void {
    const id = this.nextItemId++;
    this.items.set(id, { id, x, y, ...stock(), held, dropperId, pickupAfter: this.time + DROPPER_PICKUP_DELAY });
  }

  /**
   * The bag item on the ground within reach of a player at (x, y) facing
   * (fx, fy) (the middle of the tile they face), nearest first.
   */
  heldNear(x: number, y: number, fx: number, fy: number): { id: number; held: BagItem } | null {
    let best: Item | null = null;
    let bestDist = Infinity;
    for (const item of this.items.values()) {
      if (!item.held) {
        continue;
      }
      const d = Math.min(Math.hypot(item.x - x, item.y - y), Math.hypot(item.x - fx, item.y - fy));
      if (d <= GRAB_RADIUS && d < bestDist) {
        best = item;
        bestDist = d;
      }
    }
    return best?.held ? { id: best.id, held: best.held } : null;
  }

  /**
   * Bag items on the ground under a player at (x, y), for walking over to
   * pick them up; what they dropped themselves waits a moment.
   */
  heldUnder(playerId: string, x: number, y: number): { id: number; held: BagItem }[] {
    return [...this.items.values()]
      .filter((item: Item): boolean => item.held !== null && Math.hypot(item.x - x, item.y - y) <= PICKUP_RADIUS && !(item.dropperId === playerId && this.time < item.pickupAfter))
      .map((item: Item) => ({ id: item.id, held: item.held! }));
  }

  /**
   * Leaves what's left of a partly picked-up stack on the ground, or
   * removes the item.
   */
  setHeld(id: number, held: BagItem | null): void {
    const item = this.items.get(id);
    if (item && held) {
      item.held = held;
    } else {
      this.items.delete(id);
    }
  }

  /**
   * Offers nearby piles to `take`, which says how much of each kind of
   * goods it took (the rest stays on the ground). Returns how much of each
   * was picked up.
   */
  pickUp(playerId: string, x: number, y: number, take: (goods: Goods, amount: number) => number): Bundle {
    const took = stock();
    for (const [id, item] of this.items) {
      if (item.held || Math.hypot(item.x - x, item.y - y) > PICKUP_RADIUS) {
        continue;
      }
      if (item.dropperId === playerId && this.time < item.pickupAfter) {
        continue;
      }
      for (const g of GOODS) {
        const n = item[g] > 0 ? take(g, item[g]) : 0;
        item[g] -= n;
        took[g] += n;
      }
      if (GOODS.every((g: Goods): boolean => item[g] === 0)) {
        this.items.delete(id);
      }
    }
    return took;
  }

  /**
   * Advances the clock, burns fuel, rots stumps, regrows rocks, raises new
   * gravestones from mounds whose time has come, and grows trees,
   * pumpkins, and chests back toward their targets, never onto a tile
   * someone is standing on.
   *
   * @returns Whatever grew this step.
   */
  step(dt: number, occupants: Occupant[]): { tx: number; ty: number; tile: GrownTile }[] {
    this.time += dt;
    for (const [i, s] of this.structures) {
      if (s.progress !== undefined && s.queue === undefined) {
        this.stepDigger(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), s, dt);
        continue;
      }
      if (s.queue === undefined) {
        s.fuel = Math.max(0, s.fuel - dt);
        continue;
      }
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      const kind = this.map.get(tx, ty) as StructureKind;
      this.supply(tx, ty, s, STATIONS[kind]!);
      s.progress = s.queue > 0 ? (s.progress ?? 0) + dt : 0;
      if (s.queue > 0 && s.progress >= stationSeconds(kind, s.level ?? 0)) {
        s.queue--;
        s.progress = 0;
        this.output(tx, ty, STATIONS[kind]!.output);
      }
      s.fuel = s.queue > 0 ? WORKING_GLOW : 0;
    }
    const occupied = (tx: number, ty: number): boolean =>
      occupants.some((o: Occupant): boolean => Math.abs(o.x - (tx + 0.5)) < 1.2 && Math.abs(o.y - (ty + 0.5)) < 1.2);

    for (const [i, at] of this.regrow) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      if (this.time < at) {
        continue;
      }
      if (this.map.get(tx, ty) === 'stump') {
        this.map.set(tx, ty, 'grass');
      }
      this.regrow.delete(i);
    }

    if (this.time >= this.nextRockCheck) {
      this.nextRockCheck = this.time + ROCK_CHECK_INTERVAL;
      this.maybeGrowRock(occupied);
    }

    const grown: { tx: number; ty: number; tile: GrownTile }[] = [];
    for (const [i, at] of this.mounds) {
      const tx = i % MAP_WIDTH;
      const ty = Math.floor(i / MAP_WIDTH);
      if (this.map.get(tx, ty) !== 'mound') {
        this.mounds.delete(i);
        continue;
      }
      if (this.time < at || occupied(tx, ty) || this.hasItemOn(tx, ty)) {
        continue;
      }
      const tile = Math.random() < TOMBSTONE_SHARE ? 'tombstone' : 'cross';
      this.map.set(tx, ty, tile);
      this.mounds.delete(i);
      grown.push({ tx, ty, tile });
    }
    for (const tile of ['tree', 'pumpkin', 'chest'] as const) {
      if (!this.restock || this.time < this.growAt[tile]) {
        continue;
      }
      this.growAt[tile] = this.time + GROW_INTERVAL[tile] * (0.6 + Math.random() * 0.8);
      const have = tile === 'tree' ? this.count('tree', 'stump') : this.count(tile);
      const at = have < this.targets[tile] ? this.grow(tile, occupied) : null;
      if (at) {
        grown.push({ ...at, tile });
      }
    }
    return grown;
  }

  /**
   * Fills a station's buffer from piles within reach (only what its input
   * asks for), then turns every full batch in the buffer into a queued one.
   */
  private supply(tx: number, ty: number, s: StructureState, station: Station): void {
    s.buffer ??= {};
    for (const [id, item] of this.items) {
      if (item.held || Math.hypot(item.x - (tx + 0.5), item.y - (ty + 0.5)) > STATION_REACH) {
        continue;
      }
      for (const g of GOODS) {
        const want = Math.max(0, station.input[g] * 2 - (s.buffer[g] ?? 0));
        const moved = Math.min(want, item[g]);
        item[g] -= moved;
        s.buffer[g] = (s.buffer[g] ?? 0) + moved;
      }
      if (GOODS.every((g: Goods): boolean => item[g] === 0)) {
        this.items.delete(id);
      }
    }
    while ((s.queue ?? 0) < station.queue && GOODS.every((g: Goods): boolean => (s.buffer![g] ?? 0) >= station.input[g])) {
      for (const g of GOODS) {
        s.buffer[g] = (s.buffer[g] ?? 0) - station.input[g];
      }
      s.queue = (s.queue ?? 0) + 1;
    }
  }

  /**
   * A bone digger works away at a tree, rock, or hedge beside it, one unit
   * every few seconds, handing what it digs to a station in reach or
   * leaving it beside itself.
   */
  private stepDigger(tx: number, ty: number, s: StructureState, dt: number): void {
    const sides: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]];
    const side = sides.find(([dx, dy]): boolean => !!GATHERABLE[this.map.get(tx + dx, ty + dy)]?.resource);
    if (!side) {
      s.progress = 0;
      return;
    }
    s.progress = (s.progress ?? 0) + dt;
    if (s.progress < diggerSeconds(s.level ?? 0)) {
      return;
    }
    s.progress = 0;
    const [gx, gy] = [tx + side[0], ty + side[1]];
    const resource = GATHERABLE[this.map.get(gx, gy)]!.resource!;
    this.gather(gx, gy);
    this.dug.push({ tx: gx, ty: gy, chip: resource === 'wood' ? 'wood' : 'stone' });
    this.output(tx, ty, stock({ [resource]: 1 }));
  }

  itemStates(): ItemState[] {
    return [...this.items.values()].map(({ dropperId: _dropper, pickupAfter: _after, ...state }: Item): ItemState => state);
  }

  /**
   * Tiles of these kinds on the map.
   */
  private count(...tiles: Tile[]): number {
    let n = 0;
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        n += tiles.includes(this.map.get(tx, ty)) ? 1 : 0;
      }
    }
    return n;
  }

  /**
   * Whether any neighbor of a tile (diagonals too, if asked) is one of
   * `kinds`.
   */
  private beside(tx: number, ty: number, kinds: ReadonlySet<Tile>, diagonal: boolean): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((dx !== 0 || dy !== 0) && (diagonal || dx === 0 || dy === 0) && kinds.has(this.map.get(tx + dx, ty + dy))) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Puts one `tile` on open grass, away from spawns, people, and items:
   * trees beside other trees (so the forest spreads; mostly in the middle
   * of the map), pumpkins beside a
   * path, chests beside graves or hedges, anywhere open when no such spot
   * is left. A spot is only used if every tile reachable (there and back)
   * before still is.
   */
  private grow(tile: StockedTile, occupied: (tx: number, ty: number) => boolean): { tx: number; ty: number } | null {
    const likes = tile === 'tree' ? TREES : tile === 'pumpkin' ? PATHS : GRAVESIDE;
    const preferred: [number, number][] = [];
    const open: [number, number][] = [];
    for (const [tx, ty] of this.growSpots(occupied)) {
      (this.beside(tx, ty, likes, tile !== 'pumpkin') ? preferred : open).push([tx, ty]);
    }
    let pool = preferred.length > 0 ? preferred : open;
    if (tile === 'tree' && Math.random() < INNER_TREE_CHANCE) {
      const inner = pool.filter(([tx, ty]): boolean => Math.min(tx, ty, MAP_WIDTH - 1 - tx, MAP_HEIGHT - 1 - ty) >= INNER_TREE_INSET);
      pool = inner.length > 0 ? inner : pool;
    }
    return this.plant(tile, pool);
  }

  /**
   * Puts a tree, pumpkin, chest, or rock on open grass anywhere on the
   * map, whatever the targets say (the TV's Game tab). Null if
   * there's no room.
   */
  spawnTile(tile: StockedTile | 'rock', occupied: (tx: number, ty: number) => boolean): { tx: number; ty: number } | null {
    return this.plant(tile, this.growSpots(occupied));
  }

  /**
   * Whether a tile is inside the map's view (always, unless the map only
   * uses part of the grid, like the sandbox).
   */
  inView(tx: number, ty: number): boolean {
    const v = this.view;
    return !v || (tx >= v.x && ty >= v.y && tx < v.x + v.w && ty < v.y + v.h);
  }

  /**
   * Grass tiles something may appear on: inside the view, not under
   * anyone, any item, or right by a spawn point.
   */
  private growSpots(occupied: (tx: number, ty: number) => boolean): [number, number][] {
    const itemTiles = new Set([...this.items.values()].map((item: Item): number => Math.floor(item.y) * MAP_WIDTH + Math.floor(item.x)));
    const spawns = this.map.spawnPoints();
    const spots: [number, number][] = [];
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (
          this.map.get(tx, ty) === 'grass'
          && this.inView(tx, ty)
          && !occupied(tx, ty)
          && !itemTiles.has(ty * MAP_WIDTH + tx)
          && !spawns.some((s: { x: number; y: number }): boolean => Math.abs(Math.floor(s.x) - tx) <= 2 && Math.abs(Math.floor(s.y) - ty) <= 2)
        ) {
          spots.push([tx, ty]);
        }
      }
    }
    return spots;
  }

  /**
   * Sets `tile` on a random spot from `pool` that doesn't cut anything off.
   */
  private plant(tile: Tile, pool: [number, number][]): { tx: number; ty: number } | null {
    const before = this.reachable();
    for (let tries = 0; tries < 12 && pool.length > 0; tries++) {
      const [[tx, ty]] = pool.splice(Math.floor(Math.random() * pool.length), 1);
      this.map.set(tx, ty, tile);
      if (this.reachable() === before - 1) {
        return { tx, ty };
      }
      this.map.set(tx, ty, 'grass');
    }
    return null;
  }

  /**
   * How many tiles can be walked to from the spawns and back.
   */
  private reachable(): number {
    return this.map.roundTrip(this.map.spawnPoints()).reduce((n: number, v: number): number => n + v, 0);
  }

  /**
   * Adds one rock if the map is below target, on a grass tile whose eight
   * neighbors are all open so it can never seal off a passage.
   */
  private maybeGrowRock(occupied: (tx: number, ty: number) => boolean): void {
    let rocks = 0;
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        rocks += this.map.get(tx, ty) === 'rock' ? 1 : 0;
      }
    }
    if (rocks >= ROCK_TARGET) {
      return;
    }
    for (let tries = 0; tries < 50; tries++) {
      const tx = 1 + Math.floor(Math.random() * (MAP_WIDTH - 2));
      const ty = 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2));
      if (this.map.get(tx, ty) !== 'grass' || occupied(tx, ty)) {
        continue;
      }
      let open = true;
      for (let dy = -1; dy <= 1 && open; dy++) {
        for (let dx = -1; dx <= 1 && open; dx++) {
          open = !this.map.isSolid(tx + dx, ty + dy);
        }
      }
      if (open) {
        this.map.set(tx, ty, 'rock');
        return;
      }
    }
  }
}
