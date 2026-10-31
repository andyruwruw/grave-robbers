// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { shadeHex } from '../../../helpers/colors';
import { ArmedMonsterAvatar } from '../armed-monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import {
  ARMOR_DARK,
  ARMOR_IRON,
  ARMOR_RUST,
  SWOOSH,
  ZOMBIE_EYE,
  ZOMBIE_PANTS,
} from '../config/monster-palette';
import {
  BRUTE_ARM_DAMPING,
  BRUTE_ARM_HANG,
  BRUTE_ARM_STIFFNESS,
  BRUTE_BELT,
  BRUTE_HEFT,
  BRUTE_HIP,
  BRUTE_QUAKE_FADE,
  BRUTE_RECOVER,
  BRUTE_ROLL,
  BRUTE_SHIFT,
  BRUTE_SKINS,
  BRUTE_SLAM_QUAKE,
  BRUTE_SLAM_TIME,
  BRUTE_STEP_QUAKE,
  BRUTE_TUSK,
  BRUTE_WALK_QUAKE,
  BRUTE_WINDUP,
} from './config/brute';

// Types
import type { TrailStyle } from '../types/trail-style';

/**
 * A brute: a hulking zombie that moves with weight and hammers both fists
 * down, shaking the trees around it.
 */
export class BruteAvatar extends ArmedMonsterAvatar {
  /**
   * Each arm's angle (the arms hang on springs).
   */
  private _armAngle = [BRUTE_ARM_HANG, BRUTE_ARM_HANG];

  /**
   * Each arm's spring speed.
   */
  private _armSpeed = [0, 0];

  /**
   * Whether its current swing has landed yet.
   */
  private _slammed = true;

  /**
   * What's left of its last slam's shake.
   */
  private _slamQuake = 0;

  /**
   * A brute: a hulking, shirtless zombie built from rounded masses, not
   * slabs: short thick legs on hip pivots, a pot belly under a barrel
   * chest, a hump of shoulder muscle the small head sinks forward from
   * (heavy brow, underbite, tusks), and long arms of round shoulders,
   * swollen forearms, and big fists that hang near the ground. Junk sits
   * in its right fist; a helmet or plate (with pauldrons) goes on over.
   */
  protected build(): void {
    const { id, held, armor } = this.target;
    const rand = seededRandom(id * 7919 + 13);
    /**
     * Picks one entry of a list with the seeded roll.
     * @param list The choices.
     * @returns The one picked.
     */
    const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
    const { box, eye } = this._parts;
    const rounded = this._parts.roundedBox.bind(this._parts);
    const skin = pick(BRUTE_SKINS);
    const pants = pick(ZOMBIE_PANTS);
    const dark = shadeHex(skin, 0.78);
    this._size = 1.3 + rand() * 0.1;

    for (const side of [-1, 1]) {
      const leg = new Group();
      leg.position.set(0, 0.3, 0.13 * side);
      leg.add(
        ...rounded([0.2, 0.16, 0.2], [0, -0.07, 0], pants),
        ...rounded([0.17, 0.13, 0.17], [0.01, -0.19, 0], skin),
        ...rounded([0.24, 0.06, 0.18], [0.04, -0.27, 0], dark),
      );
      this._limbs.push(leg);
      this.group.add(leg);
    }
    this.body.add(
      ...rounded([0.3, 0.14, 0.42], [0, 0.34, 0], pants),
      box([0.34, 0.04, 0.46], [0.01, 0.4, 0], BRUTE_BELT),
      ...rounded([0.36, 0.2, 0.44], [0.04, 0.48, 0], skin),
      ...rounded([0.4, 0.24, 0.6], [0.01, 0.63, 0], skin),
      ...rounded([0.28, 0.14, 0.46], [-0.07, 0.77, 0], dark),
      box([0.03, 0.08, 0.18], [0.215, 0.63, -0.11], dark),
      box([0.03, 0.08, 0.18], [0.215, 0.63, 0.11], dark),
      box([0.03, 0.02, 0.14], [0.225, 0.5, 0.05], '#4a2a22'),
    );
    if (armor === 'plate') {
      this.body.add(
        ...rounded([0.44, 0.22, 0.64], [0.02, 0.64, 0], ARMOR_IRON),
        box([0.42, 0.04, 0.62], [0.02, 0.53, 0], ARMOR_DARK),
        box([0.02, 0.06, 0.08], [0.245, 0.68, -0.12], ARMOR_RUST),
      );
    }

    this._head.position.set(0.17, 0.72, 0);
    this._head.add(
      ...rounded([0.24, 0.22, 0.24], [0, 0.1, 0], skin),
      ...rounded([0.17, 0.09, 0.22], [0.06, -0.01, 0], dark),
      box([0.07, 0.05, 0.26], [0.1, 0.16, 0], dark),
      eye([0.02, 0.035, 0.05], [0.125, 0.11, -0.06], ZOMBIE_EYE),
      eye([0.02, 0.035, 0.05], [0.125, 0.11, 0.06], ZOMBIE_EYE),
      box([0.03, 0.06, 0.03], [0.14, 0.05, -0.07], BRUTE_TUSK),
      box([0.03, 0.06, 0.03], [0.14, 0.05, 0.07], BRUTE_TUSK),
    );
    if (armor) {
      this._head.add(
        ...rounded([0.28, 0.1, 0.28], [-0.01, 0.2, 0], ARMOR_IRON),
        ...rounded([0.2, 0.05, 0.2], [-0.02, 0.26, 0], ARMOR_IRON),
        box([0.03, 0.1, 0.04], [0.14, 0.13, 0], ARMOR_DARK),
      );
    }

    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.02, 0.66, 0.37 * side);
      arm.add(
        ...rounded([0.2, 0.2, 0.2], [0, 0, 0], skin),
        ...rounded([0.24, 0.15, 0.15], [0.15, 0, 0], skin),
        ...rounded([0.24, 0.19, 0.19], [0.35, 0, 0], skin),
        ...rounded([0.17, 0.17, 0.17], [0.53, 0, 0], dark),
      );
      if (armor === 'plate') {
        arm.add(...rounded([0.24, 0.1, 0.24], [0, 0.09, 0], ARMOR_IRON));
      }
    }
    if (held) {
      this.mountHeld(this._armR, 0.54, held);
    }
    this.body.add(this._head, this._armL, this._armR);
  }

  /**
   * Fists up, slam, and the time to straighten up.
   * @returns Seconds.
   */
  protected attackDuration(): number {
    return BRUTE_WINDUP + BRUTE_SLAM_TIME + BRUTE_RECOVER;
  }

  /**
   * A streak behind each fist.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._armL, [0.53, 0, 0]], [this._armR, [0.53, 0, 0]]], color: SWOOSH, opacity: 0.14, size: 0.2 };
  }

  /**
   * A new swing hasn't landed yet.
   */
  protected onAttackStart(): void {
    this._slammed = false;
  }

  /**
   * The fists streak from near the top of the windup through the slam.
   * @returns True mid-swing.
   */
  protected swinging(): boolean {
    return this._attack.age >= BRUTE_WINDUP * 0.85 && this._attack.age < BRUTE_WINDUP + BRUTE_SLAM_TIME + 0.04;
  }

  /**
   * Hits barely rock it.
   * @returns BRUTE_HEFT.
   */
  protected heft(): number {
    return BRUTE_HEFT;
  }

  /**
   * A brute moves with weight: each footfall drops the body and nods the
   * head, it rolls from leg to leg, breathes heavily standing still, and its
   * arms hang on loose springs so they lag and swing. Its swing heaves both
   * fists slowly over its head, leaning back (trembling at the top), then
   * hammers them down in front with a crouch and a lunge, and it takes a
   * moment to straighten up.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   * @param trip How far into a stumble, 0 to 1.
   */
  protected animate(dt: number, time: number, stride: number, trip: number): void {
    const t = this.target;
    const a = this._attack.age;
    let raise = 0;
    let slam = 0;
    if (a < BRUTE_WINDUP) {
      const w = a / BRUTE_WINDUP;
      raise = w * w * (3 - 2 * w);
    } else if (a < BRUTE_WINDUP + BRUTE_SLAM_TIME) {
      const s = (a - BRUTE_WINDUP) / BRUTE_SLAM_TIME;
      raise = 1 - s;
      slam = s * s;
    } else if (a < this._attack.time) {
      const r = (a - BRUTE_WINDUP - BRUTE_SLAM_TIME) / BRUTE_RECOVER;
      slam = (1 - r) * (1 - r);
    }
    if (!this._slammed && a >= BRUTE_WINDUP + BRUTE_SLAM_TIME * 0.8) {
      this._slammed = true;
      this.impactCount++;
      this._slamQuake = BRUTE_SLAM_QUAKE;
    }
    const attacking = raise > 0 || slam > 0;
    const step = t.moving ? Math.abs(stride) ** 4 : 0;
    this._slamQuake = Math.max(0, this._slamQuake - (BRUTE_SLAM_QUAKE / BRUTE_QUAKE_FADE) * dt);
    this.quake = (t.moving ? BRUTE_WALK_QUAKE + step * BRUTE_STEP_QUAKE : 0) + this._slamQuake;
    const breathe = Math.sin(time * 1.4 + this._gait.phase);
    const tremble = raise > 0.85 && slam === 0 ? Math.sin(time * 45) * 0.03 : 0;

    for (const [i, limb] of this._limbs.entries()) {
      limb.position.x = 0;
      limb.rotation.z = (i === 0 ? 1 : -1) * stride * 0.5;
    }
    const weight = t.moving ? Math.sin(this._gait.phase - 0.6) : 0;
    const lean = -0.28 + raise * 0.4 - slam * 0.35 + breathe * 0.015 - trip * 0.12;
    this.body.rotation.z = lean;
    this.body.position.x = BRUTE_HIP * Math.sin(lean) + slam * 0.1 - raise * 0.04;
    this.body.position.y = BRUTE_HIP * (1 - Math.cos(lean)) - step * 0.05 + breathe * 0.006 + raise * 0.04 - slam * 0.08 - trip * 0.05;
    this.body.rotation.x = weight * BRUTE_ROLL + trip * 0.1 * this._stumble.side + tremble;
    this.body.position.z = weight * BRUTE_SHIFT;

    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 3 + Math.random() * 4;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN * 0.6;
    }
    this._headYaw += ((t.hunting || attacking ? 0 : this._headTarget) - this._headYaw) * Math.min(1, dt * 1.2);
    this._head.rotation.y = this._headYaw;
    this._head.rotation.x = 0;
    this._head.rotation.z = -0.1 + step * 0.12 + raise * 0.3 - slam * 0.3 + breathe * 0.03;

    for (const [i, arm] of [this._armL, this._armR].entries()) {
      const side = i === 0 ? 1 : -1;
      if (attacking) {
        this._armAngle[i] = BRUTE_ARM_HANG + raise * 3.5 + slam * 0.8 + tremble;
        this._armSpeed[i] = 0;
      } else {
        const want = BRUTE_ARM_HANG + (t.hunting ? 0.3 : 0) + stride * 0.35 * side - step * 0.15 + breathe * 0.03;
        this._armSpeed[i] += (BRUTE_ARM_STIFFNESS * (want - this._armAngle[i]) - BRUTE_ARM_DAMPING * this._armSpeed[i]) * Math.min(dt, 1 / 30);
        this._armAngle[i] += this._armSpeed[i] * Math.min(dt, 1 / 30);
      }
      arm.rotation.z = this._armAngle[i];
      arm.rotation.y = 0;
      arm.rotation.x = stride * 0.06 * side;
    }
  }
}
