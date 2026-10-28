// Packages
import { STRUCTURES, STRUCTURE_KINDS } from './structures';

// Types
import type { Blend } from './blend';
import type { StructureKind } from './structures';
import type { Tile } from './world';

/**
 * One change from the TV's map editor, on the tile at (tx, ty) and, for
 * the brush tools, the round brush `size` tiles across around it:
 *
 * - level: sets the ground to a level, only where it's at `from` when given
 *   (the editor's raise and lower tools take the level a stroke starts on
 *   as `from` and go one above or below it, so a stroke lifts or sinks just
 *   that layer).
 * - tile: paints a tile (ground, scenery, a grave, a landmark, or a built
 *   structure, which starts out fresh; lights never burn out), or one of
 *   `mix` at random per tile, on only a `scatter` share (0 to 1) of the
 *   brush's tiles when given.
 * - erase: back to grass (a built structure comes down to what it stood on)
 *   and anything lying on the ground there is gone.
 * - blend: the Mix brush; repaints grass and scenery to the `blend`'s
 *   shares, laid out on a fixed even pattern (see `blendTile`), so the same
 *   setting twice changes nothing, and remembers the setting on each tile.
 * - stairs: puts stairs down (climbing `dir`, an index into RAMP_DIRS,
 *   when that leads up), or turns stairs already there to climb the next
 *   way that leads up (the editor deletes stairs with erase).
 */
export type MapEdit =
  | { op: 'level'; tx: number; ty: number; size: number; level: number; from?: number }
  | { op: 'erase'; tx: number; ty: number; size: number }
  | { op: 'tile'; tx: number; ty: number; size: number; tile: Tile; mix?: Tile[]; scatter?: number }
  | { op: 'blend'; tx: number; ty: number; size: number; blend: Blend }
  | { op: 'stairs'; tx: number; ty: number; dir?: number };

/**
 * The editor's brush is round, from one tile up to this many across.
 */
export const EDIT_SIZE_MIN = 1;
export const EDIT_SIZE_MAX = 11;

/**
 * Lights the palette lists in their own group.
 */
const LIGHT_TILES: ReadonlySet<Tile> = new Set<Tile>(['lamp', 'lantern', 'torch', 'campfire', 'ghost-lamp', 'soul-fire']);

/**
 * How much of the brush a scattered paint fills, as offered by the editor.
 */
export const EDIT_SCATTER = [1, 0.5, 0.2] as const;

/**
 * Fuel given to lights placed in the editor (or loaded from a preset): far
 * more than any game lasts, so they never burn out.
 */
export const EDITOR_LIGHT_FUEL = 1e9;

/**
 * What the editor can paint, in groups for its palette. An entry with `mix`
 * paints one of those at random on each tile.
 */
export const EDIT_PALETTE: { group: string; tiles: { tile: Tile; label: string; mix?: Tile[] }[] }[] = [
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

/**
 * The tiles a brush of `size` covers around (tx, ty), inside the fence.
 */
export function brushTiles(tx: number, ty: number, size: number, width: number, height: number): [number, number][] {
  const r = brushRadius(size);
  const out: [number, number][] = [];
  for (let y = ty - Math.ceil(r); y <= ty + r; y++) {
    for (let x = tx - Math.ceil(r); x <= tx + r; x++) {
      if (Math.hypot(x - tx, y - ty) <= r && x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        out.push([x, y]);
      }
    }
  }
  return out;
}

/**
 * How far from its middle tile a round brush `size` tiles across reaches,
 * in tiles (a brush of 1 is just the middle tile).
 */
export function brushRadius(size: number): number {
  return (Math.max(EDIT_SIZE_MIN, Math.min(EDIT_SIZE_MAX, Math.round(size))) - 1) / 2 + 0.35;
}
