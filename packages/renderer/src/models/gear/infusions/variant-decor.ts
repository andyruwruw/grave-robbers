// Packages
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

// Types
import type { Material, Object3D } from 'three';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { BoxFactory, GearAnimate, GearHead, GearModel } from '../../../types/models';
import type { Restyle } from './types/variant-shape';

/**
 * Three numbers, one per axis.
 */
type Vec3 = [number, number, number];

/**
 * An axis: 0 x, 1 y, 2 z.
 */
type Axis = 0 | 1 | 2;

/**
 * Where a model with no head of its own gets decorated.
 */
const NO_HEAD: GearHead = { center: [0, -0.3, 0], size: [0.1, 0.1, 0.1], parts: [], along: 1, out: 0 };

/**
 * One infused model while its look is put on: the head gathered into a
 * pivot at its middle (so it can float, turn, and grow, and everything
 * added to it goes along), and helpers that place boxes by the head's own
 * axes (along its edge, out from it, and through its thickness), wrap the
 * haft, restyle boxes, and add per-frame motion.
 */
export class VariantDecor {
  /**
   * The head's pivot, at its middle: its boxes and everything added with
   * `add` sit in it.
   */
  readonly head = new Group();

  /**
   * Where the pivot rests, before any float or bob.
   */
  readonly rest = new Vector3();

  /**
   * The way from the hand to the head (unit length).
   */
  readonly reach = new Vector3();

  /**
   * The head's size along each axis.
   */
  readonly size: Vec3;

  /**
   * The axis the edge runs along.
   */
  readonly along: Axis;

  /**
   * The axis the edge faces out on.
   */
  readonly out: Axis;

  /**
   * The third axis, through the head's thickness.
   */
  readonly thick: Axis;

  /**
   * Which end of the head (along its edge) is nearer the hand: 1 or -1.
   */
  readonly gripSide: number;

  /**
   * Every per-frame motion added so far.
   */
  private _animations: GearAnimate[] = [];

  /**
   * Gathers the model's head into its pivot.
   * @param model The model, built in its infused colors.
   * @param box Makes the boxes added to it (not restyled).
   * @param kind The gear.
   * @param infusion Its infusion.
   */
  constructor(readonly model: GearModel, readonly box: BoxFactory, readonly kind: GearKind, readonly infusion: Infusion) {
    const head = model.head ?? NO_HEAD;
    this.size = head.size;
    this.along = head.along;
    this.out = head.out;
    this.thick = (3 - head.along - head.out) as Axis;
    this.head.position.set(...head.center);
    this.rest.copy(this.head.position);
    this.reach.copy(this.rest).normalize();
    if (this.reach.lengthSq() === 0) {
      this.reach.set(0, -1, 0);
    }
    this.gripSide = head.center[head.along] > 0 ? -1 : 1;
    const parent = head.parts[0]?.parent ?? null;
    for (const part of head.parts) {
      part.position.sub(this.rest);
      this.head.add(part);
    }
    if (parent) {
      parent.add(this.head);
    } else {
      model.parts = model.parts.filter((p: Object3D): boolean => !head.parts.includes(p));
      model.parts.push(this.head);
    }
  }

  /**
   * A point (or size) in the head's own axes.
   * @param a Along the edge.
   * @param o Out from the edge.
   * @param t Through the thickness.
   * @returns It as x, y, z.
   */
  vec(a: number, o: number, t: number): Vec3 {
    const v: Vec3 = [0, 0, 0];
    v[this.along] = a;
    v[this.out] = o;
    v[this.thick] = t;
    return v;
  }

  /**
   * Moves something in the head to a point in the head's own axes, without
   * allocating (for per-frame motion).
   * @param part What to move.
   * @param a Along the edge.
   * @param o Out from the edge.
   * @param t Through the thickness.
   */
  place(part: Object3D, a: number, o: number, t: number): void {
    part.position.setComponent(this.along, a);
    part.position.setComponent(this.out, o);
    part.position.setComponent(this.thick, t);
  }

  /**
   * The head's length along its edge.
   * @returns The length.
   */
  get length(): number {
    return this.size[this.along];
  }

  /**
   * The head's width out from its edge.
   * @returns The width.
   */
  get width(): number {
    return this.size[this.out];
  }

  /**
   * The head's thickness.
   * @returns The thickness.
   */
  get depth(): number {
    return this.size[this.thick];
  }

  /**
   * Evenly spaced spots along the edge, short of both ends.
   * @param count How many.
   * @param margin How far short of the ends, as a share of the length.
   * @returns Each spot along the edge, from the head's middle.
   */
  spread(count: number, margin = 0.15): number[] {
    const span = this.length * (1 - margin * 2);
    return Array.from({ length: count }, (_: unknown, i: number): number => (count === 1 ? 0 : -span / 2 + (span * i) / (count - 1)));
  }

  /**
   * Adds a box to the head, in the head's space (x, y, z from its middle).
   * @param size Its size.
   * @param pos Where it sits.
   * @param color Its color.
   * @param glow Whether it glows.
   * @param opacity How opaque it is.
   * @returns The box.
   */
  add(size: Vec3, pos: Vec3, color: string, glow = false, opacity = 1): Mesh {
    const mesh = this.box(size, pos, color, glow, opacity);
    this.head.add(mesh);
    return mesh;
  }

  /**
   * Adds something beside the head, in the model's own space (or the whip
   * root's).
   * @param part What to add.
   */
  addToModel(part: Object3D): void {
    const parent = this.model.haft?.parent ?? null;
    if (parent) {
      parent.add(part);
    } else {
      this.model.parts.push(part);
    }
  }

  /**
   * Wraps a band round the haft.
   * @param k Where, from the grip end (0) to the head end (1).
   * @param height How tall the band is.
   * @param color Its color.
   * @param grow How much wider than the haft it is.
   * @returns The band, or null when the model has no haft.
   */
  wrap(k: number, height: number, color: string, grow = 0.016): Mesh | null {
    const haft = this.model.haft;
    if (!haft) {
      return null;
    }
    const { position: p, scale: s } = haft;
    const y = p.y + s.y / 2 - height / 2 - k * (s.y - height);
    const band = this.box([s.x + grow, height, s.z + grow], [p.x, y, p.z], color);
    this.addToModel(band);
    return band;
  }

  /**
   * Swaps a box for one in a new style, in the same place and turn (the
   * edge and flame the avatar tracks follow it).
   * @param mesh The box.
   * @param to Its new style.
   * @returns The new box.
   */
  restyle(mesh: Mesh, to: Restyle): Mesh {
    const material = mesh.material as Material;
    const glow = to.glow ?? material instanceof MeshBasicMaterial;
    const opacity = to.opacity ?? ((material.userData.opacity as number | undefined) ?? (material.transparent ? material.opacity : 1));
    const next = this.box([mesh.scale.x, mesh.scale.y, mesh.scale.z], [mesh.position.x, mesh.position.y, mesh.position.z], to.color, glow, opacity);
    next.quaternion.copy(mesh.quaternion);
    mesh.parent?.add(next);
    mesh.removeFromParent();
    if (this.model.tip === mesh) {
      this.model.tip = next;
    }
    if (this.model.flame === mesh) {
      this.model.flame = next;
    }
    return next;
  }

  /**
   * Restyles every box in the head.
   * @param pick The new style for each box, or null to leave it.
   */
  restyleHead(pick: (mesh: Mesh) => Restyle | null): void {
    for (const part of [...this.head.children]) {
      if (part instanceof Mesh) {
        const to = pick(part);
        if (to) {
          this.restyle(part, to);
        }
      }
    }
  }

  /**
   * Adds a per-frame motion.
   * @param motion The motion.
   */
  animate(motion: GearAnimate): void {
    this._animations.push(motion);
  }

  /**
   * Hands the model every motion added, as its one `animate`, and poses it
   * once at time 0 (so still models, on the ground and in icons, show every
   * piece in place).
   * @returns The model.
   */
  finish(): GearModel {
    const motions = this._animations;
    if (motions.length > 0) {
      this.model.animate = (time, dt, holder): void => {
        for (const motion of motions) {
          motion(time, dt, holder);
        }
      };
      this.model.animate(0, 0, null);
    }
    return this.model;
  }
}
