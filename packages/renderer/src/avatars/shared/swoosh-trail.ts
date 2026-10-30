// Packages
import {
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from 'three';

// Local Imports
import { UNIT_BOX } from '../config/avatar';

// Types
import type { ColorRepresentation, Group } from 'three';

/**
 * How a swoosh looks and how many bits it keeps.
 */
export interface SwooshOptions {
  /**
   * Bits made for each source.
   */
  poolPerSource: number;

  /**
   * Seconds each bit lingers.
   */
  life: number;

  /**
   * How many bits fill the gap between frames, so the streak stays solid.
   */
  steps: number;

  /**
   * A fresh bit's size, in world units.
   */
  size: number;

  /**
   * A fresh bit's opacity.
   */
  opacity: number;

  /**
   * The bits' color.
   */
  color: ColorRepresentation;
}

/**
 * One point a swoosh follows.
 */
interface SwooshSource {
  /**
   * Finds the object to follow this frame, or null to keep the last point.
   */
  resolve: () => Object3D | null;

  /**
   * Where it is this frame, in world space.
   */
  at: Vector3;

  /**
   * Where it was last frame, in world space.
   */
  was: Vector3;
}

/**
 * One pooled bit of the streak.
 */
interface SwooshBit {
  /**
   * The bit's box.
   */
  mesh: Mesh;

  /**
   * The bit's own material, faded as it ages.
   */
  material: MeshBasicMaterial;

  /**
   * Seconds since it was dropped.
   */
  age: number;
}

/**
 * The faint world-space streak a blade, fist, claw, or broom leaves
 * through the air while it swings: pooled bits dropped along each source's
 * path, filling in between frames, that fade and shrink.
 */
export class SwooshTrail {
  /**
   * Every pooled bit.
   */
  private _bits: SwooshBit[] = [];

  /**
   * The next bit to reuse.
   */
  private _next = 0;

  /**
   * The points it follows.
   */
  private _sources: SwooshSource[] = [];

  /**
   * Whether it was dropping bits last frame (so this frame fills in from
   * where the sources were).
   */
  private _trailing = false;

  /**
   * Scratch point for placing bits.
   */
  private _point = new Vector3();

  /**
   * Starts a swoosh with no sources.
   * @param _group The world-space group the bits go in (the renderer adds
   * it to the scene).
   * @param _options How it looks and how many bits it keeps.
   */
  constructor(private readonly _group: Group, private readonly _options: SwooshOptions) {}

  /**
   * Follows one more point, pooling `poolPerSource` more bits for it.
   * @param resolve Finds the object to follow each frame (null keeps the
   * last point).
   */
  addSource(resolve: () => Object3D | null): void {
    this._sources.push({ resolve, at: new Vector3(), was: new Vector3() });
    for (let i = 0; i < this._options.poolPerSource; i++) {
      const material = new MeshBasicMaterial({ color: this._options.color, transparent: true, opacity: 0, depthWrite: false });
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.visible = false;
      this._group.add(mesh);
      this._bits.push({ mesh, material, age: this._options.life });
    }
  }

  /**
   * Follows a fixed point on a part: a marker added to the part at `at`.
   * @param parent The part (a fist, a claw, the jaws).
   * @param at Where on the part, in its space.
   */
  addPoint(parent: Object3D, at: [number, number, number]): void {
    const source = new Object3D();
    source.position.set(...at);
    parent.add(source);
    this.addSource((): Object3D => source);
  }

  /**
   * Drops bits along each source's path while `active` (filling in between
   * frames), and fades and shrinks the ones already out. A source that
   * resolves to null keeps its last point.
   * @param dt Seconds since the last frame.
   * @param active Whether the swing is drawing a streak right now.
   * @param root The avatar's group, whose world matrices are brought up to
   * date first.
   */
  update(dt: number, active: boolean, root: Object3D): void {
    if (this._sources.length === 0) {
      return;
    }
    const { life, steps, size, opacity } = this._options;
    root.updateMatrixWorld(true);
    for (const source of this._sources) {
      source.resolve()?.getWorldPosition(source.at);
      if (active) {
        const from = this._trailing ? source.was : source.at;
        for (let s = 1; s <= steps; s++) {
          const bit = this._bits[this._next];
          this._next = (this._next + 1) % this._bits.length;
          bit.mesh.position.copy(this._point.lerpVectors(from, source.at, s / steps));
          bit.age = 0;
        }
      }
      source.was.copy(source.at);
    }
    this._trailing = active;
    for (const bit of this._bits) {
      bit.age = Math.min(bit.age + dt, life);
      const k = bit.age / life;
      bit.mesh.visible = k < 1;
      bit.material.opacity = opacity * (1 - k * k);
      bit.mesh.scale.setScalar(size * (1 - k * 0.6));
    }
  }

  /**
   * Disposes the bits' materials.
   */
  dispose(): void {
    this._bits.forEach(({ material }): void => material.dispose());
  }
}
