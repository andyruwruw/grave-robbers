// Local Imports
import { STRUCTURES, STRUCTURE_KINDS } from '../structures/structure-catalog';

// Types
import type { StructureKind } from '../structures/types/structures';
import type { Tile } from '../world/tiles';

/**
 * Lights the palette lists in their own group.
 */
const LIGHT_TILES: ReadonlySet<Tile> = new Set<Tile>(['lamp', 'lantern', 'torch', 'campfire', 'ghost-lamp', 'soul-fire']);

/**
 * One thing the editor's palette paints.
 */
export interface PaletteEntry {
  /**
   * The tile painted (with `mix`, the one the button shows).
   */
  tile: Tile;

  /**
   * The button's name.
   */
  label: string;

  /**
   * Tiles painted at random instead, one per tile (repeats weigh more).
   */
  mix?: Tile[];
}

/**
 * One titled group of the editor's palette.
 */
export interface PaletteGroup {
  /**
   * The group's heading.
   */
  group: string;

  /**
   * Its entries, in button order.
   */
  tiles: PaletteEntry[];
}

/**
 * What the editor can paint, in groups for its palette. An entry with `mix`
 * paints one of those at random on each tile.
 */
export const EDIT_PALETTE: PaletteGroup[] = [
  {
    group: 'Ground',
    tiles: [
      { tile: 'grass', label: 'Grass' },
      { tile: 'path', label: 'Path' },
      { tile: 'cobble', label: 'Cobble' },
      { tile: 'flagstone', label: 'Flagstone' },
      { tile: 'spawn', label: 'Spawn point' },
    ],
  },
  {
    group: 'Nature',
    tiles: [
      { tile: 'tree', label: 'Tree' },
      { tile: 'rock', label: 'Rock' },
      { tile: 'hedge', label: 'Hedge' },
      { tile: 'pumpkin', label: 'Pumpkin' },
      { tile: 'chest', label: 'Chest' },
    ],
  },
  {
    group: 'Graves',
    tiles: [
      { tile: 'tombstone', label: 'Mixed graves', mix: ['tombstone', 'tombstone', 'cross'] },
      { tile: 'tombstone', label: 'Headstone' },
      { tile: 'cross', label: 'Cross' },
      { tile: 'mound', label: 'Open grave' },
      { tile: 'statue', label: 'Statue' },
    ],
  },
  {
    group: 'Lights',
    tiles: [
      { tile: 'lamp', label: 'Lamp post' },
      { tile: 'lantern', label: 'Oil lantern' },
      { tile: 'ghost-lamp', label: 'Ghost lamp' },
      { tile: 'torch', label: 'Torch' },
      { tile: 'campfire', label: 'Campfire' },
      { tile: 'soul-fire', label: 'Soul fire' },
      { tile: 'pumpkin', label: 'Jack-o\'-lantern' },
    ],
  },
  {
    group: 'Landmarks',
    tiles: [
      { tile: 'well', label: 'Well' },
      { tile: 'ruin', label: 'Ruin wall' },
      { tile: 'mausoleum', label: 'Mausoleum' },
      { tile: 'crypt', label: 'Crypt wall' },
      { tile: 'tower', label: 'Tower wall' },
    ],
  },
  {
    group: 'Structures',
    tiles: STRUCTURE_KINDS.filter((kind: StructureKind): boolean => !LIGHT_TILES.has(kind)).map((kind: StructureKind) => ({ tile: kind, label: STRUCTURES[kind].label })),
  },
];

/**
 * Every tile the editor may paint.
 */
export const EDIT_TILES: ReadonlySet<Tile> = new Set(EDIT_PALETTE.flatMap(({ tiles }) => tiles.map(({ tile }) => tile)));
