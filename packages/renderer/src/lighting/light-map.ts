// Packages
import {
  DataTexture,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  RGBAFormat,
  Vector3,
  Vector4,
} from 'three';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import {
  AMBIENT,
  BLOOD_AMBIENT,
  DAY_AMBIENT,
  DAY_DIM,
  LEVELS,
  LIGHT_RANGE,
  LIGHT_STRENGTH,
  TEXELS_PER_TILE,
  WINDOW_TILES_H,
  WINDOW_TILES_W,
} from './config/light-map';
import { patchLightShader } from './helpers/light-shader';

// Types
import type {
  Material,
  Object3D,
} from 'three';
import type { LightSource, LightUniforms } from '../types/effects';

/**
 * The TV's darkness: a small texture covering the map (or a window of it
 * around the camera on a big map), rebuilt each frame
 * from every light, that patched materials multiply their color by. Replaces
 * per-light PointLights, so any number of torches costs the same to draw.
 * Scenery beyond the map gets the plain ambient darkness.
 */
export class LightMap {
  /**
   * The light texture the shaders sample.
   */
  private _texture: DataTexture;

  /**
   * The texture's width, in texels.
   */
  private _width = 0;

  /**
   * The texture's height, in texels.
   */
  private _height = 0;

  /**
   * Light added up per texel (rgb), before quantizing.
   */
  private _accum = new Float32Array(0);

  /**
   * The texture's bytes (rgba).
   */
  private _data = new Uint8Array(0);

  /**
   * The shader uniform holding the texture, shared by every patched
   * material.
   */
  private _uniform: { value: DataTexture };

  /**
   * The map's size, the window of tiles the texture covers (its corner,
   * `_originX`/`_originY`, in tiles), and that window in world space for the
   * shaders: (corner x, corner z, width, depth).
   */
  private _mapW = MAP_WIDTH;

  /**
   * The map's height, in tiles (see `_mapW`).
   */
  private _mapH = MAP_HEIGHT;

  /**
   * Tiles across the window.
   */
  private _tilesW = 0;

  /**
   * Tiles down the window.
   */
  private _tilesH = 0;

  /**
   * The window's left tile.
   */
  private _originX = 0;

  /**
   * The window's top tile.
   */
  private _originY = 0;

  /**
   * The shader uniform of the window in world space.
   */
  private _window = { value: new Vector4() };

  /**
   * The shader uniform of the light off the window (plain ambient).
   */
  private _outside = { value: new Vector3() };

  /**
   * What every light's strength is scaled by.
   */
  private _boost = 1;

  /**
   * The current ambient darkness (rgb).
   */
  private _ambient = [...AMBIENT];

  /**
   * How much lights still add in daylight (1 at night).
   */
  private _dim = 1;

  /**
   * Starts with a texture fitted to a default-size map.
   */
  constructor() {
    this._texture = new DataTexture(new Uint8Array(4), 1, 1, RGBAFormat);
    this._uniform = { value: this._texture };
    this.resize(MAP_WIDTH, MAP_HEIGHT);
  }

  /**
   * Fits the light map to a map of this size: the whole map when it's no
   * bigger than the window, else a window that `setCenter` moves.
   * @param mapW The map's width, in tiles.
   * @param mapH The map's height, in tiles.
   */
  resize(mapW: number, mapH: number): void {
    this._mapW = mapW;
    this._mapH = mapH;
    const tilesW = Math.min(mapW, WINDOW_TILES_W);
    const tilesH = Math.min(mapH, WINDOW_TILES_H);
    if (tilesW !== this._tilesW || tilesH !== this._tilesH) {
      this._tilesW = tilesW;
      this._tilesH = tilesH;
      this._width = tilesW * TEXELS_PER_TILE;
      this._height = tilesH * TEXELS_PER_TILE;
      this._accum = new Float32Array(this._width * this._height * 3);
      this._data = new Uint8Array(this._width * this._height * 4);
      this._texture.dispose();
      this._texture = new DataTexture(this._data, this._width, this._height, RGBAFormat);
      this._texture.magFilter = NearestFilter;
      this._texture.minFilter = NearestFilter;
      this._uniform.value = this._texture;
    }
    this.setCenter(mapW / 2, mapH / 2);
  }

  /**
   * Moves the window to center on tile (x, y), kept on the map.
   * @param x Tile-space x.
   * @param y Tile-space y.
   */
  setCenter(x: number, y: number): void {
    this._originX = Math.max(0, Math.min(this._mapW - this._tilesW, Math.floor(x - this._tilesW / 2)));
    this._originY = Math.max(0, Math.min(this._mapH - this._tilesH, Math.floor(y - this._tilesH / 2)));
    this._window.value.set(this._originX - this._mapW / 2, this._originY - this._mapH / 2, this._tilesW, this._tilesH);
  }

  /**
   * Scales every light's strength (vibrance setting).
   * @param boost What every light's strength is scaled by.
   */
  setBoost(boost: number): void {
    this._boost = boost;
  }

  /**
   * Blends the ambient darkness toward blood red, then toward daylight,
   * each 0..1.
   * @param blood How blood red, 0..1.
   * @param day How bright day it is, 0..1.
   */
  setSky(blood: number, day: number): void {
    this._dim = 1 - DAY_DIM * day;
    this._ambient = AMBIENT.map((c: number, i: number): number => {
      const night = c + (BLOOD_AMBIENT[i] - c) * blood;
      return night + (DAY_AMBIENT[i] - night) * day;
    });
  }

  /**
   * Texture level (0..1) stored for light value `v`; the shader squares it
   * back.
   * @param v The light value.
   * @returns The stored level.
   */
  private quantize(v: number): number {
    return Math.round(Math.sqrt(Math.min(v, LIGHT_RANGE) / LIGHT_RANGE) * LEVELS) / LEVELS;
  }

  /**
   * Rebuilds the texture from every light this frame.
   * @param lights Every light source.
   */
  update(lights: LightSource[]): void {
    const { _accum: accum, _width: width, _height: height, _ambient: ambient } = this;
    for (let i = 0; i < width * height; i++) {
      accum[i * 3] = ambient[0];
      accum[i * 3 + 1] = ambient[1];
      accum[i * 3 + 2] = ambient[2];
    }

    for (const light of lights) {
      const r = light.radius;
      const lx = light.x - this._originX;
      const ly = light.y - this._originY;
      const u0 = Math.max(0, Math.floor((lx - r) * TEXELS_PER_TILE));
      const u1 = Math.min(width - 1, Math.ceil((lx + r) * TEXELS_PER_TILE));
      const v0 = Math.max(0, Math.floor((ly - r) * TEXELS_PER_TILE));
      const v1 = Math.min(height - 1, Math.ceil((ly + r) * TEXELS_PER_TILE));
      const k = light.intensity * LIGHT_STRENGTH * this._boost * this._dim;
      for (let v = v0; v <= v1; v++) {
        const dy = (v + 0.5) / TEXELS_PER_TILE - ly;
        for (let u = u0; u <= u1; u++) {
          const dx = (u + 0.5) / TEXELS_PER_TILE - lx;
          const f = 1 - Math.hypot(dx, dy) / r;
          if (f <= 0) {
            continue;
          }
          const w = f * f * (3 - 2 * f) * k;
          const i = (v * width + u) * 3;
          accum[i] += light.color.r * w;
          accum[i + 1] += light.color.g * w;
          accum[i + 2] += light.color.b * w;
        }
      }
    }

    const { _data: data } = this;
    for (let i = 0; i < width * height; i++) {
      for (let c = 0; c < 3; c++) {
        data[i * 4 + c] = this.quantize(accum[i * 3 + c]) * 255;
      }
      data[i * 4 + 3] = 255;
    }
    this._texture.needsUpdate = true;
    this._outside.value.set(...ambient.map((c: number): number => this.quantize(c) ** 2 * LIGHT_RANGE) as [number, number, number]);
  }

  /**
   * Patches every lit (Lambert) material under `root`. Glowing Basic
   * materials (jack-o'-lantern faces, flames) are left bright.
   * @param root The group to patch.
   */
  darken(root: Object3D): void {
    root.traverse((obj: Object3D): void => {
      if (obj instanceof Mesh && obj.material instanceof MeshLambertMaterial && !obj.material.userData.darkened) {
        obj.material.userData.darkened = true;
        this.apply(obj.material);
      }
    });
  }

  /**
   * Makes a Lambert or Basic material darken by the light map at each
   * fragment's ground position.
   * @param material The material to patch.
   */
  apply(material: Material): void {
    patchLightShader(material, this.uniforms);
  }

  /**
   * The light map texture and the off-map ambient, for custom shaders (the
   * fog) that light themselves the same way. Decode a texel as
   * `level * level * LIGHT_RANGE`.
   * @returns The shared uniforms.
   */
  get uniforms(): LightUniforms {
    return { lightMap: this._uniform, lightOutside: this._outside, lightWindow: this._window };
  }

  /**
   * Frees the light texture.
   */
  dispose(): void {
    this._texture.dispose();
  }
}
