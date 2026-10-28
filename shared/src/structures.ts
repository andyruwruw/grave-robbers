// Local Imports
import { stock } from './items';

// Types
import type { Bundle } from './items';
import type { Tile } from './world';

/**
 * Everything a player can build. Each kind is also a tile.
 */
export type StructureKind =
  | 'wood-wall' | 'stone-wall' | 'palisade' | 'door' | 'wood-fence' | 'spikes' | 'iron-spikes' | 'barbed-wire' | 'scarecrow'
  | 'torch' | 'lantern' | 'ghost-lamp' | 'campfire' | 'soul-fire' | 'platform' | 'steps'
  | 'research-table' | 'sawmill' | 'furnace'
  | 'effigy' | 'altar' | 'bloodforge' | 'sifter' | 'sentry' | 'digger' | 'bone-wall' | 'coffin' | 'bell' | 'cauldron'
  | 'obelisk' | 'blood-fountain' | 'soul-cage' | 'mirror';

export const STRUCTURE_KINDS: StructureKind[] = [
  'wood-wall', 'stone-wall', 'palisade', 'door', 'wood-fence', 'spikes', 'iron-spikes', 'barbed-wire', 'scarecrow',
  'torch', 'lantern', 'ghost-lamp', 'campfire', 'soul-fire', 'platform', 'steps',
  'research-table', 'sawmill', 'furnace',
  'effigy', 'altar', 'bloodforge', 'sifter', 'sentry', 'digger', 'bone-wall', 'coffin', 'bell', 'cauldron',
  'obelisk', 'blood-fountain', 'soul-cage', 'mirror',
];

/**
 * Ground traps: walked over, not around. Spikes and iron spikes cut
 * whoever stands in them (iron twice as hard); barbed wire barely cuts but
 * holds monsters to BARBED_SLOW of their speed (players to BARBED_PLAYER_SLOW).
 */
export const TRAPS: ReadonlySet<StructureKind> = new Set<StructureKind>(['spikes', 'iron-spikes', 'barbed-wire']);
export const TRAP_DAMAGE: Partial<Record<StructureKind, number>> = { 'spikes': 1, 'iron-spikes': 2, 'barbed-wire': 0.25 };

export function isTrap(tile: string): tile is StructureKind {
  return TRAPS.has(tile as StructureKind);
}
export const BARBED_SLOW = 0.4;
export const BARBED_PLAYER_SLOW = 0.6;

/**
 * Lights ghosts can't snuff out.
 */
export const GHOSTPROOF: ReadonlySet<StructureKind> = new Set<StructureKind>(['ghost-lamp', 'soul-fire', 'obelisk', 'blood-fountain', 'soul-cage']);

/**
 * Occult works: a cursed obelisk makes monsters within OBELISK_RADIUS
 * tiles (more with upgrades) take OBELISK_CURSE times the damage; a blood
 * fountain mends whoever stands by it like a campfire; a soul cage pulls
 * in and destroys a ghost that drifts within SOUL_CAGE_RADIUS, one every
 * SOUL_CAGE_COOLDOWN seconds; a cursed mirror turns monsters' arrows and
 * ectoplasm that pass within MIRROR_RADIUS back on them (and shatters
 * potions harmlessly).
 */
export const OBELISK_RADIUS = 4;
export const OBELISK_CURSE = 1.25;
export const SOUL_CAGE_RADIUS = 3;
export const SOUL_CAGE_COOLDOWN = 6;
export const MIRROR_RADIUS = 1.6;

/**
 * An effigy curses the ground around it: zombies, vampires, and the like
 * within EFFIGY_RADIUS tiles (more with upgrades) move at EFFIGY_SLOW of
 * their speed.
 */
export const EFFIGY_RADIUS = 3;
export const EFFIGY_SLOW = 0.7;

/**
 * A light something gives off. Built lights never burn out (`burn` is
 * Infinity; only stations and altars glow for a while, while they work).
 */
export interface LightDef {
  /**
   * Reach in tiles.
   */
  radius: number;

  /**
   * Seconds a glow lasts (Infinity for lights that burn for good).
   */
  burn: number;

  color: string;

  /**
   * How bright it is at its middle (1 when missing).
   */
  intensity?: number;
}

/**
 * Fuel a lit light is held at: lights never burn down, so this only marks
 * it lit (a ghost snuffing it sets it to 0, and Action relights it).
 */
export const LIT = 1e9;

/**
 * Fuel a working station's light is held at, enough to shine at full size.
 */
export const WORKING_GLOW = 20;

/**
 * Build rules and stats for one kind of structure.
 */
export interface StructureDef {
  label: string;
  cost: Bundle;
  hp: number;
  light?: LightDef;
}

export const STRUCTURES: Record<StructureKind, StructureDef> = {
  'wood-wall': { label: 'Wood wall', cost: stock({ wood: 2 }), hp: 20 },
  'stone-wall': { label: 'Stone wall', cost: stock({ stone: 3 }), hp: 50 },
  'palisade': { label: 'Palisade', cost: stock({ planks: 3 }), hp: 35 },
  'door': { label: 'Door', cost: stock({ wood: 3 }), hp: 20 },
  'wood-fence': { label: 'Fence', cost: stock({ wood: 1 }), hp: 10 },
  'spikes': { label: 'Spikes', cost: stock({ wood: 2, stone: 1 }), hp: 15 },
  'scarecrow': { label: 'Scarecrow', cost: stock({ wood: 3 }), hp: 30 },
  'iron-spikes': { label: 'Iron spikes', cost: stock({ iron: 2, wood: 1 }), hp: 30 },
  'barbed-wire': { label: 'Barbed wire', cost: stock({ iron: 1, wood: 2 }), hp: 20 },
  'torch': { label: 'Torch', cost: stock({ wood: 1 }), hp: 5, light: { radius: 3, burn: Infinity, color: '#ffc27a', intensity: 0.8 } },
  'lantern': { label: 'Oil lantern', cost: stock({ wood: 2, stone: 1 }), hp: 15, light: { radius: 4.5, burn: Infinity, color: '#ffd98a', intensity: 1.1 } },
  'ghost-lamp': { label: 'Ghost lamp', cost: stock({ iron: 1, bone: 2, silver: 1 }), hp: 25, light: { radius: 6, burn: Infinity, color: '#b8ffe0', intensity: 1.3 } },
  'campfire': { label: 'Campfire', cost: stock({ wood: 3, stone: 3 }), hp: 30, light: { radius: 6.5, burn: Infinity, color: '#ffb366', intensity: 1.4 } },
  'soul-fire': { label: 'Soul fire', cost: stock({ stone: 4, bone: 4, blood: 2 }), hp: 45, light: { radius: 8.5, burn: Infinity, color: '#7fe0ff', intensity: 1.7 } },
  'effigy': { label: 'Effigy', cost: stock({ wood: 3, bone: 1 }), hp: 20 },
  'obelisk': { label: 'Cursed obelisk', cost: stock({ stone: 6, bone: 2 }), hp: 60, light: { radius: 2.2, burn: Infinity, color: '#b04aff', intensity: 0.6 } },
  'blood-fountain': { label: 'Blood fountain', cost: stock({ stone: 5, bloodsteel: 1, blood: 4 }), hp: 40, light: { radius: 3, burn: Infinity, color: '#ff2236', intensity: 0.8 } },
  'soul-cage': { label: 'Soul cage', cost: stock({ iron: 2, bone: 3, silver: 1 }), hp: 35, light: { radius: 1.6, burn: Infinity, color: '#b8ffe0', intensity: 0.6 } },
  'mirror': { label: 'Cursed mirror', cost: stock({ silver: 2, planks: 2, stone: 1 }), hp: 25 },
  'platform': { label: 'Platform', cost: stock({ wood: 3 }), hp: 25 },
  'steps': { label: 'Steps', cost: stock({ wood: 2 }), hp: 15 },
  'research-table': { label: 'Research table', cost: stock({ wood: 4, stone: 2 }), hp: 30 },
  'sawmill': { label: 'Sawmill', cost: stock({ wood: 5, stone: 2 }), hp: 30 },
  'furnace': { label: 'Furnace', cost: stock({ stone: 6, wood: 2 }), hp: 40, light: { radius: 2.5, burn: WORKING_GLOW, color: '#ff8a3d' } },
  'altar': { label: 'Sacrificial altar', cost: stock({ stone: 5, bone: 2 }), hp: 40, light: { radius: 3, burn: WORKING_GLOW, color: '#ff2236' } },
  'bloodforge': { label: 'Blood furnace', cost: stock({ stone: 6, iron: 2 }), hp: 40, light: { radius: 2.5, burn: WORKING_GLOW, color: '#ff3326' } },
  'sifter': { label: 'Grave sifter', cost: stock({ wood: 4, planks: 2 }), hp: 25 },
  'sentry': { label: 'Blood sentry', cost: stock({ bloodsteel: 2, bone: 3, planks: 2 }), hp: 30 },
  'digger': { label: 'Bone digger', cost: stock({ bone: 3, wood: 3, iron: 1 }), hp: 25 },
  'bone-wall': { label: 'Bone wall', cost: stock({ bone: 4, stone: 1 }), hp: 70 },
  'coffin': { label: 'Coffin', cost: stock({ planks: 4, bone: 2 }), hp: 30 },
  'bell': { label: 'Silver bell', cost: stock({ silver: 2, wood: 2 }), hp: 20 },
  'cauldron': { label: 'Cauldron', cost: stock({ stone: 4, wood: 3, bone: 1 }), hp: 30, light: { radius: 2, burn: WORKING_GLOW, color: '#8dff5a' } },
};

/**
 * A structure that turns materials into others: Action on it feeds one
 * batch of `input` from the bag (up to `queue` waiting), and every
 * `seconds` one batch comes out beside it as `output`. A station with a
 * light glows only while it works.
 */
export interface Station {
  input: Bundle;
  output: Bundle;
  seconds: number;
  queue: number;
}

export const STATIONS: Partial<Record<StructureKind, Station>> = {
  'sawmill': { input: stock({ wood: 2 }), output: stock({ planks: 1 }), seconds: 4, queue: 5 },
  'furnace': { input: stock({ stone: 2 }), output: stock({ iron: 1 }), seconds: 6, queue: 5 },
  'sifter': { input: stock({ stone: 3 }), output: stock({ silver: 1 }), seconds: 7, queue: 5 },
  'bloodforge': { input: stock({ iron: 1, blood: 2 }), output: stock({ bloodsteel: 1 }), seconds: 8, queue: 5 },
  'cauldron': { input: stock({ blood: 2, bone: 1 }), output: stock({ tonic: 1 }), seconds: 6, queue: 5 },
};

/**
 * Stations (and the bone digger) reach this far (tiles, from their middle)
 * for piles to work through, and hand what they make straight to a station
 * this close that takes it, so a row of them runs on its own.
 */
export const STATION_REACH = 1.6;

/**
 * Seconds a bone digger takes per unit it digs from a tree, rock, or hedge
 * beside it, at level 0.
 */
export const DIGGER_SECONDS = 6;

/**
 * An offering at a sacrificial altar: the health it takes and the blood it
 * gives (plus one per level). Monsters that die this close to an altar
 * bleed twice as much.
 */
export const ALTAR_HP_COST = 2;
export const ALTAR_BLOOD = 3;
export const ALTAR_RADIUS = 4;

/**
 * A blood sentry: shots one blood buys, most shots it holds, range
 * (tiles), seconds between shots, and damage per shot at level 0.
 */
export const SENTRY_SHOTS_PER_BLOOD = 3;
export const SENTRY_MAX_SHOTS = 30;
export const SENTRY_RANGE = 6;
export const SENTRY_COOLDOWN = 1.2;
export const SENTRY_DAMAGE = 3;

/**
 * Ghosts can't drift closer than this (tiles) to a silver bell, plus half
 * a tile per level.
 */
export const BELL_RADIUS = 3.5;

/**
 * Damage a palisade's stakes do to a zombie each time it bites.
 */
export const PALISADE_THORNS = 1;

/**
 * Structures that raise the ground: a platform's deck stands a level up,
 * and steps ramp up to whatever higher tile they lead to. Both are walked
 * on, so nobody may stand on the tile while one is built.
 */
export const RAISED: ReadonlySet<StructureKind> = new Set<StructureKind>(['platform', 'steps']);

/**
 * Seconds of fuel below which a light starts shrinking.
 */
export const LOW_FUEL = 15;

/**
 * Tiles a structure can be placed on.
 */
export const BUILDABLE_FLOORS: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'cobble', 'flagstone', 'mound']);

/**
 * Permanent glow of a jack-o'-lantern tile.
 */
export const PUMPKIN_LIGHT: LightDef = { radius: 2, burn: Infinity, color: '#ff9a48' };

/**
 * Permanent glow of a lamp post landmark.
 */
export const LAMP_LIGHT: LightDef = { radius: 2.5, burn: Infinity, color: '#ffcf7a' };

/**
 * Candles at a statue's feet and the lantern over a mausoleum door.
 */
export const CANDLE_LIGHT: LightDef = { radius: 1.8, burn: Infinity, color: '#ffb35c' };

/**
 * The light the TV's right mouse button carries around: a wide, steady
 * pool of moonlight, big enough to keep vampires off.
 */
export const CURSOR_LIGHT: LightDef = { radius: 6, burn: Infinity, color: '#d8e6ff' };

/**
 * Light every player carries; too small to keep vampires away.
 */
export const LANTERN_LIGHT: LightDef = { radius: 1.5, burn: Infinity, color: '#ffe2b8' };

/**
 * How much damage a swing does to a structure.
 */
export const SWING_DAMAGE = 2;

export function isStructure(tile: Tile): tile is StructureKind {
  return (STRUCTURE_KINDS as Tile[]).includes(tile);
}
