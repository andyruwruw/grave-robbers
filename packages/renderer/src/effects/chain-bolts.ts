// Packages
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

// Local Imports
import {
  CHAIN_COLORS,
  CHAIN_JITTER,
  CHAIN_KINKS,
  CHAIN_LIFE,
  CHAIN_POOL,
  CHAIN_STRAY,
} from './config/infusion-layers';
import { EffectLayer } from './effect-layer';

/**
 * One arc of chain lightning: the world points it jumps through, and how
 * long it has flickered.
 */
interface Bolt {
  /**
   * World-space points, first struck to last jumped to.
   */
  points: Vector3[];

  /**
   * Seconds since it struck.
   */
  age: number;

  /**
   * Seconds until it's jagged again.
   */
  rejag: number;

  /**
   * The pool segments it draws with, two per kink (core and sheath).
   */
  segments: Mesh[];
}

/**
 * The +x axis a segment box lies along before it's turned.
 */
const ALONG = new Vector3(1, 0, 0);

/**
 * Chain lightning (Dawn's Scourge, The Seraphic Chain): jagged glowing arcs
 * between the monsters a hit jumped through, re-jagged many times a second
 * so they crackle, thinning out as they fade. Each hop is a few kinked
 * segments of a white core inside a golden sheath, from a fixed pool.
 */
export class ChainBolts extends EffectLayer {
  /**
   * The pool of segment meshes.
   */
  private _pool: Mesh[] = [];

  /**
   * Arcs flickering now.
   */
  private _bolts: Bolt[] = [];

  /**
   * The white-hot core's material.
   */
  private _core = new MeshBasicMaterial({ color: CHAIN_COLORS.core });

  /**
   * The golden sheath's material.
   */
  private _sheath = new MeshBasicMaterial({ color: CHAIN_COLORS.sheath, transparent: true, opacity: 0.7, depthWrite: false });

  /**
   * Scratch: where a segment starts.
   */
  private _from = new Vector3();

  /**
   * Scratch: where a segment ends.
   */
  private _to = new Vector3();

  /**
   * Scratch: which way a segment runs.
   */
  private _dir = new Vector3();

  /**
   * The unit box every segment shares.
   */
  private _box = new BoxGeometry(1, 1, 1);

  /**
   * Fills the pool with hidden segments.
   */
  constructor() {
    super();
    for (let i = 0; i < CHAIN_POOL; i++) {
      const mesh = new Mesh(this._box, i % 2 ? this._sheath : this._core);
      mesh.visible = false;
      this.group.add(mesh);
      this._pool.push(mesh);
    }
  }

  /**
   * Strikes an arc through world-space points (dropped when the pool is
   * spent).
   * @param points The points, first struck to last jumped to.
   */
  strike(points: Vector3[]): void {
    const needed = (points.length - 1) * CHAIN_KINKS * 2;
    const free = this._pool.filter((m: Mesh): boolean => !m.visible);
    if (points.length < 2 || free.length < needed) {
      return;
    }
    const segments = free.slice(0, needed);
    segments.forEach((m: Mesh, i: number): void => {
      m.material = i % 2 ? this._sheath : this._core;
      m.visible = true;
    });
    const bolt = { points, age: 0, rejag: 0, segments };
    this._bolts.push(bolt);
    this.jag(bolt, 1);
  }

  /**
   * Crackles each arc and frees the ones that have faded.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (const bolt of this._bolts) {
      bolt.age += dt;
      bolt.rejag -= dt;
      if (bolt.age >= CHAIN_LIFE) {
        bolt.segments.forEach((m: Mesh): void => {
          m.visible = false;
        });
      } else if (bolt.rejag <= 0) {
        this.jag(bolt, 1 - bolt.age / CHAIN_LIFE);
      }
    }
    this._bolts = this._bolts.filter((bolt: Bolt): boolean => bolt.age < CHAIN_LIFE);
  }

  /**
   * Frees the core and sheath materials and the box.
   */
  dispose(): void {
    this._core.dispose();
    this._sheath.dispose();
    this._box.dispose();
  }

  /**
   * Lays an arc's segments along a fresh random zigzag.
   * @param bolt The arc.
   * @param left How much of its life is left, 1 to 0 (it thins out).
   */
  private jag(bolt: Bolt, left: number): void {
    bolt.rejag = CHAIN_JITTER;
    let s = 0;
    for (let hop = 0; hop < bolt.points.length - 1; hop++) {
      const a = bolt.points[hop];
      const b = bolt.points[hop + 1];
      this._from.copy(a);
      for (let k = 1; k <= CHAIN_KINKS; k++) {
        this._to.lerpVectors(a, b, k / CHAIN_KINKS);
        if (k < CHAIN_KINKS) {
          this._to.x += (Math.random() - 0.5) * 2 * CHAIN_STRAY;
          this._to.y += (Math.random() - 0.5) * CHAIN_STRAY;
          this._to.z += (Math.random() - 0.5) * 2 * CHAIN_STRAY;
        }
        const length = this._from.distanceTo(this._to);
        const dir = this._dir.subVectors(this._to, this._from).normalize();
        for (const [mesh, thick] of [[bolt.segments[s], 0.035], [bolt.segments[s + 1], 0.09]] as const) {
          mesh.position.lerpVectors(this._from, this._to, 0.5);
          mesh.quaternion.setFromUnitVectors(ALONG, dir);
          mesh.scale.set(length + thick, thick * (0.4 + 0.6 * left), thick * (0.4 + 0.6 * left));
        }
        s += 2;
        this._from.copy(this._to);
      }
    }
  }
}
