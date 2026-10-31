// Packages
import {
  DataTexture,
  Group,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RGBAFormat,
  ShaderMaterial,
  Vector4,
} from 'three';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import {
  CELLS_PER_TILE,
  FOG_COLOR,
  LAYER_HEIGHTS,
  LAYER_SIZE,
  SIM_MAX_TILES,
} from './config/fog';
import { FogGrid } from './fog-grid';
import { FOG_FRAGMENT_SHADER, FOG_VERTEX_SHADER } from './fog-shaders';

// Types
import type { Color } from 'three';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { FogStamp } from '../../types/effects';
import type { LightMap } from '../light-map';

/**
 * Ground fog that sits mostly still and behaves like a substance. A density
 * grid over the map settles toward a resting shape (seeded per world: banks
 * and clear patches), never enters tall objects (trees, walls, buildings),
 * and flows around them. Players and walking monsters push it aside and
 * drag it along, leaving wakes that fill back in; lights thin it; ghosts
 * thicken it. Three stacked sheets render it, lit by the light map (warm
 * glow near torches, dim blue in moonlight) and dithered into a few opacity
 * steps for the pixel look; only their fine texture creeps, very slowly.
 */
export class Fog {
  /**
   * The fog sheets.
   */
  readonly group = new Group();

  /**
   * The density simulation.
   */
  private _grid = new FogGrid();

  /**
   * The density texture the shaders sample, over the grid's `data`.
   */
  private _texture = new DataTexture(new Uint8Array(4), 1, 1, RGBAFormat);

  /**
   * Whether this map's fog is simulated, and the simulated grid's place in
   * world space for the shader: (corner x, corner z, width, depth).
   */
  private _simulated = { value: 1 };

  /**
   * The shader uniform of the grid's place in world space (see
   * `_simulated`).
   */
  private _densityWindow = { value: new Vector4() };

  /**
   * The shader uniform holding the density texture.
   */
  private _densityMap = { value: this._texture };

  /**
   * One material per sheet.
   */
  private _materials: ShaderMaterial[] = [];

  /**
   * The plane every sheet shares.
   */
  private _geometry = new PlaneGeometry(LAYER_SIZE, LAYER_SIZE);

  /**
   * Overall thickness, 0 (off) to about 2.
   */
  private _thickness = 1;

  /**
   * A world event's fog color, or null.
   */
  private _tint: Color | null = null;

  /**
   * How far toward the tint, 0..1.
   */
  private _tintAmount = 0;

  /**
   * How much thicker the tint makes it at full strength.
   */
  private _thicken = 0;

  /**
   * How bright day it is, 0..1.
   */
  private _day = 0;

  /**
   * What the fog's color is multiplied by: under 1 darker, over 1 lighter.
   */
  private _shade = 1;

  /**
   * Seconds of fog animation so far.
   */
  private _time = 0;

  /**
   * Builds the sheets, lit by the light map.
   * @param lightMap The TV's light map.
   */
  constructor(lightMap: LightMap) {
    this.resize(MAP_WIDTH, MAP_HEIGHT);
    const { lightMap: lightTexture, lightOutside, lightWindow } = lightMap.uniforms;
    LAYER_HEIGHTS.forEach((height: number, i: number): void => {
      const material = new ShaderMaterial({
        vertexShader: FOG_VERTEX_SHADER,
        fragmentShader: FOG_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        uniforms: {
          time: { value: 0 },
          layer: { value: i },
          density: { value: 1 },
          fogColor: { value: FOG_COLOR.clone() },
          densityMap: this._densityMap,
          densityWindow: this._densityWindow,
          simulated: this._simulated,
          lightMap: lightTexture,
          lightOutside,
          lightWindow,
        },
      });
      this._materials.push(material);
      const mesh = new Mesh(this._geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = height;
      mesh.renderOrder = 1;
      this.group.add(mesh);
    });
  }

  /**
   * Learns which cells are inside tall objects. A new seed (a new world)
   * also lays down a fresh resting shape and starts the fog there.
   * @param map The world map.
   * @param seed The world's seed.
   */
  setMap(map: WorldMap, seed: number): void {
    if (this._simulated.value === 0) {
      return;
    }
    this._grid.setMap(map, seed);
  }

  /**
   * Fits the fog to a map of this size: a simulated grid over the whole
   * map up to SIM_MAX_TILES, else procedural fog everywhere. A new size
   * starts the fog over at the next `setMap`.
   * @param mapW The map's width, in tiles.
   * @param mapH The map's height, in tiles.
   */
  resize(mapW: number, mapH: number): void {
    const simulated = mapW * mapH <= SIM_MAX_TILES;
    this._simulated.value = simulated ? 1 : 0;
    this._densityWindow.value.set(-mapW / 2, -mapH / 2, mapW, mapH);
    const width = simulated ? mapW * CELLS_PER_TILE : 1;
    const height = simulated ? mapH * CELLS_PER_TILE : 1;
    if (!this._grid.resize(width, height)) {
      return;
    }
    this._texture.dispose();
    this._texture = new DataTexture(this._grid.data, width, height, RGBAFormat);
    this._texture.magFilter = LinearFilter;
    this._texture.minFilter = LinearFilter;
    this._texture.needsUpdate = true;
    this._densityMap.value = this._texture;
  }

  /**
   * Centers the fog layers on world point (x, z), so on a big map they
   * always cover what the camera sees.
   * @param x World-space x.
   * @param z World-space z.
   */
  setCenter(x: number, z: number): void {
    this.group.position.x = x;
    this.group.position.z = z;
  }

  /**
   * Overall thickness, 0 (off) to about 2.
   * @param thickness The thickness.
   */
  setDensity(thickness: number): void {
    this._thickness = thickness;
    this.group.visible = thickness > 0;
  }

  /**
   * A world event tints the fog and thickens it.
   * @param tint The fog's color at full strength, or null.
   * @param amount How far toward it, 0..1.
   * @param thicken How much thicker at full strength (0.6: 60%).
   */
  setTint(tint: Color | null, amount: number, thicken: number): void {
    this._tint = tint;
    this._tintAmount = amount;
    this._thicken = thicken;
  }

  /**
   * Darkens (under 1) or lightens (over 1) the fog's color.
   * @param shade The multiplier, 1 as drawn.
   */
  setShade(shade: number): void {
    this._shade = shade;
  }

  /**
   * 0..1: daylight burns most of the fog off.
   * @param amount How bright day it is, 0..1.
   */
  setDay(amount: number): void {
    this._day = amount;
  }

  /**
   * One simulation step: disturbances, flow, blending, settling, then the
   * texture upload.
   * @param dt Seconds since the last frame.
   * @param stamps This frame's disturbances.
   */
  update(dt: number, stamps: FogStamp[]): void {
    this._time += dt;
    if (this._grid.seed !== null && this._simulated.value === 1) {
      this._grid.step(dt, stamps);
      this._grid.writeTexture();
      this._texture.needsUpdate = true;
    }
    for (const m of this._materials) {
      m.uniforms.time.value = this._time;
      m.uniforms.density.value = this._thickness * (1 + this._tintAmount * this._thicken) * (1 - this._day * 0.8);
      (m.uniforms.fogColor.value as Color).copy(FOG_COLOR).lerp(this._tint ?? FOG_COLOR, this._tintAmount).multiplyScalar(this._shade);
    }
  }

  /**
   * Frees the sheets and the density texture.
   */
  dispose(): void {
    this._geometry.dispose();
    this._texture.dispose();
    this._materials.forEach((m: ShaderMaterial): void => m.dispose());
  }
}
