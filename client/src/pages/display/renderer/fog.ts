// Packages
import {
  Color,
  DataTexture,
  Group,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RGBAFormat,
  ShaderMaterial,
} from 'three';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  seededRandom,
} from '@halloween/shared/world';

// Local Imports
import { LIGHT_RANGE } from './light-map';

// Types
import type { Tile, WorldMap } from '@halloween/shared/world';
import type { LightMap } from './light-map';

/**
 * Simulation grid resolution (cells per tile).
 */
const CELLS_PER_TILE = 3;

/**
 * Seconds for disturbed fog to settle back into its resting shape, and
 * how strongly neighboring cells blend each step.
 */
const SETTLE_TIME = 4;
const DIFFUSION = 0.15;

/**
 * Tiles tall enough that fog can't sit in or flow through them; it pools
 * and wraps around them instead. Low things (gravestones, fences, rocks)
 * let it drift over.
 */
const BLOCKS_FOG: ReadonlySet<Tile> = new Set<Tile>([
  'tree', 'crypt', 'mausoleum', 'ruin', 'statue', 'hedge', 'well', 'tower',
  'wood-wall', 'stone-wall', 'palisade', 'door', 'scarecrow', 'furnace',
  'bloodforge', 'bone-wall',
]);

/**
 * Heights of the fog layers above the ground, and how far each reaches
 * beyond the map so the outskirts are misty too.
 */
const LAYER_HEIGHTS = [0.12, 0.42, 0.78];
const LAYER_SIZE = 220;

/**
 * Peak opacity of one layer, and how many dithered steps its opacity is
 * cut into for the pixel look.
 */
const LAYER_OPACITY = 0.14;
const DITHER_STEPS = 5;

/**
 * Density values are stored divided by this, so thickened fog (ghost
 * trails) has headroom above the resting level.
 */
const DENSITY_RANGE = 1.6;

const FOG_COLOR = new Color('#4a5470');
const BLOOD_FOG_COLOR = new Color('#6e3640');

/**
 * Something that disturbs the fog this frame, at a tile-space point:
 * `push` (per second) shoves it out of the radius and `vx`/`vy` (tiles/s)
 * drag it along (walkers), `burn` thins it (lights), and `add` thickens it
 * (ghosts), each per second.
 */
export interface FogStamp {
  x: number;
  y: number;
  radius: number;
  push?: number;
  vx?: number;
  vy?: number;
  burn?: number;
  add?: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float time;
  uniform float layer;
  uniform float density;
  uniform vec3 fogColor;
  uniform sampler2D densityMap;
  uniform sampler2D lightMap;
  uniform vec3 lightOutside;
  varying vec2 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 3; i++) {
      sum += noise(p) * amp;
      p = p * 2.03 + 17.1;
      amp *= 0.45;
    }
    return sum;
  }

  float bayer(vec2 frag) {
    vec2 p = mod(floor(frag), 4.0);
    float i = p.x + p.y * 4.0;
    return mod(i * 9.0 + floor(i / 4.0) * 6.0, 16.0) / 16.0;
  }

  void main() {
    vec2 p = vWorld * (0.5 - layer * 0.08) + layer * 7.3;
    vec2 creep = vec2(time * 0.012, time * -0.008);
    float detail = smoothstep(0.2, 0.75, fbm(p + creep + 0.5 * vec2(fbm(p * 0.6 - creep), fbm(p * 0.6 + 3.1))));

    vec2 uv = vec2((vWorld.x + ${(MAP_WIDTH / 2).toFixed(1)}) / ${MAP_WIDTH.toFixed(1)}, (vWorld.y + ${(MAP_HEIGHT / 2).toFixed(1)}) / ${MAP_HEIGHT.toFixed(1)});
    bool offMap = any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)));
    float base = offMap
      ? smoothstep(0.3, 0.8, fbm(vWorld * 0.12 + 40.0)) * 0.8
      : texture2D(densityMap, uv).r * ${DENSITY_RANGE.toFixed(2)};
    float fog = base * (0.35 + 0.9 * detail) * (1.0 - layer * 0.18);

    vec3 level = texture2D(lightMap, uv).rgb;
    vec3 light = offMap ? lightOutside : level * level * ${LIGHT_RANGE.toFixed(1)};
    vec3 color = fogColor * (light * 0.5 + 0.02);

    float alpha = clamp(fog * density, 0.0, 1.0);
    alpha = floor(alpha * ${DITHER_STEPS.toFixed(1)} + bayer(gl_FragCoord.xy)) / ${DITHER_STEPS.toFixed(1)} * ${LAYER_OPACITY.toFixed(2)};
    if (alpha <= 0.0) {
      discard;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Smooth value noise over the grid from a seeded lattice, 0..1.
 */
function latticeNoise(rand: () => number, width: number, height: number, cell: number): Float32Array {
  const lw = Math.ceil(width / cell) + 2;
  const lh = Math.ceil(height / cell) + 2;
  const lattice = Float32Array.from({ length: lw * lh }, rand);
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const fx = x / cell;
      const fy = y / cell;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const ux = (fx - ix) * (fx - ix) * (3 - 2 * (fx - ix));
      const uy = (fy - iy) * (fy - iy) * (3 - 2 * (fy - iy));
      const a = lattice[iy * lw + ix];
      const b = lattice[iy * lw + ix + 1];
      const c = lattice[(iy + 1) * lw + ix];
      const d = lattice[(iy + 1) * lw + ix + 1];
      out[y * width + x] = a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
  }
  return out;
}

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
  readonly group = new Group();
  private width = MAP_WIDTH * CELLS_PER_TILE;
  private height = MAP_HEIGHT * CELLS_PER_TILE;
  private density: Float32Array;
  private next: Float32Array;
  private rest: Float32Array;
  private blocked: Uint8Array;
  private vx: Float32Array;
  private vy: Float32Array;
  private data: Uint8Array;
  private texture: DataTexture;
  private materials: ShaderMaterial[] = [];
  private geometry = new PlaneGeometry(LAYER_SIZE, LAYER_SIZE);
  private thickness = 1;
  private blood = 0;
  private day = 0;
  private time = 0;
  private seed: number | null = null;

  constructor(lightMap: LightMap) {
    const size = this.width * this.height;
    this.density = new Float32Array(size);
    this.next = new Float32Array(size);
    this.rest = new Float32Array(size);
    this.blocked = new Uint8Array(size);
    this.vx = new Float32Array(size);
    this.vy = new Float32Array(size);
    this.data = new Uint8Array(size * 4);
    this.texture = new DataTexture(this.data, this.width, this.height, RGBAFormat);
    this.texture.magFilter = LinearFilter;
    this.texture.minFilter = LinearFilter;
    this.texture.needsUpdate = true;
    const { lightMap: lightTexture, lightOutside } = lightMap.uniforms;
    LAYER_HEIGHTS.forEach((height: number, i: number): void => {
      const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          time: { value: 0 },
          layer: { value: i },
          density: { value: 1 },
          fogColor: { value: FOG_COLOR.clone() },
          densityMap: { value: this.texture },
          lightMap: lightTexture,
          lightOutside,
        },
      });
      this.materials.push(material);
      const mesh = new Mesh(this.geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = height;
      mesh.renderOrder = 1;
      this.group.add(mesh);
    });
  }

  /**
   * Learns which cells are inside tall objects. A new seed (a new world)
   * also lays down a fresh resting shape and starts the fog there.
   */
  setMap(map: WorldMap, seed: number): void {
    const { width, height } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.blocked[y * width + x] = BLOCKS_FOG.has(map.get(Math.floor(x / CELLS_PER_TILE), Math.floor(y / CELLS_PER_TILE))) ? 1 : 0;
      }
    }
    if (seed !== this.seed) {
      this.seed = seed;
      const rand = seededRandom(seed ^ 0x5f0a);
      const broad = latticeNoise(rand, width, height, 7 * CELLS_PER_TILE);
      const fine = latticeNoise(rand, width, height, 2.5 * CELLS_PER_TILE);
      for (let i = 0; i < this.rest.length; i++) {
        const n = broad[i] * 0.7 + fine[i] * 0.3;
        this.rest[i] = Math.min(1, Math.max(0, (n - 0.4) / 0.35));
      }
      this.density.set(this.rest);
    }
    for (let i = 0; i < this.density.length; i++) {
      if (this.blocked[i]) {
        this.density[i] = 0;
      }
    }
  }

  /**
   * Overall thickness, 0 (off) to about 2.
   */
  setDensity(thickness: number): void {
    this.thickness = thickness;
    this.group.visible = thickness > 0;
  }

  /**
   * 0..1: under a blood moon the fog thickens and turns red.
   */
  setBloodMoon(amount: number): void {
    this.blood = amount;
  }

  /**
   * 0..1: daylight burns most of the fog off.
   */
  setDay(amount: number): void {
    this.day = amount;
  }

  /**
   * One simulation step: disturbances, flow, blending, settling, then the
   * texture upload.
   */
  update(dt: number, stamps: FogStamp[]): void {
    this.time += dt;
    if (this.seed !== null) {
      this.applyStamps(dt, stamps);
      this.flow(dt);
      this.settle(dt);
      for (let i = 0; i < this.density.length; i++) {
        this.data[i * 4] = Math.round(Math.min(1, this.density[i] / DENSITY_RANGE) * 255);
      }
      this.texture.needsUpdate = true;
    }
    for (const m of this.materials) {
      m.uniforms.time.value = this.time;
      m.uniforms.density.value = this.thickness * (1 + this.blood * 0.6) * (1 - this.day * 0.8);
      (m.uniforms.fogColor.value as Color).copy(FOG_COLOR).lerp(BLOOD_FOG_COLOR, this.blood);
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.texture.dispose();
    this.materials.forEach((m: ShaderMaterial): void => m.dispose());
  }

  /**
   * Applies this frame's disturbances. A push lifts fog out of its radius
   * and piles it in a ring just outside, only on open cells it could reach
   * in a straight line (so it heaps up beside walls instead of entering or
   * jumping them); drag fills the flow field for
   * `flow`; burn and add thin and thicken in place.
   */
  private applyStamps(dt: number, stamps: FogStamp[]): void {
    const { width, height, density, blocked, vx, vy } = this;
    vx.fill(0);
    vy.fill(0);
    for (const s of stamps) {
      const cx = s.x * CELLS_PER_TILE;
      const cy = s.y * CELLS_PER_TILE;
      const r = s.radius * CELLS_PER_TILE;
      const outer = r + (s.push ? CELLS_PER_TILE : 0);
      const ring: number[] = [];
      let lifted = 0;
      const x0 = Math.max(0, Math.floor(cx - outer));
      const x1 = Math.min(width - 1, Math.ceil(cx + outer));
      const y0 = Math.max(0, Math.floor(cy - outer));
      const y1 = Math.min(height - 1, Math.ceil(cy + outer));
      let walled = false;
      for (let y = y0; y <= y1 && !walled; y++) {
        for (let x = x0; x <= x1 && !walled; x++) {
          walled = blocked[y * width + x] === 1;
        }
      }
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * width + x;
          if (blocked[i]) {
            continue;
          }
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
          if (d >= r) {
            if (s.push && d < outer && (!walled || this.reachable(cx, cy, x + 0.5, y + 0.5))) {
              ring.push(i);
            }
            continue;
          }
          const f = 1 - d / r;
          const w = f * f * (3 - 2 * f);
          if (s.push) {
            const take = density[i] * Math.min(1, s.push * w * dt);
            density[i] -= take;
            lifted += take;
          }
          if (s.vx || s.vy) {
            vx[i] += (s.vx ?? 0) * w;
            vy[i] += (s.vy ?? 0) * w;
          }
          if (s.burn) {
            density[i] = Math.max(0, density[i] - s.burn * w * dt);
          }
          if (s.add) {
            density[i] = Math.min(DENSITY_RANGE, density[i] + s.add * w * dt);
          }
        }
      }
      if (ring.length > 0) {
        const share = lifted / ring.length;
        for (const j of ring) {
          density[j] = Math.min(DENSITY_RANGE, density[j] + share);
        }
      }
    }
  }

  /**
   * Whether a straight line between two grid points stays out of tall
   * objects, so pushed fog only lands where it could have drifted to.
   */
  private reachable(x0: number, y0: number, x1: number, y1: number): boolean {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let k = 1; k < steps; k++) {
      const x = Math.floor(x0 + ((x1 - x0) * k) / steps);
      const y = Math.floor(y0 + ((y1 - y0) * k) / steps);
      if (this.blocked[y * this.width + x]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Moves fog along the drag field (semi-Lagrangian: each cell pulls from
   * where its fog came from), never sourcing from inside a tall object, so
   * fog dragged toward a wall slides along it instead of through.
   */
  private flow(dt: number): void {
    const { width, height, density, next, blocked, vx, vy } = this;
    next.set(density);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (blocked[i] || (vx[i] === 0 && vy[i] === 0)) {
          continue;
        }
        const sx = Math.min(width - 1.001, Math.max(0, x - vx[i] * CELLS_PER_TILE * dt));
        const sy = Math.min(height - 1.001, Math.max(0, y - vy[i] * CELLS_PER_TILE * dt));
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const fx = sx - x0;
        const fy = sy - y0;
        let sum = 0;
        let weight = 0;
        for (const [ox, oy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]] as const) {
          const j = (y0 + oy) * width + x0 + ox;
          if (!blocked[j]) {
            sum += density[j] * w;
            weight += w;
          }
        }
        if (weight > 0) {
          next[i] = sum / weight;
        }
      }
    }
    this.density.set(next);
  }

  /**
   * Blends each open cell with its open neighbors (fog spreads around
   * corners, not through walls) and eases it back toward its resting shape.
   */
  private settle(dt: number): void {
    const { width, height, density, next, rest, blocked } = this;
    const ease = 1 - Math.exp(-dt / SETTLE_TIME);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (blocked[i]) {
          next[i] = 0;
          continue;
        }
        let sum = 0;
        let n = 0;
        if (x > 0 && !blocked[i - 1]) {
          sum += density[i - 1];
          n++;
        }
        if (x < width - 1 && !blocked[i + 1]) {
          sum += density[i + 1];
          n++;
        }
        if (y > 0 && !blocked[i - width]) {
          sum += density[i - width];
          n++;
        }
        if (y < height - 1 && !blocked[i + width]) {
          sum += density[i + width];
          n++;
        }
        const mixed = n > 0 ? density[i] + (sum / n - density[i]) * DIFFUSION : density[i];
        next[i] = mixed + (rest[i] - mixed) * ease;
      }
    }
    this.density.set(next);
  }
}
