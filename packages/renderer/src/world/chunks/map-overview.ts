// Packages
import {
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';

// Local Imports
import { ScenePart } from '../scene-part';
import {
  OVERVIEW_BRIGHTEN,
  OVERVIEW_BUILT,
  OVERVIEW_COLORS,
  OVERVIEW_LEVEL_LIFT,
  OVERVIEW_MONSTER,
  OVERVIEW_REPAINT,
} from './config/overview';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { WorldContext } from '../world-context';

/**
 * The whole map as a flat picture, one pixel per tile, drawn instead of
 * the voxel world when the camera is zoomed far out (see `OVERVIEW_TALL`).
 * Zoomed out further still, monsters and players are painted onto it as
 * dots (see `DOTS_TALL`).
 */
export class MapOverview extends ScenePart {
  /**
   * The picture, lying on the ground over the whole map.
   */
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;

  /**
   * The picture's pixels, the map's southern row first.
   */
  private _data = new Uint8Array(4);

  /**
   * Each kind of tile's color, as bytes, worked out once.
   */
  private _colors = new Map<Tile, [number, number, number]>();

  /**
   * Seconds until the next repaint.
   */
  private _wait = 0;

  /**
   * Starts hidden, with no map.
   * @param ctx What every part of the scene shares.
   */
  constructor(ctx: WorldContext) {
    super(ctx);
    this.mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial());
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.visible = false;
  }

  /**
   * Fits the picture to a new map; it's painted when it next shows.
   */
  setMap(): void {
    const w = this._ctx.mapWidth;
    const h = this._ctx.mapHeight;
    this._data = new Uint8Array(w * h * 4);
    const texture = new DataTexture(this._data, w, h, RGBAFormat);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.colorSpace = SRGBColorSpace;
    this.mesh.material.map?.dispose();
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new PlaneGeometry(w, h);
    this._wait = 0;
  }

  /**
   * Shows or hides the picture, repainting it every OVERVIEW_REPAINT
   * seconds while it shows.
   * @param dt Seconds since the last frame.
   * @param show Whether the camera is zoomed out far enough for it.
   * @param dots Whether to paint monsters and players on it.
   * @param players The players.
   * @param monsters The monsters.
   */
  update(dt: number, show: boolean, dots: boolean, players: Iterable<PlayerAvatar>, monsters: Iterable<MonsterAvatar>): void {
    this.mesh.visible = show;
    if (!show || !this.map || !this.mesh.material.map) {
      this._wait = 0;
      return;
    }
    this._wait -= dt;
    if (this._wait > 0) {
      return;
    }
    this._wait = OVERVIEW_REPAINT;
    this.paintTiles();
    if (dots) {
      for (const m of monsters) {
        this.dot(m.target.x, m.target.y, OVERVIEW_MONSTER, 0);
      }
      for (const p of players) {
        if (!p.target.dead) {
          this.dot(p.target.x, p.target.y, p.target.color, 1);
        }
      }
    }
    this.mesh.material.map.needsUpdate = true;
  }

  /**
   * Paints every tile its color, lighter the higher it stands.
   */
  private paintTiles(): void {
    const map = this.map!;
    const w = this._ctx.mapWidth;
    const h = this._ctx.mapHeight;
    for (let ty = 0; ty < h; ty++) {
      const row = (h - 1 - ty) * w;
      for (let tx = 0; tx < w; tx++) {
        const [r, g, b] = this.colorOf(map.get(tx, ty));
        const lift = 1 + map.level(tx, ty) * OVERVIEW_LEVEL_LIFT;
        const i = (row + tx) * 4;
        this._data[i] = Math.min(255, r * lift);
        this._data[i + 1] = Math.min(255, g * lift);
        this._data[i + 2] = Math.min(255, b * lift);
        this._data[i + 3] = 255;
      }
    }
  }

  /**
   * Paints a square dot centered on a point.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param color Its color.
   * @param reach Pixels it spreads each way from the middle.
   */
  private dot(x: number, y: number, color: string, reach: number): void {
    const w = this._ctx.mapWidth;
    const h = this._ctx.mapHeight;
    const rgb = hexBytes(color);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const tx = Math.floor(x) + dx;
        const ty = Math.floor(y) + dy;
        if (tx >= 0 && ty >= 0 && tx < w && ty < h) {
          this._data.set([...rgb, 255], ((h - 1 - ty) * w + tx) * 4);
        }
      }
    }
  }

  /**
   * A tile's color as bytes, brightened since nothing lights the overview.
   * @param tile The tile.
   * @returns Its red, green, and blue.
   */
  private colorOf(tile: Tile): [number, number, number] {
    let rgb = this._colors.get(tile);
    if (!rgb) {
      rgb = hexBytes(OVERVIEW_COLORS[tile] ?? OVERVIEW_BUILT).map((v: number): number => Math.min(255, Math.round(v * OVERVIEW_BRIGHTEN))) as [number, number, number];
      this._colors.set(tile, rgb);
    }
    return rgb;
  }

  /**
   * Frees the picture.
   */
  dispose(): void {
    this.mesh.material.map?.dispose();
    this.mesh.material.dispose();
    this.mesh.geometry.dispose();
  }
}

/**
 * A #rrggbb color's bytes, as they're written (sRGB).
 * @param hex The color.
 * @returns Its red, green, and blue, 0 to 255.
 */
function hexBytes(hex: string): [number, number, number] {
  return [1, 3, 5].map((i: number): number => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}
