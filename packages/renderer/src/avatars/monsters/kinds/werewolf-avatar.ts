// Packages
import { Group } from 'three';
import { WEREWOLF_LEAP_TIME, WEREWOLF_POUNCE_WINDUP } from '@halloween/shared/monsters/kinds/werewolf';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { mix } from '../../../helpers/angles';
import { shadeHex } from '../../../helpers/colors';
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import {
  WEREWOLF_EYE,
  WEREWOLF_FANG,
  WEREWOLF_FURS,
  WEREWOLF_HOWL,
  WEREWOLF_LAND,
  WEREWOLF_MOUTH,
  WEREWOLF_PALE,
  WEREWOLF_PANTS,
} from './config/werewolf';

// Types
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { TrailStyle } from '../types/trail-style';

/**
 * A werewolf: stalks hunched on two legs, drops to all fours to run you
 * down, claws, and pounces.
 */
export class WerewolfAvatar extends ChargingMonsterAvatar {
  /**
   * Everything above the hips, pivoting there so it can drop forward.
   */
  private _torso = new Group();

  /**
   * Its lower jaw.
   */
  private _jaw = new Group();

  /**
   * How far down on all fours it is, 0 to 1, eased.
   */
  private _fours = 0;

  /**
   * Pounces seen so far.
   */
  private _pounces: number;

  /**
   * Seconds into the current pounce.
   */
  private _pounceAge = WEREWOLF_POUNCE_WINDUP + WEREWOLF_LEAP_TIME + WEREWOLF_LAND;

  /**
   * Seconds since it last threw its head back to howl (as it spots
   * someone).
   */
  private _howlAge = 10;

  /**
   * Whether it was hunting last frame.
   */
  private _wasHunting = false;

  /**
   * Starts a werewolf at the state's position (call `assemble()` next).
   * @param state The first server state.
   */
  constructor(state: MonsterState) {
    super(state);
    this._pounces = state.swipes;
  }

  /**
   * A werewolf: a hulking, hunched wolf-man in torn trousers, broad
   * furred shoulders over a narrow waist, a paler chest, long arms ending
   * in hooked claws, bent wolf legs, and a long-snouted head with pointed
   * ears, burning eyes, and a jaw full of fangs that hangs open.
   */
  protected build(): void {
    const { box, eye } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const fur = WEREWOLF_FURS[Math.floor(rand() * WEREWOLF_FURS.length)];
    const dark = shadeHex(fur, 0.7);
    this._size = 1.3 + rand() * 0.1;
    for (const side of [-1, 1]) {
      const leg = new Group();
      leg.position.set(0, 0.42, 0.12 * side);
      const shin = new Group();
      shin.position.set(0.06, -0.22, 0);
      shin.rotation.z = -0.5;
      shin.add(
        box([0.09, 0.22, 0.09], [0, -0.1, 0], fur),
        box([0.16, 0.05, 0.1], [0.05, -0.22, 0], dark),
        box([0.04, 0.02, 0.1], [0.14, -0.235, 0], WEREWOLF_FANG),
      );
      leg.add(box([0.14, 0.24, 0.14], [0.03, -0.1, 0], WEREWOLF_PANTS), shin);
      leg.rotation.z = 0.25;
      this._limbs.push(leg);
      this.body.add(leg);
    }
    this._torso.position.set(0, 0.42, 0);
    this._torso.add(
      box([0.22, 0.14, 0.28], [0, 0.04, 0], WEREWOLF_PANTS),
      ...this._parts.roundedBox([0.3, 0.24, 0.32], [0.01, 0.18, 0], fur),
      ...this._parts.roundedBox([0.36, 0.26, 0.5], [0.04, 0.36, 0], fur),
      box([0.04, 0.26, 0.26], [0.2, 0.3, 0], WEREWOLF_PALE),
      box([0.24, 0.1, 0.12], [-0.08, 0.5, 0], dark),
    );
    this._head.position.set(0.2, 0.48, 0);
    this._jaw.position.set(0.12, -0.02, 0);
    this._jaw.add(
      box([0.18, 0.04, 0.1], [0.08, -0.02, 0], WEREWOLF_PALE),
      box([0.16, 0.02, 0.08], [0.08, 0.005, 0], WEREWOLF_MOUTH),
      box([0.02, 0.035, 0.015], [0.15, 0.02, -0.03], WEREWOLF_FANG),
      box([0.02, 0.035, 0.015], [0.15, 0.02, 0.03], WEREWOLF_FANG),
    );
    this._head.add(
      ...this._parts.roundedBox([0.2, 0.2, 0.22], [0.02, 0.06, 0], fur),
      box([0.2, 0.08, 0.12], [0.2, 0.04, 0], fur),
      box([0.04, 0.04, 0.05], [0.3, 0.07, 0], '#141010'),
      box([0.16, 0.02, 0.1], [0.2, 0.0, 0], WEREWOLF_MOUTH),
      box([0.02, 0.04, 0.015], [0.27, -0.02, -0.04], WEREWOLF_FANG),
      box([0.02, 0.04, 0.015], [0.27, -0.02, 0.04], WEREWOLF_FANG),
      eye([0.03, 0.025, 0.04], [0.12, 0.1, -0.06], WEREWOLF_EYE),
      eye([0.03, 0.025, 0.04], [0.12, 0.1, 0.06], WEREWOLF_EYE),
      box([0.05, 0.12, 0.05], [-0.02, 0.2, -0.07], dark),
      box([0.05, 0.12, 0.05], [-0.02, 0.2, 0.07], dark),
      box([0.12, 0.08, 0.2], [-0.08, 0.08, 0], dark),
      this._jaw,
    );
    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.06, 0.42, 0.27 * side);
      arm.add(
        box([0.3, 0.12, 0.12], [0.13, 0, 0], fur),
        box([0.24, 0.09, 0.09], [0.38, 0, 0], fur),
        box([0.07, 0.08, 0.1], [0.52, 0, 0], dark),
        box([0.08, 0.015, 0.015], [0.59, -0.02, -0.035], WEREWOLF_FANG),
        box([0.08, 0.015, 0.015], [0.6, -0.02, 0], WEREWOLF_FANG),
        box([0.08, 0.015, 0.015], [0.59, -0.02, 0.035], WEREWOLF_FANG),
      );
    }
    this._torso.add(this._head, this._armL, this._armR);
    this.body.add(this._torso);
  }

  /**
   * A blow rocks the torso at the hips (half as much as a zombie), not the
   * whole body at the feet: the body pitched forward on all fours would
   * swing through the ground and leave the legs behind.
   */
  protected applyKick(): void {
    this._head.rotation.y += this._kick.yaw;
    this._head.rotation.z += this._kick.pitch;
    this._torso.rotation.z += this._kick.recoil * 0.5;
  }

  /**
   * A pale streak behind each set of claws.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._armL, [0.6, 0, 0]], [this._armR, [0.6, 0, 0]]], color: WEREWOLF_FANG, opacity: 0.22, size: 0.12 };
  }

  /**
   * Restarts the pounce on a new one, and ages it.
   * @param dt Seconds since the last frame.
   */
  protected beforeUpdate(dt: number): void {
    const t = this.target;
    if (t.swipes !== this._pounces) {
      this._pounces = t.swipes;
      this._pounceAge = 0;
    }
    this._pounceAge = Math.min(this._pounceAge + dt, WEREWOLF_POUNCE_WINDUP + WEREWOLF_LEAP_TIME + WEREWOLF_LAND);
    this._howlAge = t.hunting && !this._wasHunting ? 0 : this._howlAge + dt;
    this._wasHunting = t.hunting;
  }

  /**
   * The claws streak through a swipe and through a pounce's leap.
   * @returns True mid-swipe or mid-leap.
   */
  protected swinging(): boolean {
    const p = this._pounceAge;
    return super.swinging() || (p >= WEREWOLF_POUNCE_WINDUP && p < WEREWOLF_POUNCE_WINDUP + WEREWOLF_LEAP_TIME);
  }

  /**
   * Stalks hunched on two legs, arms hanging. Spotting someone, it throws
   * its head back and howls, then drops onto all fours and gallops, front and hind legs in pairs. Its claws come up and back,
   * then rake down across. To pounce it crouches low, then springs, arms
   * flung ahead and legs stretched back.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   */
  protected animate(dt: number, time: number, stride: number): void {
    const t = this.target;
    const { charge, strike } = this.attackPhase();
    const p = this._pounceAge;
    const crouch = p < WEREWOLF_POUNCE_WINDUP ? (p / WEREWOLF_POUNCE_WINDUP) ** 0.6 : 0;
    const leap = p >= WEREWOLF_POUNCE_WINDUP && p < WEREWOLF_POUNCE_WINDUP + WEREWOLF_LEAP_TIME ? (p - WEREWOLF_POUNCE_WINDUP) / WEREWOLF_LEAP_TIME : 0;
    const air = Math.sin(leap * Math.PI);
    const stretch = leap > 0 ? Math.min(1, (1 - leap) * 4, leap * 6) : 0;
    const clawing = charge + strike > 0;
    this._fours += ((t.hunting && t.moving && !clawing && this._howlAge > WEREWOLF_HOWL ? 1 : 0) - this._fours) * Math.min(1, dt * 6);
    const f = this._fours;
    const ph = this._gait.phase;
    const gallop = Math.sin(ph);
    const howl = Math.max(0, Math.min(1, this._howlAge / 0.25, (WEREWOLF_HOWL - this._howlAge) / 0.3));

    this._torso.rotation.z = mix(-0.3 + charge * 0.25 - strike * 0.35 + howl * 0.35, -1.15 + gallop * 0.12, f) - crouch * 0.6 + stretch * 0.3;
    this.body.position.y = f * Math.abs(gallop) * 0.05 - crouch * 0.1 + air * 0.4 + Math.sin(time * 2 + ph) * 0.006;
    for (const [i, leg] of this._limbs.entries()) {
      const walk = (i === 0 ? stride : -stride) * 0.55;
      leg.rotation.z = mix(mix(0.25 + walk, 0.4 + gallop * 0.7, f), -0.6, stretch) + crouch * 0.9;
    }
    const reach = mix(-1.25 + (t.moving ? stride * 0.3 : 0), -0.45 - gallop * 0.7, f);
    this._armR.rotation.z = mix(mix(mix(reach, 1.9, charge), -0.9, strike), 0.4, stretch) - crouch * 0.4;
    this._armL.rotation.z = mix(mix(mix(reach, 1.4, charge), -0.3, strike * 0.8), 0.4, stretch) - crouch * 0.4;
    this._armR.rotation.x = 0.35 * charge - 0.5 * strike;
    this._armL.rotation.x = -0.25 * charge + 0.4 * strike;

    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 0.4 + Math.random() * 1.6;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._headYaw += ((t.hunting || clawing ? 0 : this._headTarget) - this._headYaw) * Math.min(1, dt * 10);
    this._head.rotation.y = this._headYaw;
    this._head.rotation.z = -this._torso.rotation.z * 0.7 - 0.2 + howl * 0.9 + Math.sin(time * 2.5 + ph) * 0.03;
    this._jaw.rotation.z = -(t.hunting ? 0.25 : 0.08) - charge * 0.3 - crouch * 0.35 - howl * 0.5;
  }
}
