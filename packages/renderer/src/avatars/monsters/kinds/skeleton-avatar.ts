// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { mix } from '../../../helpers/angles';
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { ARM_DOWN, ARM_HALF, HEAD_TURN } from '../config/monster-motion';
import {
  ARROW_WOOD,
  BOW_STRING,
  BOW_WOOD,
  SKELETON_BONES,
  SKELETON_EYE,
  SKELETON_JOINT,
  SKELETON_SOCKET,
} from './config/skeleton';

// Types
import type { Mesh } from 'three';

/**
 * A skeleton archer: rattles about, and raises and draws its bow to shoot.
 */
export class SkeletonAvatar extends ChargingMonsterAvatar {
  /**
   * The arrow on the string, shown while it draws.
   */
  private _nocked: Mesh | null = null;

  /**
   * A skeleton archer: bone legs on hip pivots, a pelvis and spine, three
   * ribs over a sternum, a skull with dark sockets and pale pinpoint eyes,
   * thin jointed arms, and a recurve bow in its left hand. An arrow shows
   * on the string while it draws.
   */
  protected build(): void {
    const { box } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const bone = SKELETON_BONES[Math.floor(rand() * SKELETON_BONES.length)];
    this._size = 0.95 + rand() * 0.1;
    for (const side of [-1, 1]) {
      const leg = new Group();
      leg.position.set(0, 0.27, 0.07 * side);
      leg.add(
        box([0.05, 0.13, 0.05], [0, -0.065, 0], bone),
        box([0.06, 0.04, 0.06], [0, -0.13, 0], SKELETON_JOINT),
        box([0.045, 0.13, 0.045], [0, -0.2, 0], bone),
        box([0.1, 0.03, 0.06], [0.03, -0.255, 0], bone),
      );
      this._limbs.push(leg);
      this.group.add(leg);
    }
    this.body.add(
      box([0.1, 0.06, 0.2], [0, 0.29, 0], bone),
      box([0.04, 0.2, 0.04], [-0.03, 0.4, 0], bone),
      box([0.15, 0.025, 0.24], [0.01, 0.4, 0], bone),
      box([0.16, 0.025, 0.26], [0.01, 0.45, 0], bone),
      box([0.15, 0.025, 0.24], [0.01, 0.5, 0], bone),
      box([0.03, 0.13, 0.04], [0.085, 0.45, 0], bone),
      box([0.05, 0.03, 0.32], [0, 0.55, 0], bone),
    );
    this._head.position.set(0.01, 0.58, 0);
    this._head.add(
      ...this._parts.roundedBox([0.22, 0.19, 0.22], [0, 0.11, 0], bone),
      box([0.1, 0.05, 0.16], [0.05, 0, 0], SKELETON_JOINT),
      box([0.02, 0.06, 0.06], [0.105, 0.12, -0.05], SKELETON_SOCKET),
      box([0.02, 0.06, 0.06], [0.105, 0.12, 0.05], SKELETON_SOCKET),
      box([0.025, 0.025, 0.025], [0.11, 0.12, -0.05], SKELETON_EYE, true),
      box([0.025, 0.025, 0.025], [0.11, 0.12, 0.05], SKELETON_EYE, true),
      box([0.02, 0.035, 0.03], [0.11, 0.07, 0], SKELETON_SOCKET),
      box([0.02, 0.02, 0.1], [0.105, 0.025, 0], SKELETON_SOCKET),
    );
    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.01, 0.54, 0.17 * side);
      arm.add(
        box([0.17, 0.035, 0.035], [0.085, 0, 0], bone),
        box([0.04, 0.04, 0.04], [0.17, 0, 0], SKELETON_JOINT),
        box([0.15, 0.03, 0.03], [0.26, 0, 0], bone),
        box([0.05, 0.045, 0.045], [0.35, 0, 0], bone),
      );
    }
    const bow = new Group();
    bow.position.set(0.36, 0, 0);
    const upper = box([0.03, 0.17, 0.03], [-0.02, 0.1, 0], BOW_WOOD);
    upper.rotation.z = 0.3;
    const lower = box([0.03, 0.17, 0.03], [-0.02, -0.1, 0], BOW_WOOD);
    lower.rotation.z = -0.3;
    bow.add(box([0.04, 0.07, 0.04], [0, 0, 0], BOW_WOOD), upper, lower, box([0.008, 0.36, 0.008], [-0.07, 0, 0], BOW_STRING));
    this._armL.add(bow);
    this._nocked = box([0.32, 0.015, 0.015], [0.27, 0.54, -0.07], ARROW_WOOD);
    this._nocked.visible = false;
    this.body.add(this._head, this._armL, this._armR, this._nocked);
  }

  /**
   * Idles with its head snapping from side to side, every bone rattling a
   * little. To shoot, it raises the bow at arm's length and draws the
   * string back to its chest with an arrow nocked, leaning back, then
   * looses and lowers it.
   * @param _dt Seconds since the last frame (unused).
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   */
  protected animate(_dt: number, time: number, stride: number): void {
    const t = this.target;
    const { charge, strike } = this.attackPhase();
    const aim = Math.max(charge, Math.min(1, strike * 1.5));
    for (const [i, limb] of this._limbs.entries()) {
      limb.position.x = 0;
      limb.rotation.z = (i === 0 ? 1 : -1) * stride * 0.55;
    }
    this.body.position.y = Math.abs(stride) * 0.02;
    this.body.rotation.z = -0.05 + charge * 0.12 - strike * 0.06;
    this.body.rotation.x = Math.sin(time * 9 + this._gait.phase) * 0.015 * (t.moving ? 1 : 0.4);
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 1 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._head.rotation.y = t.hunting || aim > 0 ? 0 : this._headTarget;
    this._head.rotation.z = (t.hunting ? -0.05 : 0.05) + Math.sin(time * 1.3 + this._gait.phase) * 0.03;
    const hang = t.hunting ? ARM_HALF : ARM_DOWN;
    this._armL.rotation.z = mix(hang + stride * 0.3, 0, aim);
    this._armL.rotation.y = -0.3 * aim;
    this._armR.rotation.z = mix(hang - stride * 0.3, 0.05, aim);
    this._armR.rotation.y = 0.75 * charge;
    this._armR.position.x = 0.01 - 0.08 * charge;
    this._nocked!.visible = charge > 0.05 && strike === 0;
  }
}
