// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { NECRO_NOVA_WINDUP } from '@halloween/shared/monsters/kinds/necromancer';

// Local Imports
import { mix } from '../../../helpers/angles';
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import {
  NECRO_BONE,
  NECRO_GLOW,
  NECRO_HAND,
  NECRO_HOLLOW,
  NECRO_ROBES,
  NECRO_STAFF,
} from './config/necromancer';

// Types
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { TrailStyle } from '../types/trail-style';

/**
 * Seconds the staff takes to come back up after a nova's slam.
 */
const NOVA_SLAM = 0.35;

/**
 * A necromancer: glides about in its robes, keeps its distance, and
 * raises the dead with its staff.
 */
export class NecromancerAvatar extends ChargingMonsterAvatar {
  /**
   * The staff in its right hand.
   */
  private _staff = new Group();

  /**
   * The glowing orb atop the staff, which swells as it casts.
   */
  private _orb = new Group();

  /**
   * The novas counted so far (`swipes`), to spot a new one.
   */
  private _novas: number;

  /**
   * Seconds since its latest nova started.
   */
  private _novaAge = NECRO_NOVA_WINDUP + NOVA_SLAM;

  /**
   * @param state The necromancer's first snapshot.
   */
  constructor(state: MonsterState) {
    super(state);
    this._novas = state.swipes;
  }

  /**
   * Starts the nova's staff slam when a new one is counted.
   * @param dt Seconds since the last frame.
   */
  protected beforeUpdate(dt: number): void {
    if (this.target.swipes !== this._novas) {
      this._novas = this.target.swipes;
      this._novaAge = 0;
    }
    this._novaAge = Math.min(this._novaAge + dt, NECRO_NOVA_WINDUP + NOVA_SLAM);
  }

  /**
   * Draws the swoosh through a cast's strike and a nova's slam.
   * @returns True mid-swing.
   */
  protected swinging(): boolean {
    return super.swinging() || (this._novaAge >= NECRO_NOVA_WINDUP * 0.8 && this._novaAge < NECRO_NOVA_WINDUP + NOVA_SLAM * 0.6);
  }

  /**
   * A necromancer: a tall, narrow robe falling to the ground with a bone
   * trim, a deep hood over a bare skull with green fire in its sockets, a
   * mantle of small bones across its shoulders, bony hands, and a
   * gnarled staff topped with a skull and a glowing green orb.
   */
  protected build(): void {
    const { box, eye } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const robe = NECRO_ROBES[Math.floor(rand() * NECRO_ROBES.length)];
    this._size = 1.12 + rand() * 0.08;
    this.body.add(
      box([0.36, 0.14, 0.4], [0, 0.07, 0], robe),
      box([0.37, 0.03, 0.41], [0, 0.02, 0], NECRO_BONE),
      box([0.3, 0.18, 0.34], [0, 0.23, 0], robe),
      box([0.26, 0.2, 0.3], [0, 0.42, 0], robe),
      box([0.24, 0.06, 0.38], [0, 0.55, 0], NECRO_BONE),
      box([0.05, 0.04, 0.05], [0.12, 0.55, -0.12], NECRO_HOLLOW),
      box([0.05, 0.04, 0.05], [0.12, 0.55, 0.12], NECRO_HOLLOW),
    );
    this._head.position.set(0.02, 0.6, 0);
    this._head.add(
      box([0.24, 0.26, 0.26], [-0.02, 0.12, 0], robe),
      box([0.12, 0.1, 0.12], [-0.12, 0.26, 0], robe),
      box([0.03, 0.2, 0.2], [0.1, 0.1, 0], NECRO_HOLLOW),
      ...this._parts.roundedBox([0.14, 0.15, 0.15], [0.06, 0.09, 0], NECRO_BONE),
      box([0.02, 0.04, 0.04], [0.135, 0.11, -0.035], NECRO_HOLLOW),
      box([0.02, 0.04, 0.04], [0.135, 0.11, 0.035], NECRO_HOLLOW),
      eye([0.022, 0.022, 0.022], [0.14, 0.11, -0.035], NECRO_GLOW),
      eye([0.022, 0.022, 0.022], [0.14, 0.11, 0.035], NECRO_GLOW),
      box([0.02, 0.03, 0.08], [0.135, 0.03, 0], NECRO_HOLLOW),
    );
    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.02, 0.5, 0.17 * side);
      arm.add(
        box([0.24, 0.09, 0.09], [0.12, 0, 0], robe),
        box([0.05, 0.05, 0.05], [0.27, 0, 0], NECRO_HAND),
        box([0.06, 0.012, 0.012], [0.31, -0.01, -0.015], NECRO_HAND),
        box([0.06, 0.012, 0.012], [0.31, -0.01, 0.015], NECRO_HAND),
      );
    }
    this._orb.position.set(0, 0.5, 0);
    this._orb.add(box([0.07, 0.07, 0.07], [0, 0, 0], NECRO_GLOW, true));
    this._staff.position.set(0.28, 0, 0);
    this._staff.add(
      box([0.03, 0.9, 0.03], [0, 0.05, 0], NECRO_STAFF),
      box([0.05, 0.04, 0.05], [0.01, 0.3, 0], NECRO_STAFF),
      ...this._parts.roundedBox([0.09, 0.08, 0.08], [0, 0.42, 0], NECRO_BONE),
      box([0.015, 0.02, 0.02], [0.045, 0.43, -0.02], NECRO_HOLLOW),
      box([0.015, 0.02, 0.02], [0.045, 0.43, 0.02], NECRO_HOLLOW),
      this._orb,
    );
    this._armR.add(this._staff);
    this.body.add(this._head, this._armL, this._armR);
  }

  /**
   * A green streak behind the staff's orb as it comes down.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._staff, [0, 0.5, 0]]], color: NECRO_GLOW, opacity: 0.35, size: 0.12 };
  }

  /**
   * Glides with its robe swaying and barely a step showing, the orb
   * pulsing. To cast it lifts its staff and its free hand high, leaning
   * back as the orb swells, then drives the staff down into the ground
   * with its other hand clawing at the earth. Its nova is the same swing,
 * quicker: the staff goes up over the windup and slams down as it blasts.
   * @param _dt Seconds since the last frame (unused).
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   */
  protected animate(_dt: number, time: number, stride: number): void {
    const t = this.target;
    const cast = this.attackPhase();
    const a = this._novaAge;
    const charge = Math.max(cast.charge, a < NECRO_NOVA_WINDUP ? (a / NECRO_NOVA_WINDUP) ** 0.7 : 0);
    const strike = Math.max(cast.strike, a >= NECRO_NOVA_WINDUP && a < NECRO_NOVA_WINDUP + NOVA_SLAM ? 1 - (a - NECRO_NOVA_WINDUP) / NOVA_SLAM : 0);
    this.body.position.y = Math.sin(time * 1.8 + this._gait.phase) * 0.012 + charge * 0.04;
    this.body.rotation.x = stride * 0.04;
    this.body.rotation.z = -0.06 - charge * 0.12 + strike * 0.3;
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 1.5 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._head.rotation.y = t.hunting || charge > 0 ? 0 : this._headTarget * 0.6;
    this._head.rotation.z = -charge * 0.25 + strike * 0.2;
    const rest = t.hunting ? -0.5 : -0.7 + stride * 0.1;
    this._armR.rotation.z = mix(mix(rest, 1.6, charge), -0.2, strike);
    this._staff.rotation.z = -this._armR.rotation.z + mix(0, -0.5, strike);
    this._armL.rotation.z = mix(mix(t.hunting ? -0.9 : -1.2, 2.2, charge), -0.9, strike);
    this._armL.rotation.x = -0.3 * charge;
    this._orb.scale.setScalar(1 + Math.sin(time * 4 + this._gait.phase) * 0.12 + charge * 0.9);
  }
}
