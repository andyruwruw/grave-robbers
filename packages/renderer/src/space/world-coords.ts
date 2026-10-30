// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

/**
 * The size of the map being drawn, which `toWorld` centers on the origin
 * (set by the renderer when a world arrives).
 */
let mapWidth = MAP_WIDTH;

/**
 * The height of the map being drawn (see `mapWidth`).
 */
let mapHeight = MAP_HEIGHT;

/**
 * Sets the size of the map being drawn, which `toWorld` centers on.
 * @param width The map's width, in tiles.
 * @param height The map's height, in tiles.
 */
export function setMapSize(width: number, height: number): void {
  mapWidth = width;
  mapHeight = height;
}

/**
 * Converts tile-space coordinates (x east, y south) to world space, with the
 * map centered on the origin and the ground top at y = 0.
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @returns The world-space x and z.
 */
export function toWorld(x: number, y: number): { x: number; z: number } {
  return { x: x - mapWidth / 2, z: y - mapHeight / 2 };
}
