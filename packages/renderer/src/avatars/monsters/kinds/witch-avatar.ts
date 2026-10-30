// Packages
import { Group } from 'three';
import { WITCH_SWIPE } from '@halloween/shared/monsters/kinds/witch';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { mix } from '../../../helpers/angles';
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import {
  BROOM_HANDLE,
  BROOM_STRAW,
  BROOM_TIE,
  POTION_CORK,
  POTION_PURPLE,
  SWIPE_FOLLOW,
  WITCH_BAND,
  WITCH_BELT,
  WITCH_BOOT,
  WITCH_BROW,
  WITCH_CLAW,
  WITCH_EYE,
  WITCH_FANG,
  WITCH_HAIR,
  WITCH_HAT,
  WITCH_ROBES,
  WITCH_SKIN,
  WITCH_WART,
} from './config/witch';

// Types
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { TrailStyle } from '../types/trail-style';

/**
 * A witch: hobbles about, hurls potions, and swipes with her broom.
 */
export class WitchAvatar extends ChargingMonsterAvatar {
  /**
   * The potion in her right hand.
   */
  private _flask = new Group();

  /**
   * The broom in her left hand.
   */
  private _broom = new Group();

  /**
   * Broom swipes seen so far.
   */
  private _swipes: number;

  /**
   * Seconds into the current broom swipe.
   */
  private _swipeAge = WITCH_SWIPE.windup + SWIPE_FOLLOW;

  /**
   * Starts a witch at the state's position (call `assemble()` next).
   * @param state The first server state.
   */
  constructor(state: MonsterState) {
    super(state);
    this._swipes = state.swipes;
  }

  /**
   * A witch: a bell of a robe in stepped layers with boots peeking out, a
   * green face with a long hooked nose and yellow eyes under stringy gray
   * hair, a tall pointed hat with a bent tip, a glowing purple potion in
   * her right hand and a broom in her left.
   */
  protected build(): void {
    const { box } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const robe = WITCH_ROBES[Math.floor(rand() * WITCH_ROBES.length)];
    this._size = 1.1 + rand() * 0.1;
    for (const side of [-1, 1]) {
      const boot = box([0.12, 0.05, 0.08], [0.06, 0.025, 0.07 * side], WITCH_BOOT);
      this._limbs.push(boot);
      this.group.add(boot);
    }
    this.body.add(
      box([0.42, 0.12, 0.46], [-0.01, 0.1, 0], robe),
      box([0.36, 0.12, 0.4], [0, 0.21, 0], robe),
      box([0.3, 0.12, 0.34], [0, 0.32, 0], robe),
      box([0.27, 0.03, 0.31], [0, 0.39, 0], WITCH_BELT),
      box([0.26, 0.14, 0.3], [0, 0.44, 0], robe),
      box([0.22, 0.06, 0.34], [0, 0.53, 0], robe),
    );
    const tip = box([0.06, 0.09, 0.06], [-0.09, 0.49, 0], WITCH_HAT);
    tip.rotation.z = 0.5;
    this._head.position.set(0.04, 0.56, 0);
    this._head.add(
      ...this._parts.roundedBox([0.19, 0.19, 0.19], [0, 0.1, 0], WITCH_SKIN),
      box([0.07, 0.035, 0.035], [0.12, 0.09, 0], WITCH_SKIN),
      box([0.03, 0.04, 0.035], [0.16, 0.07, 0], WITCH_SKIN),
      box([0.03, 0.045, 0.06], [0.1, 0.13, -0.05], WITCH_EYE, true),
      box([0.03, 0.045, 0.06], [0.1, 0.13, 0.05], WITCH_EYE, true),
      box([0.025, 0.02, 0.07], [0.1, 0.165, -0.05], WITCH_BROW),
      box([0.025, 0.02, 0.07], [0.1, 0.165, 0.05], WITCH_BROW),
      box([0.02, 0.035, 0.11], [0.1, 0.04, 0], '#1a0c08'),
      box([0.022, 0.025, 0.02], [0.105, 0.05, -0.035], WITCH_FANG),
      box([0.022, 0.025, 0.02], [0.105, 0.05, 0.03], WITCH_FANG),
      box([0.03, 0.03, 0.03], [0.09, 0.09, -0.07], WITCH_WART),
      box([0.09, 0.24, 0.24], [-0.08, 0.04, 0], WITCH_HAIR),
      box([0.05, 0.16, 0.04], [0.02, 0.02, -0.11], WITCH_HAIR),
      box([0.05, 0.16, 0.04], [0.02, 0.02, 0.11], WITCH_HAIR),
      box([0.4, 0.03, 0.4], [-0.01, 0.21, 0], WITCH_HAT),
      box([0.21, 0.03, 0.21], [-0.01, 0.24, 0], WITCH_BAND),
      box([0.2, 0.08, 0.2], [-0.01, 0.27, 0], WITCH_HAT),
      box([0.15, 0.08, 0.15], [-0.03, 0.34, 0], WITCH_HAT),
      box([0.1, 0.08, 0.1], [-0.05, 0.41, 0], WITCH_HAT),
      tip,
    );
    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.01, 0.49, 0.17 * side);
      arm.add(
        box([0.24, 0.09, 0.09], [0.12, 0, 0], robe),
        box([0.06, 0.06, 0.06], [0.28, 0, 0], WITCH_SKIN),
        box([0.07, 0.015, 0.015], [0.33, -0.02, -0.02], WITCH_CLAW),
        box([0.07, 0.015, 0.015], [0.33, -0.02, 0.02], WITCH_CLAW),
      );
    }
    this._flask.position.set(0.31, 0.05, 0);
    this._flask.add(box([0.09, 0.09, 0.09], [0, 0, 0], POTION_PURPLE, true), box([0.035, 0.05, 0.035], [0, 0.065, 0], POTION_CORK));
    this._armR.add(this._flask);
    this._broom.position.set(0.28, 0, 0);
    this._broom.add(
      box([0.6, 0.025, 0.025], [0.08, 0, 0], BROOM_HANDLE),
      box([0.04, 0.05, 0.05], [0.37, 0, 0], BROOM_TIE),
      box([0.14, 0.08, 0.08], [0.45, 0, 0], BROOM_STRAW),
      box([0.06, 0.1, 0.1], [0.5, 0, 0], BROOM_STRAW),
    );
    this._armL.add(this._broom);
    this.body.add(this._head, this._armL, this._armR);
  }

  /**
   * A purple streak behind the broom's straw.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._broom, [0.46, 0, 0]]], color: POTION_PURPLE, opacity: 0.35, size: 0.16 };
  }

  /**
   * Restarts the broom swipe on a new one, and ages it.
   * @param dt Seconds since the last frame.
   */
  protected beforeUpdate(dt: number): void {
    const t = this.target;
    if (t.swipes !== this._swipes) {
      this._swipes = t.swipes;
      this._swipeAge = 0;
    }
    this._swipeAge = Math.min(this._swipeAge + dt, WITCH_SWIPE.windup + SWIPE_FOLLOW);
  }

  /**
   * The broom streaks through the fast part of its swipe.
   * @returns True mid-swipe.
   */
  protected swinging(): boolean {
    return this._swipeAge >= WITCH_SWIPE.windup * 0.9 && this._swipeAge < WITCH_SWIPE.windup + 0.16;
  }

  /**
   * Hobbles hunched with her robe swaying. To throw, she points at her
   * target with her free hand and draws the potion back over her shoulder,
   * leaning back, then hurls it forward (it's gone from her hand until the
   * next one). The broom swipe sweeps it out to the side and whips it
   * across.
   * @param _dt Seconds since the last frame (unused).
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   */
  protected animate(_dt: number, time: number, stride: number): void {
    const t = this.target;
    const a = this._attack.age;
    const { charge, strike } = this.attackPhase();
    const throwing = a < this._attack.time;
    this.body.position.y = Math.abs(stride) * 0.015 + Math.sin(time * 2 + this._gait.phase) * 0.008;
    this.body.rotation.z = -0.14 + charge * 0.18 - strike * 0.22;
    this.body.rotation.x = stride * 0.07 + Math.sin(time * 1.3 + this._gait.phase) * 0.025;
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 2 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._head.rotation.y = t.hunting || throwing ? 0 : this._headTarget * 0.7;
    this._head.rotation.z = -0.08 + charge * 0.2 - strike * 0.1;
    let arm = t.hunting ? -0.9 : -1.2 + stride * 0.2;
    if (a < this._attack.windup) {
      arm = mix(arm, 2.6, charge);
    } else if (throwing) {
      const s = (a - this._attack.windup) / (this._attack.time - this._attack.windup);
      arm = s < 0.2 ? mix(2.6, -0.1, s / 0.2) : mix(-0.1, -0.9, (s - 0.2) / 0.8);
    }
    this._armR.rotation.z = arm;
    this._flask.visible = !(a >= this._attack.windup && throwing);
    const sw = this._swipeAge;
    const sweep = WITCH_SWIPE.windup;
    let broomZ = mix(t.hunting ? -0.6 : -0.75 - stride * 0.15, -0.05, charge);
    let broomY = -0.25 * charge;
    let twist = 0;
    if (sw < sweep) {
      const k = sw / sweep;
      const e = k * k * (3 - 2 * k);
      broomZ = mix(broomZ, -0.15, e);
      broomY = mix(broomY, 1.3, e);
      twist = 0.35 * e;
    } else if (sw < sweep + SWIPE_FOLLOW) {
      const k = (sw - sweep) / SWIPE_FOLLOW;
      const fast = Math.min(1, k / 0.35);
      broomZ = mix(-0.15, broomZ, Math.max(0, (k - 0.35) / 0.65));
      broomY = mix(mix(1.3, -1.5, fast), broomY, Math.max(0, (k - 0.35) / 0.65));
      twist = mix(mix(0.35, -0.45, fast), 0, Math.max(0, (k - 0.35) / 0.65));
    }
    this._armL.rotation.z = broomZ;
    this._armL.rotation.y = broomY;
    this.body.rotation.y = twist;
  }
}
