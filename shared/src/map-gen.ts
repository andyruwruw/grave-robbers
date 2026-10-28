/**
 * Knobs for a randomly generated map, set in the TV's Game tab before
 * starting a new world on a random map. Presets ignore them.
 */
export interface MapGenSettings {
  /**
   * Raised terraces (0 to 8), their size (a radius multiplier), and the
   * chance each gets a higher peak in the middle.
   */
  mountains: number;
  mountainSize: number;
  peaks: number;

  /**
   * Sunken hollows (0 to 4) and their size.
   */
  pits: number;
  pitSize: number;

  /**
   * Extra stairs on top of the ones needed to reach everything, 0 (none)
   * to 1 (many).
   */
  stairs: number;

  /**
   * Which landmarks to build: one per quadrant at most, plus the hedged
   * grave plots and lamp posts along the paths.
   */
  structures: Record<MapStructure, boolean>;

  /**
   * How much of each kind of scenery, as a multiplier on the usual amount
   * (0 is none, 1 is normal).
   */
  trees: number;
  forest: number;
  rocks: number;
  graves: number;
  pumpkins: number;
}

export type MapStructure = 'chapel' | 'tower' | 'mausoleums' | 'well' | 'plots' | 'lamps';

export const MAP_STRUCTURES: { key: MapStructure; label: string }[] = [
  { key: 'tower', label: 'Watchtower hill' },
  { key: 'chapel', label: 'Ruined chapel' },
  { key: 'mausoleums', label: 'Mausoleums' },
  { key: 'well', label: 'Well plaza' },
  { key: 'plots', label: 'Hedged grave plots' },
  { key: 'lamps', label: 'Lamp posts' },
];

export const DEFAULT_MAP_GEN: MapGenSettings = {
  mountains: 4,
  mountainSize: 1,
  peaks: 0.4,
  pits: 1,
  pitSize: 1,
  stairs: 0,
  structures: { chapel: true, tower: true, mausoleums: true, well: true, plots: true, lamps: true },
  trees: 1,
  forest: 1,
  rocks: 1,
  graves: 1,
  pumpkins: 1,
};

/**
 * The sliders for the numeric knobs: range and step.
 */
export const MAP_GEN_RANGES: { key: Exclude<keyof MapGenSettings, 'structures'>; label: string; min: number; max: number; step: number; percent?: boolean }[] = [
  { key: 'mountains', label: 'Mountains', min: 0, max: 8, step: 1 },
  { key: 'mountainSize', label: 'Mountain size', min: 0.5, max: 1.6, step: 0.1, percent: true },
  { key: 'peaks', label: 'Higher peaks', min: 0, max: 1, step: 0.05, percent: true },
  { key: 'pits', label: 'Pits', min: 0, max: 4, step: 1 },
  { key: 'pitSize', label: 'Pit size', min: 0.5, max: 1.6, step: 0.1, percent: true },
  { key: 'stairs', label: 'Extra stairs', min: 0, max: 1, step: 0.05, percent: true },
  { key: 'trees', label: 'Trees', min: 0, max: 2, step: 0.1, percent: true },
  { key: 'forest', label: 'Forest edge', min: 0, max: 2, step: 0.1, percent: true },
  { key: 'rocks', label: 'Rocks', min: 0, max: 3, step: 0.1, percent: true },
  { key: 'graves', label: 'Graves', min: 0, max: 3, step: 0.1, percent: true },
  { key: 'pumpkins', label: 'Pumpkins', min: 0, max: 2, step: 0.1, percent: true },
];

/**
 * Settings from a message or storage, with anything missing or out of range
 * replaced by the default.
 */
export function cleanMapGen(raw: unknown): MapGenSettings {
  const given = (raw && typeof raw === 'object' ? raw : {}) as Partial<MapGenSettings>;
  const out: MapGenSettings = { ...DEFAULT_MAP_GEN, structures: { ...DEFAULT_MAP_GEN.structures } };
  for (const { key, min, max } of MAP_GEN_RANGES) {
    const v = given[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = Math.min(max, Math.max(min, v));
    }
  }
  for (const { key } of MAP_STRUCTURES) {
    const v = given.structures?.[key];
    if (typeof v === 'boolean') {
      out.structures[key] = v;
    }
  }
  return out;
}
