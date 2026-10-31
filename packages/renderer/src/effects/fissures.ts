// Packages
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { toWorld } from '../space/world-coords';
import {
  FISSURE_COLORS,
  FISSURE_LIFE,
  FISSURE_POOL,
  FISSURE_RUN,
  FISSURE_STEP,
} from './config/infusion-layers';
import { EffectLayer } from './effect-layer';

/**
 * One fissure: its zigzag boxes in order from where it starts.
 */
interface Crack {
  /**
   * Its boxes, crack then seam for each zigzag.
   */
  boxes: Mesh[];

  /**
   * How wide each box opens, by box.
   */
  widths: number[];

  /**
   * Seconds since it cracked.
   */
  age: number;
}

/**
 * Seconds a fissure takes to close up at the end of its life.
 */
const CLOSE_TIME = 0.6;

/**
 * Earthshaker fissures: a jagged dark crack running out along the ground
 * with a hot seam glowing in it, opening from the near end to the far one
 * and closing up again, from a fixed pool of boxes.
 */
export class Fissures extends EffectLayer {
  /**
   * The pool of boxes.
   */
  private _pool: Mesh[] = [];

  /**
   * Fissures open now.
   */
  private _cracks: Crack[] = [];

  /**
   * The dark crack's material.
   */
  private _crack = new MeshBasicMaterial({ color: FISSURE_COLORS.crack });

  /**
   * The glowing seam's material.
   */
  private _seam = new MeshBasicMaterial({ color: FISSURE_COLORS.seam });

  /**
   * The unit box every box shares.
   */
  private _box = new BoxGeometry(1, 1, 1);

  /**
   * Fills the pool with hidden boxes.
   */
  constructor() {
    super();
    for (let i = 0; i < FISSURE_POOL; i++) {
      const mesh = new Mesh(this._box, this._crack);
      mesh.visible = false;
      this.group.add(mesh);
      this._pool.push(mesh);
    }
  }

  /**
   * Cracks a fissure from a tile-space point along the ground (dropped
   * when the pool is spent).
   * @param x Tile-space x it starts at.
   * @param y Tile-space y it starts at.
   * @param angle Which way it runs, a tile-space angle.
   * @param length How far it runs, in tiles.
   * @param ground Ground height at a tile-space point.
   */
  crack(x: number, y: number, angle: number, length: number, ground: (x: number, y: number) => number): void {
    const steps = Math.max(2, Math.round(length / FISSURE_STEP));
    const free = this._pool.filter((m: Mesh): boolean => !m.visible && !this._cracks.some((c: Crack): boolean => c.boxes.includes(m)));
    if (free.length < steps * 2) {
      return;
    }
    const boxes = free.slice(0, steps * 2);
    const widths: number[] = [];
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let side = 0;
    for (let i = 0; i < steps; i++) {
      const nextSide = i === steps - 1 ? 0 : (i % 2 ? 1 : -1) * (0.05 + Math.random() * 0.08);
      const ax = x + dx * i * FISSURE_STEP - dy * side;
      const ay = y + dy * i * FISSURE_STEP + dx * side;
      const bx = x + dx * (i + 1) * FISSURE_STEP - dy * nextSide;
      const by = y + dy * (i + 1) * FISSURE_STEP + dx * nextSide;
      const mid = toWorld((ax + bx) / 2, (ay + by) / 2);
      const height = ground((ax + bx) / 2, (ay + by) / 2);
      const width = 0.16 * (1 - (i / steps) * 0.6);
      for (const [box, seam] of [[boxes[i * 2], false], [boxes[i * 2 + 1], true]] as const) {
        box.material = seam ? this._seam : this._crack;
        box.position.set(mid.x, height + (seam ? 0.022 : 0.015), mid.z);
        box.rotation.set(0, -Math.atan2(by - ay, bx - ax), 0);
        box.scale.set(Math.hypot(bx - ax, by - ay) + 0.04, 0.02, 0.0001);
        widths.push(seam ? width * 0.35 : width);
      }
      side = nextSide;
    }
    this._cracks.push({ boxes, widths, age: 0 });
  }

  /**
   * Runs each fissure out, closes it at the end of its life, and frees it.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (const crack of this._cracks) {
      crack.age += dt;
      const close = Math.min(1, Math.max(0, (FISSURE_LIFE - crack.age) / CLOSE_TIME));
      const steps = crack.boxes.length / 2;
      crack.boxes.forEach((box: Mesh, i: number): void => {
        const open = Math.min(1, Math.max(0, (crack.age - (Math.floor(i / 2) / steps) * FISSURE_RUN) * 20));
        box.visible = crack.age < FISSURE_LIFE && open > 0;
        box.scale.z = Math.max(0.0001, crack.widths[i] * open * close);
      });
    }
    this._cracks = this._cracks.filter((crack: Crack): boolean => crack.age < FISSURE_LIFE);
  }

  /**
   * Frees the crack and seam materials and the box.
   */
  dispose(): void {
    this._crack.dispose();
    this._seam.dispose();
    this._box.dispose();
  }
}
