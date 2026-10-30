// Packages
import {
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { UNIT_BOX } from '../../config/avatar';
import { MonsterAvatar } from '../monster-avatar';
import {
  GHOST_BODY,
  GHOST_FACE,
  GHOST_HEIGHT,
  GHOST_MAD,
  GHOST_OPACITY,
} from './config/ghost';

/**
 * A ghost: a see-through, glowing sheet that bobs, its wisps trailing
 * below, its face turning angry while it hunts. It shrugs off hits.
 */
export class GhostAvatar extends MonsterAvatar {
  /**
   * The wisps that trail below it.
   */
  private _tail: Mesh[] = [];

  /**
   * The one material its body and wisps share.
   */
  private _ghostMaterial: MeshBasicMaterial | null = null;

  /**
   * The face it wears while calm.
   */
  private _calmFace = new Group();

  /**
   * The face it wears while hunting.
   */
  private _madFace = new Group();

  /**
   * A ghost: a see-through body, head, and arms in one glowing material,
   * two faces (calm and mad), and four wisps below.
   */
  protected build(): void {
    const { box } = this._parts;
    const material = new MeshBasicMaterial({ color: GHOST_BODY, transparent: true, opacity: GHOST_OPACITY, depthWrite: false });
    this._ghostMaterial = material;
    this._parts.materials.push(material);
    /**
     * Builds one box of the see-through body.
     * @param size The box size.
     * @param pos Where it sits.
     * @returns The box.
     */
    const part = (size: [number, number, number], pos: [number, number, number]): Mesh => {
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.scale.set(...size);
      mesh.position.set(...pos);
      return mesh;
    };
    this.body.add(
      part([0.4, 0.34, 0.4], [0, 0.42, 0]),
      part([0.34, 0.16, 0.34], [0, 0.66, 0]),
      part([0.22, 0.08, 0.22], [0, 0.78, 0]),
      part([0.1, 0.2, 0.1], [0.04, 0.42, 0.26]),
      part([0.1, 0.2, 0.1], [0.04, 0.42, -0.26]),
      this._calmFace,
      this._madFace,
    );
    this._calmFace.add(
      box([0.02, 0.1, 0.07], [0.205, 0.58, -0.08], GHOST_FACE, true),
      box([0.02, 0.1, 0.07], [0.205, 0.58, 0.08], GHOST_FACE, true),
      box([0.02, 0.07, 0.1], [0.205, 0.44, 0], GHOST_FACE, true),
    );
    /**
     * Builds one angry brow for the mad face.
     * @param side Which side of the face (-1 or 1).
     * @returns The brow.
     */
    const brow = (side: number): Mesh => {
      const mesh = box([0.02, 0.035, 0.11], [0.207, 0.645, 0.08 * side], GHOST_FACE, true);
      mesh.rotation.x = 0.55 * side;
      return mesh;
    };
    this._madFace.add(
      brow(-1),
      brow(1),
      box([0.02, 0.06, 0.06], [0.206, 0.58, -0.08], GHOST_MAD, true),
      box([0.02, 0.06, 0.06], [0.206, 0.58, 0.08], GHOST_MAD, true),
      box([0.02, 0.035, 0.2], [0.205, 0.45, 0], GHOST_FACE, true),
      box([0.02, 0.04, 0.03], [0.206, 0.43, -0.07], GHOST_MAD, true),
      box([0.02, 0.04, 0.03], [0.206, 0.43, 0], GHOST_MAD, true),
      box([0.02, 0.04, 0.03], [0.206, 0.43, 0.07], GHOST_MAD, true),
    );
    this._madFace.visible = false;
    for (const [ox, oz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) {
      const wisp = part([0.14, 0.18, 0.14], [ox, 0.17, oz]);
      this._tail.push(wisp);
      this.body.add(wisp);
    }
  }

  /**
   * Hits don't move it.
   */
  protected applyKick(): void {}

  /**
   * Ghosts just swing while held up.
   */
  flail(): void {}

  /**
   * Bobs, ripples its wisps, puts on the face for its mood, and pulses
   * brighter while draining a light or hunting.
   * @param _dt Seconds since the last frame (unused).
   * @param time Seconds since the renderer started.
   */
  protected animate(_dt: number, time: number): void {
    const t = this.target;
    this.body.position.y = GHOST_HEIGHT + Math.sin(time * 2.4 + this._gait.phase) * 0.06;
    this._tail.forEach((wisp: Mesh, i: number): void => {
      wisp.position.y = 0.17 + Math.sin(time * 6 + i * 1.7) * 0.04;
    });
    this._calmFace.visible = !t.hunting;
    this._madFace.visible = t.hunting;
    const pulse = t.draining ? 0.5 + 0.5 * Math.sin(time * 10) : t.hunting ? 0.25 + 0.25 * Math.sin(time * 6) : 0;
    this.body.scale.setScalar(1 + pulse * 0.08);
    this._ghostMaterial!.opacity = GHOST_OPACITY + pulse * 0.3;
  }
}
