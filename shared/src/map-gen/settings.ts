/**
 * Knobs for a randomly generated map, set in the TV's Game tab before
 * starting a new world on a random map. Presets ignore them.
 */
export interface MapGenSettings {
  /**
   * The classic one-graveyard map, or a huge world (HUGE_SIZE square): one
   * landscape of hills and hollows with landmarks scattered over it,
   * joined by roads through wild woods, broken up by chasms. The other
   * knobs shape either one.
   */
  size: WorldSize;

  /**
   * Raised terraces (0 to 8), their size (a radius multiplier), and the
   * chance each gets a higher peak in the middle.
   */
  mountains: number;

  /**
   * The terraces' size (a radius multiplier).
   */
  mountainSize: number;

  /**
   * The chance each terrace gets a higher peak in the middle.
   */
  peaks: number;

  /**
   * Sunken hollows (0 to 4) and their size.
   */
  pits: number;

  /**
   * The hollows' size (a radius multiplier).
   */
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

  /**
   * How thick the forest edge is.
   */
  forest: number;

  /**
   * How many rocks.
   */
  rocks: number;

  /**
   * How many graves.
   */
  graves: number;

  /**
   * How many pumpkins.
   */
  pumpkins: number;
}

/**
 * How big a generated world is.
 */
export type WorldSize = 'classic' | 'huge';

/**
 * A landmark the generator can build. The last four only exist in huge
 * worlds.
 */
export type MapStructure = 'chapel' | 'tower' | 'mausoleums' | 'well' | 'plots' | 'lamps' | 'crypts' | 'ruins' | 'stones' | 'patches';

/**
 * Every landmark, in the order the Game tab lists them, with its name, and
 * whether only huge worlds have it (its switch shows only for Huge).
 */
export const MAP_STRUCTURES: { key: MapStructure; label: string; hugeOnly?: boolean }[] = [
  { key: 'tower', label: 'Watchtower hill' },
  { key: 'chapel', label: 'Ruined chapel' },
  { key: 'mausoleums', label: 'Mausoleums' },
  { key: 'well', label: 'Well plaza' },
  { key: 'plots', label: 'Hedged grave plots' },
  { key: 'lamps', label: 'Lamp posts' },
  { key: 'crypts', label: 'Lone crypts', hugeOnly: true },
  { key: 'ruins', label: 'Ruined houses', hugeOnly: true },
  { key: 'stones', label: 'Stone circles', hugeOnly: true },
  { key: 'patches', label: 'Pumpkin patches', hugeOnly: true },
];

/**
 * The settings a TV starts with before any are saved.
 */
export const DEFAULT_MAP_GEN: MapGenSettings = {
  size: 'classic',
  mountains: 4,
  mountainSize: 1,
  peaks: 0.4,
  pits: 1,
  pitSize: 1,
  stairs: 0,
  structures: { chapel: true, tower: true, mausoleums: true, well: true, plots: true, lamps: true, crypts: true, ruins: true, stones: true, patches: true },
  trees: 1,
  forest: 1,
  rocks: 1,
  graves: 1,
  pumpkins: 1,
};

/**
 * One numeric knob's slider.
 */
export interface MapGenRange {
  /**
   * The knob it sets.
   */
  key: Exclude<keyof MapGenSettings, 'structures' | 'size'>;

  /**
   * The slider's name.
   */
  label: string;

  /**
   * The lowest value.
   */
  min: number;

  /**
   * The highest value.
   */
  max: number;

  /**
   * How far one notch moves it.
   */
  step: number;

  /**
   * Shown as a percentage instead of a count.
   */
  percent?: boolean;
}

/**
 * The sliders for the numeric knobs: range and step.
 */
export const MAP_GEN_RANGES: MapGenRange[] = [
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
