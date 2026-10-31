// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { MonsterAvatar } from '../monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import {
  BLOATER_BOIL,
  BLOATER_EYE,
  BLOATER_RAGS,
  BLOATER_SKINS,
  BLOATER_SWELL,
  BLOATER_VEIN,
} from './config/bloater';

/**
 * A bloater: a swollen zombie that waddles up to you and bursts.
 */
export class BloaterAvatar extends MonsterAvatar {
  /**
   * Its gut, which heaves as it breathes and swells before it bursts.
   */
  private _gut = new Group();

  /**
   * A bloater: a huge round gut on short legs, mottled with veins and
   * glowing boils, rags stretched over it, thin arms that barely reach
   * round it, and a small head sunk into its shoulders with a slack mouth.
   */
  protected build(): void {
    const { box, eye } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const skin = BLOATER_SKINS[Math.floor(rand() * BLOATER_SKINS.length)];
    this._size = 1 + rand() * 0.12;
    for (const side of [-1, 1]) {
      const leg = box([0.13, 0.2, 0.13], [0, 0.1, 0.12 * side], BLOATER_RAGS);
      this._limbs.push(leg);
      this.group.add(leg);
    }
    this._gut.position.set(0, 0.42, 0);
    this._gut.add(
      ...this._parts.roundedBox([0.52, 0.46, 0.58], [0.02, 0, 0], skin),
      box([0.4, 0.12, 0.6], [-0.04, -0.17, 0], BLOATER_RAGS),
      box([0.02, 0.18, 0.03], [0.28, 0.05, -0.1], BLOATER_VEIN),
      box([0.02, 0.03, 0.14], [0.28, 0.12, 0.04], BLOATER_VEIN),
      box([0.02, 0.14, 0.03], [0.28, -0.02, 0.15], BLOATER_VEIN),
    );
    for (let i = 0; i < 5; i++) {
      const angle = (rand() - 0.5) * 2.4;
      const up = (rand() - 0.4) * 0.3;
      this._gut.add(box([0.06, 0.06, 0.06], [0.02 + Math.cos(angle) * 0.27, up, Math.sin(angle) * 0.3], BLOATER_BOIL, true));
    }
    this._head.position.set(0.08, 0.66, 0);
    this._head.add(
      ...this._parts.roundedBox([0.22, 0.2, 0.22], [0, 0.08, 0], skin),
      eye([0.03, 0.04, 0.05], [0.11, 0.11, -0.05], BLOATER_EYE),
      eye([0.03, 0.03, 0.04], [0.11, 0.12, 0.05], BLOATER_EYE),
      box([0.03, 0.07, 0.1], [0.11, 0.02, 0], '#1e1a0e'),
    );
    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.04, 0.56, 0.3 * side);
      arm.add(box([0.22, 0.07, 0.07], [0.11, 0, 0], skin), box([0.07, 0.07, 0.07], [0.24, 0, 0], skin));
    }
    this.body.add(this._gut, this._head, this._armL, this._armR);
  }

  /**
   * Its windup, then the burst (it's gone).
   * @returns Seconds.
   */
  protected attackDuration(): number {
    return this._attack.windup + 0.1;
  }

  /**
   * A gut packed this full barely rocks when hit.
   * @returns The scale on the hit reaction.
   */
  protected heft(): number {
    return 0.5;
  }

  /**
   * Waddles side to side, its gut heaving as it breathes. Through its
   * windup the gut swells and shudders faster and faster, arms flung out
   * and head thrown back.
   * @param _dt Seconds since the last frame (unused).
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   * @param _trip How far into a stumble (unused).
   * @param _lunge How far into a lunge (unused).
   * @param coil How far through the windup, 0 to 1.
   */
  protected animate(_dt: number, time: number, stride: number, _trip: number, _lunge: number, coil: number): void {
    const breathe = Math.sin(time * 2.2 + this._gait.phase) * 0.03;
    const shake = coil > 0 ? Math.sin(time * (40 + coil * 40)) * 0.03 * coil : 0;
    const swell = 1 + breathe + BLOATER_SWELL * coil * coil + shake;
    this._gut.scale.set(swell, 1 + breathe * 0.5 + BLOATER_SWELL * 0.8 * coil * coil, swell);
    this.body.position.y = Math.abs(stride) * 0.02;
    this.body.rotation.x = stride * 0.12 + shake * 2;
    this.body.rotation.z = -0.04 + coil * 0.1;
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 1.5 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN * 0.6;
    }
    this._head.rotation.y = this.target.hunting || coil > 0 ? 0 : this._headTarget;
    this._head.rotation.z = coil * 0.5 + Math.sin(time * 1.7 + this._gait.phase) * 0.04;
    this._head.position.y = 0.66 + BLOATER_SWELL * 0.2 * coil;
    this._armL.rotation.z = -1 + stride * 0.3 + coil * 1.2;
    this._armR.rotation.z = -1 - stride * 0.3 + coil * 1.2;
    this._armL.rotation.x = -0.4 - coil * 0.6;
    this._armR.rotation.x = 0.4 + coil * 0.6;
    this._armL.position.z = -0.3 * (1 + BLOATER_SWELL * coil);
    this._armR.position.z = 0.3 * (1 + BLOATER_SWELL * coil);
  }
}
