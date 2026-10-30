// Packages
import { Group } from 'three';

// Local Imports
import { HEAD_TURN, MOOD_MIN, MOOD_SPREAD } from '../config/monster-motion';
import { SWOOSH } from '../config/monster-palette';
import { MonsterAvatar } from '../monster-avatar';
import {
  VAMPIRE_BOB,
  VAMPIRE_CAPE,
  VAMPIRE_EYE,
  VAMPIRE_FANG,
  VAMPIRE_HAIR,
  VAMPIRE_HOVER,
  VAMPIRE_LINING,
  VAMPIRE_MEDALLION,
  VAMPIRE_MOODS,
  VAMPIRE_SKIN,
  VAMPIRE_SUIT,
} from './config/vampire';

// Types
import type { TrailStyle } from '../types/trail-style';
import type { VampireMood } from './types/moods';

/**
 * A vampire: hovers, glides with its cape streaming, stalks with claws
 * ready, and lunges.
 */
export class VampireAvatar extends MonsterAvatar {
  /**
   * The cape's upper half, hinged at the shoulders.
   */
  private _cape = new Group();

  /**
   * The cape's lower half, hinged halfway down.
   */
  private _capeLow = new Group();

  /**
   * How far the cape streams out behind, eased toward 1 while it moves.
   */
  private _capeLift = 0;

  /**
   * What it's doing with itself while idle.
   */
  private _vampireMood: VampireMood = 'still';

  /**
   * When the mood next changes.
   */
  private _moodUntil = 0;

  /**
   * Which arm holds the cape up in the cloak mood.
   */
  private _raisedSide = 1;

  /**
   * A vampire in a dark suit with a two-piece cape (hinged at the shoulders
   * and halfway down, so it can billow and ripple), a high collar, slicked
   * hair with a widow's peak, glowing eyes, fangs, and clawed hands.
   */
  protected build(): void {
    const { box } = this._parts;
    const legL = box([0.12, 0.26, 0.12], [0, 0.13, -0.08], VAMPIRE_SUIT);
    const legR = box([0.12, 0.26, 0.12], [0, 0.13, 0.08], VAMPIRE_SUIT);
    this._limbs.push(legL, legR);
    this.group.add(legL, legR);
    this.body.add(
      box([0.24, 0.36, 0.34], [0, 0.44, 0], VAMPIRE_SUIT),
      box([0.04, 0.2, 0.1], [0.12, 0.48, 0], '#e8e4ea'),
      box([0.02, 0.05, 0.05], [0.135, 0.57, 0], VAMPIRE_MEDALLION),
      box([0.08, 0.24, 0.44], [-0.09, 0.72, 0], VAMPIRE_LINING),
      box([0.05, 0.27, 0.5], [-0.13, 0.73, 0], VAMPIRE_CAPE),
    );

    this._head.position.set(0.02, 0.64, 0);
    this._head.add(
      ...this._parts.roundedBox([0.26, 0.28, 0.28], [0, 0.13, 0], VAMPIRE_SKIN),
      box([0.28, 0.08, 0.3], [-0.02, 0.29, 0], VAMPIRE_HAIR),
      box([0.05, 0.07, 0.08], [0.12, 0.25, 0], VAMPIRE_HAIR),
      box([0.12, 0.14, 0.3], [-0.1, 0.2, 0], VAMPIRE_HAIR),
      box([0.03, 0.02, 0.09], [0.145, 0.2, -0.07], VAMPIRE_HAIR),
      box([0.03, 0.02, 0.09], [0.145, 0.2, 0.07], VAMPIRE_HAIR),
      box([0.03, 0.06, 0.08], [0.14, 0.15, -0.07], VAMPIRE_EYE, true),
      box([0.03, 0.06, 0.08], [0.14, 0.15, 0.07], VAMPIRE_EYE, true),
      box([0.02, 0.05, 0.02], [0.14, 0.03, -0.035], VAMPIRE_FANG),
      box([0.02, 0.05, 0.02], [0.14, 0.03, 0.035], VAMPIRE_FANG),
    );

    this._cape.position.set(-0.14, 0.66, 0);
    this._cape.add(
      box([0.05, 0.34, 0.52], [0, -0.17, 0], VAMPIRE_CAPE),
      box([0.02, 0.32, 0.46], [0.03, -0.17, 0], VAMPIRE_LINING),
    );
    this._capeLow.position.set(0, -0.33, 0);
    this._capeLow.add(
      box([0.05, 0.3, 0.56], [0, -0.15, 0], VAMPIRE_CAPE),
      box([0.02, 0.28, 0.5], [0.03, -0.14, 0], VAMPIRE_LINING),
      box([0.05, 0.07, 0.13], [0, -0.33, -0.2], VAMPIRE_CAPE),
      box([0.05, 0.05, 0.12], [0, -0.32, 0.02], VAMPIRE_CAPE),
      box([0.05, 0.08, 0.13], [0, -0.34, 0.21], VAMPIRE_CAPE),
    );
    this._cape.add(this._capeLow);

    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0, 0.58, 0.21 * side);
      arm.add(
        box([0.3, 0.1, 0.1], [0.14, 0, 0], VAMPIRE_SUIT),
        box([0.08, 0.08, 0.08], [0.32, 0, 0], VAMPIRE_SKIN),
        box([0.06, 0.02, 0.07], [0.38, -0.02, 0], VAMPIRE_FANG),
      );
    }
    this.body.add(this._head, this._cape, this._armL, this._armR);
  }

  /**
   * A streak behind each clawed hand.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._armL, [0.38, -0.02, 0]], [this._armR, [0.38, -0.02, 0]]], color: SWOOSH, opacity: 0.16, size: 0.1 };
  }

  /**
   * Only the head kicks here: `animate` folds the body's recoil in itself.
   */
  protected applyKick(): void {
    this._head.rotation.y += this._kick.yaw;
    this._head.rotation.z += this._kick.pitch;
  }

  /**
   * A vampire hovers a little and bobs when it isn't moving, glides leaning
   * forward with its arms swept back and its cape streaming out behind
   * when it is, and lunges with its claws out and its cape flaring when it
   * strikes. Idle, it stands still, hides behind its cape, looks around, or
   * looms with its arms and cape spread; hunting, it stalks with claws
   * raised and eyes ahead. The cape always ripples, lower half lagging.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   * @param _trip How far into a stumble (unused).
   * @param lunge How far into a lunge, 0 to 1.
   * @param coil How far through the windup, 0 to 1.
   */
  protected animate(dt: number, time: number, stride: number, _trip: number, lunge: number, coil: number): void {
    const t = this.target;
    if (t.hunting) {
      this._moodUntil = time + 1;
    } else if (time >= this._moodUntil) {
      let roll = Math.random();
      this._vampireMood = VAMPIRE_MOODS.find(([, weight]): boolean => (roll -= weight) < 0)?.[0] ?? 'still';
      this._moodUntil = time + MOOD_MIN + Math.random() * MOOD_SPREAD;
      this._raisedSide = Math.random() < 0.5 ? 1 : -1;
    }
    const mood: VampireMood | 'stalk' = t.hunting ? 'stalk' : this._vampireMood;
    this._capeLift += ((t.moving ? 1 : 0) - this._capeLift) * Math.min(1, dt * 4);
    const lift = this._capeLift;
    const loom = mood === 'loom' && !t.moving ? 1 : 0;

    for (const limb of this._limbs) {
      limb.position.x *= 0.6;
    }
    this.body.position.y = (1 - lift) * (VAMPIRE_HOVER + Math.sin(time * 2 + this._gait.phase) * VAMPIRE_BOB) + Math.abs(stride) * 0.015;
    this.body.position.x = lunge * 0.14;
    this.body.rotation.z = -0.38 * lift - (mood === 'stalk' && !t.moving ? 0.12 : 0) + loom * 0.06 - lunge * 0.35 + coil * 0.22 + this._kick.recoil;
    this.body.rotation.x = Math.sin(time * 0.8 + this._gait.phase) * 0.03;

    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 1.5 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    const yaw = mood === 'stalk' || t.moving ? 0 : mood === 'scan' ? Math.sin(time * 0.6 + this._gait.phase) * HEAD_TURN : this._headTarget * 0.4;
    this._headYaw += (yaw - this._headYaw) * Math.min(1, dt * 3);
    this._head.rotation.y = this._headYaw;
    this._head.rotation.z = (mood === 'stalk' ? -0.15 : 0.05) + lift * 0.25 + Math.sin(time * 1.3 + this._gait.phase) * 0.03 - lunge * 0.2;

    const hang = -1.45;
    let armL = { z: hang, x: 0, y: 0 };
    let armR = { z: hang, x: 0, y: 0 };
    if (lunge > 0.01) {
      armL = { z: -0.15 + lunge * 0.2, x: 0, y: 0.15 };
      armR = { z: -0.15 + lunge * 0.2, x: 0, y: -0.15 };
    } else if (coil > 0.01) {
      armL = { z: -0.3 + coil * 0.75, x: 0, y: 0.4 };
      armR = { z: -0.3 + coil * 0.75, x: 0, y: -0.4 };
    } else if (lift > 0.5) {
      armL = { z: -2.3, x: 0, y: 0 };
      armR = { z: -2.3, x: 0, y: 0 };
    } else if (mood === 'stalk') {
      armL = { z: -0.55 + Math.sin(time * 5) * 0.06, x: 0, y: 0.25 };
      armR = { z: -0.55 + Math.sin(time * 5 + 1) * 0.06, x: 0, y: -0.25 };
    } else if (mood === 'cloak') {
      const raised = { z: 0.15, x: 0, y: -0.95 * this._raisedSide };
      armL = this._raisedSide === -1 ? raised : armL;
      armR = this._raisedSide === 1 ? raised : armR;
    } else if (mood === 'loom') {
      armL = { z: -0.5, x: -1.1, y: 0 };
      armR = { z: -0.5, x: 1.1, y: 0 };
    }
    const ease = Math.min(1, dt * (lunge > 0.01 || coil > 0.01 ? 20 : 5));
    for (const [arm, pose, side] of [[this._armL, armL, -1], [this._armR, armR, 1]] as const) {
      arm.rotation.z += (pose.z + Math.sin(time * 1.4 + this._gait.phase + side) * 0.04 - arm.rotation.z) * ease;
      arm.rotation.x += (pose.x - arm.rotation.x) * ease;
      arm.rotation.y += (pose.y - arm.rotation.y) * ease;
    }

    const flutter = 2 + lift * 9;
    const cloak = mood === 'cloak' && !t.moving ? 1 : 0;
    this._cape.rotation.z = -(0.06 + lift * 0.8 + loom * 0.25 + lunge * 0.5) + Math.sin(time * flutter + this._gait.phase) * (0.04 + lift * 0.1);
    this._capeLow.rotation.z = -lift * 0.35 + Math.sin(time * flutter + this._gait.phase - 1.1) * (0.06 + lift * 0.22);
    this._cape.rotation.x = Math.sin(time * 1.7 + this._gait.phase) * 0.05 * (1 + lift) + cloak * 0.35 * this._raisedSide;
    this._cape.scale.z = 1 + loom * 0.35 + lunge * 0.3 + cloak * 0.15;
  }
}
