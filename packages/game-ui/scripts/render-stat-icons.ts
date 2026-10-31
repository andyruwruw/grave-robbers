// Packages
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Local Imports
import { STAT_COLORS, STAT_ICONS } from '../src/config/stat-icons';
import { encodePng } from './stat-icons/png';
import { STAT_ART } from './stat-icons/stat-art';
import { TRAIT_ART } from './stat-icons/trait-art';
import { VoxelRaster } from './stat-icons/voxel-raster';

// Types
import type { StatColor } from '../src/types/stat-icons';
import type { PixelArt, Voxel } from './stat-icons/types';

/**
 * Renders the item details' stat and trait icons and stat bar blocks to
 * PNGs once, so the phone just shows images. Run it after changing any of
 * the art: `npx tsx packages/game-ui/scripts/render-stat-icons.ts`.
 */

/**
 * Pixels per side of each image.
 */
const PX = 40;

/**
 * One pixel of the art, in model units, and how deep its edge pixels are
 * pushed out.
 */
const CELL = 0.1;
const DEPTH = 0.12;

/**
 * How much further out each step in from the edge stands, and the most
 * steps, so the art bulges toward its middle and the steps shade.
 */
const RISE = 0.07;
const MOST_STEPS = 2;

/**
 * Each stat bar color.
 */
const BLOCK_COLORS: Record<StatColor, string> = {
  red: '#e5484d',
  yellow: '#f5c62e',
  blue: '#4fb6e0',
  sky: '#a9c4dc',
  green: '#7ddc4a',
  brown: '#c8955a',
  tan: '#d9c39a',
  blood: '#b0141e',
  ecto: '#9dffc8',
  sun: '#ffd166',
  orange: '#ea6a1f',
  steel: '#a4a4ac',
};

/**
 * An empty block.
 */
const EMPTY = '#2a2a30';

/**
 * How far toward white a block's top edge is lit.
 */
const SHINE = 0.45;

/**
 * Where the images go.
 */
const OUT = fileURLToPath(new URL('../src/assets/stat-icons/', import.meta.url));

/**
 * How many pixels in from the art's edge a pixel is (1 on the edge), up to
 * one more than MOST_STEPS.
 * @param art The art.
 * @param r The pixel's row.
 * @param x The pixel's column.
 * @returns Its steps in.
 */
function stepsIn(art: PixelArt, r: number, x: number): number {
  const filled = (rr: number, xx: number): boolean => (art.rows[rr]?.[xx] ?? '.') !== '.';
  for (let d = 1; d <= MOST_STEPS; d++) {
    for (let dy = -d; dy <= d; dy++) {
      for (let dx = -d; dx <= d; dx++) {
        if (!filled(r + dy, x + dx)) {
          return d;
        }
      }
    }
  }
  return MOST_STEPS + 1;
}

/**
 * Pixel art pushed out into voxels, centered on the origin, with a flat
 * back and a front that steps up toward the middle.
 * @param art The art.
 * @returns The voxels.
 */
function extrude(art: PixelArt): Voxel[] {
  const h = art.rows.length;
  const w = Math.max(...art.rows.map((r: string): number => r.length));
  return art.rows.flatMap((row: string, r: number): Voxel[] => [...row].flatMap((c: string, x: number): Voxel[] => {
    if (c === '.') {
      return [];
    }
    const depth = DEPTH + (stepsIn(art, r, x) - 1) * RISE;
    return [{ pos: [(x - (w - 1) / 2) * CELL, ((h - 1) / 2 - r) * CELL, depth / 2], size: [CELL, CELL, depth], color: art.colors[c], glow: art.glow?.includes(c) }];
  }));
}

/**
 * A color moved toward white.
 * @param hex The color.
 * @param k How far, 0 to 1.
 * @returns The lighter color.
 */
function lighten(hex: string, k: number): string {
  return `#${[1, 3, 5].map((i: number): string => {
    const v = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * k).toString(16).padStart(2, '0');
  }).join('')}`;
}

/**
 * One stat bar block: a chunky cube with a lit top edge, or a dark one.
 * @param color Its color, or null when empty.
 * @returns The voxels.
 */
function block(color: string | null): Voxel[] {
  if (!color) {
    return [{ pos: [0, 0, 0], size: [0.3, 0.3, 0.3], color: EMPTY }];
  }
  return [
    { pos: [0, -0.03, 0], size: [0.3, 0.24, 0.3], color },
    { pos: [0, 0.12, 0], size: [0.3, 0.06, 0.3], color: lighten(color, SHINE) },
  ];
}

const raster = new VoxelRaster(PX);
mkdirSync(OUT, { recursive: true });
const art: Record<string, PixelArt> = { ...STAT_ART, ...TRAIT_ART };
for (const id of STAT_ICONS) {
  if (!art[id]) {
    throw new Error(`No art for the ${id} icon`);
  }
  writeFileSync(`${OUT}${id}.png`, encodePng(raster.draw(extrude(art[id])), PX));
}
for (const color of STAT_COLORS) {
  writeFileSync(`${OUT}block-${color}.png`, encodePng(raster.draw(block(BLOCK_COLORS[color])), PX));
}
writeFileSync(`${OUT}block-empty.png`, encodePng(raster.draw(block(null)), PX));
console.log(`Wrote ${STAT_ICONS.length + STAT_COLORS.length + 1} images to ${OUT}`);
