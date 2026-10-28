// Packages
import {
  Color,
  DataTexture,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  RGBAFormat,
  Vector3,
} from 'three';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
} from '@halloween/shared/world';

// Types
import type {
  Material,
  Object3D,
  WebGLProgramParametersWithUniforms,
} from 'three';

/**
 * Light-map resolution; the low count plus quantized levels gives the light
 * pools hard, pixel-art bands. Levels are spaced on a square-root curve, so
 * the dark end has fine steps (a dim, tinted ambient survives) and bright
 * pool centers have coarse ones.
 */
const TEXELS_PER_TILE = 4;
const LEVELS = 16;

/**
 * Stored values are scaled down by this so lights can brighten past 1.
 */
export const LIGHT_RANGE = 4;
const RANGE = LIGHT_RANGE;

/**
 * Moonlit darkness everywhere no light reaches.
 */
const AMBIENT = [0.12, 0.14, 0.24];

/**
 * Ambient darkness under a blood moon.
 */
const BLOOD_AMBIENT = [0.26, 0.09, 0.12];

/**
 * Ambient light in broad daylight (the Game tab's daytime).
 */
const DAY_AMBIENT = [2.2, 2.15, 1.95];

/**
 * How much of lights' glow daylight washes out.
 */
const DAY_DIM = 0.85;

/**
 * Peak brightness added at a light's center.
 */
const LIGHT_STRENGTH = 3.2;

/**
 * One light source, in tile coordinates.
 */
export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: Color;

  /**
   * 0..1 multiplier (flicker, fuel running out).
   */
  intensity: number;
}

/**
 * The TV's darkness: a small texture covering the map, rebuilt each frame
 * from every light, that patched materials multiply their color by. Replaces
 * per-light PointLights, so any number of torches costs the same to draw.
 * Scenery beyond the map gets the plain ambient darkness.
 */
export class LightMap {
  readonly texture: DataTexture;
  private width = MAP_WIDTH * TEXELS_PER_TILE;
  private height = MAP_HEIGHT * TEXELS_PER_TILE;
  private accum: Float32Array;
  private data: Uint8Array;
  private uniform: { value: DataTexture };
  private outside = { value: new Vector3() };
  private boost = 1;
  private ambient = [...AMBIENT];

  /**
   * How much lights still add in daylight (1 at night).
   */
  private dim = 1;

  constructor() {
    this.accum = new Float32Array(this.width * this.height * 3);
    this.data = new Uint8Array(this.width * this.height * 4);
    this.texture = new DataTexture(this.data, this.width, this.height, RGBAFormat);
    this.texture.magFilter = NearestFilter;
    this.texture.minFilter = NearestFilter;
    this.uniform = { value: this.texture };
  }

  /**
   * Scales every light's strength (vibrance setting).
   */
  setBoost(boost: number): void {
    this.boost = boost;
  }

  /**
   * Blends the ambient darkness toward blood red, then toward daylight,
   * each 0..1.
   */
  setSky(blood: number, day: number): void {
    this.dim = 1 - DAY_DIM * day;
    this.ambient = AMBIENT.map((c: number, i: number): number => {
      const night = c + (BLOOD_AMBIENT[i] - c) * blood;
      return night + (DAY_AMBIENT[i] - night) * day;
    });
  }

  /**
   * Texture level (0..1) stored for light value `v`; the shader squares it
   * back.
   */
  private quantize(v: number): number {
    return Math.round(Math.sqrt(Math.min(v, RANGE) / RANGE) * LEVELS) / LEVELS;
  }

  update(lights: LightSource[]): void {
    const { accum, width, height, ambient } = this;
    for (let i = 0; i < width * height; i++) {
      accum[i * 3] = ambient[0];
      accum[i * 3 + 1] = ambient[1];
      accum[i * 3 + 2] = ambient[2];
    }

    for (const light of lights) {
      const r = light.radius;
      const u0 = Math.max(0, Math.floor((light.x - r) * TEXELS_PER_TILE));
      const u1 = Math.min(width - 1, Math.ceil((light.x + r) * TEXELS_PER_TILE));
      const v0 = Math.max(0, Math.floor((light.y - r) * TEXELS_PER_TILE));
      const v1 = Math.min(height - 1, Math.ceil((light.y + r) * TEXELS_PER_TILE));
      const k = light.intensity * LIGHT_STRENGTH * this.boost * this.dim;
      for (let v = v0; v <= v1; v++) {
        const dy = (v + 0.5) / TEXELS_PER_TILE - light.y;
        for (let u = u0; u <= u1; u++) {
          const dx = (u + 0.5) / TEXELS_PER_TILE - light.x;
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

    const { data } = this;
    for (let i = 0; i < width * height; i++) {
      for (let c = 0; c < 3; c++) {
        data[i * 4 + c] = this.quantize(accum[i * 3 + c]) * 255;
      }
      data[i * 4 + 3] = 255;
    }
    this.texture.needsUpdate = true;
    this.outside.value.set(...ambient.map((c: number): number => this.quantize(c) ** 2 * RANGE) as [number, number, number]);
  }

  /**
   * Patches every lit (Lambert) material under `root`. Glowing Basic
   * materials (jack-o'-lantern faces, flames) are left bright.
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
   */
  apply(material: Material): void {
    material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms): void => {
      shader.uniforms.lightMap = this.uniform;
      shader.uniforms.lightOutside = this.outside;
      shader.vertexShader = `varying vec2 vLightUv;\n${shader.vertexShader.replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 lmPos = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          lmPos = instanceMatrix * lmPos;
        #endif
        lmPos = modelMatrix * lmPos;
        vLightUv = vec2((lmPos.x + ${(MAP_WIDTH / 2).toFixed(1)}) / ${MAP_WIDTH.toFixed(1)}, (lmPos.z + ${(MAP_HEIGHT / 2).toFixed(1)}) / ${MAP_HEIGHT.toFixed(1)});`,
      )}`;
      shader.fragmentShader = `uniform sampler2D lightMap;\nuniform vec3 lightOutside;\nvarying vec2 vLightUv;\n${shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `bool offMap = any(lessThan(vLightUv, vec2(0.0))) || any(greaterThan(vLightUv, vec2(1.0)));
        vec3 lightLevel = texture2D(lightMap, vLightUv).rgb;
        outgoingLight *= offMap ? lightOutside : lightLevel * lightLevel * ${RANGE.toFixed(1)};
        #include <opaque_fragment>`,
      )}`;
    };
  }

  /**
   * The light map texture and the off-map ambient, for custom shaders (the
   * fog) that light themselves the same way. Decode a texel as
   * `level * level * LIGHT_RANGE`.
   */
  get uniforms(): { lightMap: { value: DataTexture }; lightOutside: { value: Vector3 } } {
    return { lightMap: this.uniform, lightOutside: this.outside };
  }

  dispose(): void {
    this.texture.dispose();
  }
}
