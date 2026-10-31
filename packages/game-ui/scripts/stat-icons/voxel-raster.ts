// Types
import type { Voxel } from './types';

/**
 * Three numbers: a point or a direction.
 */
type Vec = [number, number, number];

/**
 * Where the camera looks from, matching the TV's item icons (`VIEW` in
 * the renderer's icon config).
 */
const VIEW: Vec = norm([0.9, 1.1, 1.6]);

/**
 * Toward the sun, matching the item icons' light.
 */
const SUN: Vec = norm([-1, 3, 2]);

/**
 * Light all around and the sun's strength: less fill than the item icons
 * use, so faces turned away from the sun, and shadows, read darker.
 */
const AMBIENT = 0.6;
const SUN_POWER = 2.9;

/**
 * How much of the sun reaches a face something else is shading.
 */
const IN_SHADOW = 0.15;

/**
 * How much shading still shows on glowing boxes, so they keep their shape.
 */
const GLOW_SHADE = 0.35;

/**
 * How dark the soft drop shadow below and right of the model is (alpha).
 */
const DROP_SHADOW = 150;

/**
 * How far the model is turned about straight up, as the hearts are.
 */
const TURN = -0.35;

/**
 * Draws boxes from the item icons' camera into RGBA pixels, by casting a
 * straight ray through each pixel, lit the way three.js lights them (so
 * they match the icons drawn live), framed to fill the square.
 */
export class VoxelRaster {
  /**
   * Makes a raster of a fixed size.
   * @param _px Width and height in pixels.
   */
  constructor(private readonly _px: number) {}

  /**
   * Draws the boxes.
   * @param voxels The boxes.
   * @returns RGBA pixels, row by row from the top.
   */
  draw(voxels: Voxel[]): Uint8Array {
    const px = this._px;
    const out = new Uint8Array(px * px * 4);
    const right = norm(cross([0, 1, 0], VIEW));
    const up = cross(VIEW, right);
    const c = Math.cos(-TURN);
    const s = Math.sin(-TURN);
    const unturn = (v: Vec): Vec => [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
    const turn = (v: Vec): Vec => [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    for (const v of voxels) {
      for (let i = 0; i < 8; i++) {
        const p = turn([
          v.pos[0] + (i & 1 ? 0.5 : -0.5) * v.size[0],
          v.pos[1] + (i & 2 ? 0.5 : -0.5) * v.size[1],
          v.pos[2] + (i & 4 ? 0.5 : -0.5) * v.size[2],
        ]);
        minU = Math.min(minU, dot(p, right));
        maxU = Math.max(maxU, dot(p, right));
        minV = Math.min(minV, dot(p, up));
        maxV = Math.max(maxV, dot(p, up));
      }
    }
    const half = Math.max(maxU - minU, maxV - minV) / 2;
    const cu = (minU + maxU) / 2;
    const cv = (minV + maxV) / 2;
    const dir = unturn(scale(VIEW, -1));
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const u = cu + ((x + 0.5) / px * 2 - 1) * half;
        const v = cv - ((y + 0.5) / px * 2 - 1) * half;
        const origin = unturn(add(add(scale(right, u), scale(up, v)), scale(VIEW, 50)));
        const hit = this.cast(origin, dir, voxels);
        if (hit) {
          const at = add(add(origin, scale(dir, hit.t)), scale(hit.normal, 1e-4));
          const shaded = !!this.cast(at, unturn(SUN), voxels);
          out.set([...shade(hit.voxel, turn(hit.normal), shaded), 255], (y * px + x) * 4);
        }
      }
    }
    return this.dropShadow(out);
  }

  /**
   * Adds a soft shadow under the model: empty pixels just below and right
   * of a drawn one go dark and see-through.
   * @param pixels The drawn pixels.
   * @returns The same pixels, shadowed.
   */
  private dropShadow(pixels: Uint8Array): Uint8Array {
    const px = this._px;
    const step = Math.max(1, Math.round(px / 40));
    const out = pixels.slice();
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const i = (y * px + x) * 4;
        const from = ((y - step) * px + (x - step)) * 4;
        if (pixels[i + 3] === 0 && x >= step && y >= step && pixels[from + 3] === 255) {
          out.set([0, 0, 0, DROP_SHADOW], i);
        }
      }
    }
    return out;
  }

  /**
   * The nearest box a ray hits, the face it hits, and how far along.
   * @param o Where the ray starts.
   * @param d Which way it goes.
   * @param voxels The boxes.
   * @returns The box, the face's normal, and the distance, or null for a miss.
   */
  private cast(o: Vec, d: Vec, voxels: Voxel[]): { voxel: Voxel; normal: Vec; t: number } | null {
    let best = Infinity;
    let found: { voxel: Voxel; normal: Vec; t: number } | null = null;
    for (const voxel of voxels) {
      let near = -Infinity;
      let far = Infinity;
      let axis = 0;
      let missed = false;
      for (let a = 0; a < 3; a++) {
        const lo = voxel.pos[a] - voxel.size[a] / 2;
        const hi = voxel.pos[a] + voxel.size[a] / 2;
        if (Math.abs(d[a]) < 1e-9) {
          if (o[a] < lo || o[a] > hi) {
            missed = true;
            break;
          }
          continue;
        }
        const t1 = (lo - o[a]) / d[a];
        const t2 = (hi - o[a]) / d[a];
        if (Math.min(t1, t2) > near) {
          near = Math.min(t1, t2);
          axis = a;
        }
        far = Math.min(far, Math.max(t1, t2));
      }
      if (!missed && near <= far && far > 0 && near < best) {
        best = near;
        const normal: Vec = [0, 0, 0];
        normal[axis] = d[axis] > 0 ? -1 : 1;
        found = { voxel, normal, t: near };
      }
    }
    return found;
  }
}

/**
 * A lit face's color: glowing boxes take only a little shading, and a face something
 * else stands between it and the sun gets only a little sun.
 * @param voxel The box.
 * @param normal Which way the face points, in the world.
 * @param shaded Whether something shades it from the sun.
 * @returns Its red, green, and blue.
 */
function shade(voxel: Voxel, normal: Vec, shaded: boolean): Vec {
  const rgb = [1, 3, 5].map((i: number): number => parseInt(voxel.color.slice(i, i + 2), 16) / 255) as Vec;
  const light = AMBIENT + SUN_POWER * Math.max(0, dot(normal, SUN)) * (shaded ? IN_SHADOW : 1);
  return rgb.map((x: number): number => {
    const lit = Math.min(1, (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4) * light / Math.PI);
    const shown = lit <= 0.0031308 ? lit * 12.92 : 1.055 * lit ** (1 / 2.4) - 0.055;
    return Math.round((voxel.glow ? x * (1 - GLOW_SHADE) + shown * GLOW_SHADE : shown) * 255);
  }) as Vec;
}

/**
 * Adds two vectors.
 * @param a One.
 * @param b The other.
 * @returns The sum.
 */
function add(a: Vec, b: Vec): Vec {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Scales a vector.
 * @param a The vector.
 * @param k By how much.
 * @returns The scaled vector.
 */
function scale(a: Vec, k: number): Vec {
  return [a[0] * k, a[1] * k, a[2] * k];
}

/**
 * The dot product.
 * @param a One.
 * @param b The other.
 * @returns a . b.
 */
function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * The cross product.
 * @param a One.
 * @param b The other.
 * @returns a x b.
 */
function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * A vector made one long.
 * @param a The vector.
 * @returns The unit vector.
 */
function norm(a: Vec): Vec {
  return scale(a, 1 / Math.hypot(...a));
}
