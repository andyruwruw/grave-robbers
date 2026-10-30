// Packages
import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';

// Local Imports
import { toWorld } from '../../space/world-coords';
import {
  SEED,
  SEED_FADE,
  SEED_LIFE,
  SPLAT_FADE,
  SPLAT_LIFE,
  SPLAT_LIFT,
  SPLAT_POOL,
} from '../config/gore';

// Types
import type { Group } from 'three';

/**
 * The unit box every splat is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * A spatter of blood lying on the ground.
 */
interface Splat {
  /**
   * The splat's mesh.
   */
  mesh: Mesh;

  /**
   * Its own material, so it fades alone.
   */
  material: MeshLambertMaterial;

  /**
   * Seconds since it landed.
   */
  age: number;

  /**
   * How big it is.
   */
  size: number;

  /**
   * Seconds it stays before fading.
   */
  life: number;

  /**
   * Seconds it takes to fade.
   */
  fade: number;

  /**
   * Its opacity before fading.
   */
  opacity: number;
}

/**
 * Flat splats of blood (and pumpkin seeds) that stain the ground and dry
 * up after a while, from a fixed pool where the oldest is reused.
 */
export class BloodSplats {
  /**
   * The pool of splats.
   */
  private _splats: Splat[] = [];

  /**
   * The pool slot the next splat comes from.
   */
  private _nextSplat = 0;

  /**
   * Fills the pool with hidden splats.
   * @param group Where the splat meshes live.
   * @param _groundHeight Ground height at a tile-space point.
   */
  constructor(group: Group, private _groundHeight: (x: number, y: number) => number) {
    for (let i = 0; i < SPLAT_POOL; i++) {
      const material = new MeshLambertMaterial({ color: '#000000', transparent: true });
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.visible = false;
      mesh.receiveShadow = true;
      group.add(mesh);
      this._splats.push({ mesh, material, age: SPLAT_LIFE + SPLAT_FADE, size: 0, life: SPLAT_LIFE, fade: SPLAT_FADE, opacity: 0 });
    }
  }

  /**
   * Spatters `count` splats around tile-space (x, y), flung mostly along
   * `angle` (or all around when it's null).
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param color The blood's color.
   * @param count How many splats.
   * @param angle Direction they're flung, in radians, or null for all around.
   * @param reach How far they spread, in tiles.
   */
  spatter(x: number, y: number, color: string, count: number, angle: number | null, reach = 0.7): void {
    for (let i = 0; i < count; i++) {
      const splat = this.next();
      const a = angle === null ? Math.random() * Math.PI * 2 : angle + (Math.random() - 0.5) * 1.4;
      const d = Math.random() * reach * (i === 0 ? 0.3 : 1);
      const sx = x + Math.cos(a) * d;
      const sy = y + Math.sin(a) * d;
      const { x: wx, z: wz } = toWorld(sx, sy);
      splat.size = (i === 0 ? 0.42 : 0.14 + Math.random() * 0.22) * (angle === null ? 1 : 0.9);
      splat.mesh.position.set(wx, this._groundHeight(sx, sy) + SPLAT_LIFT + Math.random() * 0.004, wz);
      splat.mesh.rotation.y = -a + (Math.random() - 0.5) * 0.6;
      splat.mesh.scale.set(splat.size * (1.2 + Math.random() * 0.8), 0.01, splat.size);
      splat.material.color.set(color).multiplyScalar(0.75 + Math.random() * 0.4);
      this.show(splat, 1, SPLAT_LIFE, SPLAT_FADE);
    }
  }

  /**
   * Scatters pumpkin seeds around tile-space (x, y) that lie there for a
   * second or two.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param count How many seeds.
   */
  seeds(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const splat = this.next();
      const a = Math.random() * Math.PI * 2;
      const d = 0.1 + Math.random() * 0.7;
      const sx = x + Math.cos(a) * d;
      const sy = y + Math.sin(a) * d;
      const { x: wx, z: wz } = toWorld(sx, sy);
      splat.mesh.position.set(wx, this._groundHeight(sx, sy) + SPLAT_LIFT + 0.01, wz);
      splat.mesh.rotation.y = Math.random() * Math.PI;
      splat.mesh.scale.set(0.07, 0.02, 0.04);
      splat.material.color.set(SEED);
      this.show(splat, 1, SEED_LIFE[0] + Math.random() * (SEED_LIFE[1] - SEED_LIFE[0]), SEED_FADE);
    }
  }

  /**
   * The next splat from the pool (the oldest).
   * @returns The splat.
   */
  private next(): Splat {
    const splat = this._splats[this._nextSplat];
    this._nextSplat = (this._nextSplat + 1) % SPLAT_POOL;
    return splat;
  }

  /**
   * Shows a splat fresh.
   * @param splat The splat.
   * @param opacity Its opacity.
   * @param life Seconds it stays before fading.
   * @param fade Seconds it takes to fade.
   */
  private show(splat: Splat, opacity: number, life: number, fade: number): void {
    splat.material.opacity = opacity;
    splat.opacity = opacity;
    splat.life = life;
    splat.fade = fade;
    splat.mesh.visible = true;
    splat.age = 0;
  }

  /**
   * Dries the splats.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (const splat of this._splats) {
      if (!splat.mesh.visible) {
        continue;
      }
      splat.age += dt;
      if (splat.age > splat.life) {
        const k = Math.min(1, (splat.age - splat.life) / splat.fade);
        splat.material.opacity = splat.opacity * (1 - k);
        splat.mesh.visible = k < 1;
      }
    }
  }

  /**
   * Frees the splat materials.
   */
  dispose(): void {
    this._splats.forEach(({ material }): void => material.dispose());
  }
}
