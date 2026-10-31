// Packages
import { Group } from 'three';
import { GHOUL_LEAP_TIME } from '@halloween/shared/monsters/kinds/ghoul';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { mix } from '../../../helpers/angles';
import { shadeHex } from '../../../helpers/colors';
import { pick as pickFrom } from '../../../helpers/pick';
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { HEAD_TURN } from '../config/monster-motion';
import { SWOOSH, ZOMBIE_PANTS, ZOMBIE_SHIRTS } from '../config/monster-palette';
import {
  GHOUL_EYE,
  GHOUL_HAIR,
  GHOUL_SKINS,
  GHOUL_TEETH,
} from './config/ghoul';

// Types
import type { TrailStyle } from '../types/trail-style';

/**
 * One of a ghoul's limbs, in two parts that bend at the middle joint.
 */
interface CrawlLimb {
  /**
   * The upper part, hinged at the body.
   */
  upper: Group;

  /**
   * The lower part, hinged at the middle joint.
   */
  lower: Group;

  /**
   * Whether it's an arm (true) or a leg.
   */
  front: boolean;

  /**
   * Which side it's on, -1 or 1.
   */
  side: number;
}

/**
 * A ghoul: bounds along on all fours like a spider and pounces.
 */
export class GhoulAvatar extends ChargingMonsterAvatar {
  /**
   * Its arms and legs.
   */
  private _crawl: CrawlLimb[] = [];

  /**
   * A ghoul: a gaunt, gray-skinned person down on all fours in torn
   * clothes, hunched low with its shoulders below its hips. Long splayed
   * arms bend at the elbow; its long hind legs fold with the knees jutting
   * up above its back and its feet tucked under its middle, like a spider.
   * Its head hangs low between its shoulders under long black hair,
   * glowing eyes and an open mouth of teeth showing through. Each limb
   * bends at its middle joint.
   */
  protected build(): void {
    const { box, eye } = this._parts;
    const rand = seededRandom(this.target.id * 7919 + 13);
    const skin = GHOUL_SKINS[Math.floor(rand() * GHOUL_SKINS.length)];
    const shirt = pickFrom(rand, ZOMBIE_SHIRTS);
    const pants = pickFrom(rand, ZOMBIE_PANTS);
    const dark = shadeHex(skin, 0.72);
    this._size = 1.2 + rand() * 0.15;
    this.body.add(
      ...this._parts.roundedBox([0.15, 0.14, 0.22], [-0.2, 0.36, 0], pants),
      ...this._parts.roundedBox([0.18, 0.13, 0.23], [-0.06, 0.32, 0], shirt),
      ...this._parts.roundedBox([0.2, 0.14, 0.27], [0.1, 0.27, 0], shirt),
      box([0.07, 0.04, 0.29], [-0.04, 0.26, 0], dark),
      box([0.04, 0.025, 0.04], [-0.14, 0.44, 0], dark),
      box([0.04, 0.025, 0.04], [-0.04, 0.4, 0], dark),
      box([0.04, 0.025, 0.04], [0.06, 0.36, 0], dark),
      box([0.08, 0.04, 0.06], [0.1, 0.345, -0.08], skin),
      box([0.08, 0.04, 0.06], [0.1, 0.345, 0.08], skin),
    );
    this._head.position.set(0.22, 0.22, 0);
    this._head.add(
      ...this._parts.roundedBox([0.16, 0.16, 0.15], [0.07, 0, 0], skin),
      box([0.15, 0.04, 0.16], [0.06, 0.085, 0], GHOUL_HAIR),
      box([0.12, 0.24, 0.04], [0.07, -0.08, -0.08], GHOUL_HAIR),
      box([0.12, 0.24, 0.04], [0.07, -0.08, 0.08], GHOUL_HAIR),
      box([0.04, 0.2, 0.15], [-0.01, -0.04, 0], GHOUL_HAIR),
      eye([0.02, 0.022, 0.03], [0.15, 0.02, -0.04], GHOUL_EYE),
      eye([0.02, 0.022, 0.03], [0.15, 0.02, 0.04], GHOUL_EYE),
      box([0.02, 0.05, 0.08], [0.15, -0.05, 0], '#1a0e0e'),
      box([0.022, 0.015, 0.07], [0.152, -0.03, 0], GHOUL_TEETH),
    );
    for (const side of [-1, 1]) {
      const upper = new Group();
      upper.position.set(0.14, 0.28, 0.15 * side);
      upper.rotation.x = 0.35 * side;
      const lower = new Group();
      lower.position.set(0, -0.17, 0);
      lower.add(
        box([0.045, 0.17, 0.045], [0, -0.085, 0], skin),
        box([0.09, 0.03, 0.07], [0.035, -0.17, 0], skin),
        box([0.035, 0.02, 0.07], [0.085, -0.175, 0], dark),
      );
      upper.add(box([0.055, 0.17, 0.055], [0, -0.085, 0], skin), box([0.07, 0.07, 0.07], [0, -0.03, 0], shirt), lower);
      this._crawl.push({ upper, lower, front: true, side });
      this.body.add(upper);
    }
    for (const side of [-1, 1]) {
      const upper = new Group();
      upper.position.set(-0.2, 0.34, 0.12 * side);
      upper.rotation.x = 0.45 * side;
      const lower = new Group();
      lower.position.set(0, 0.3, 0);
      lower.add(
        box([0.06, 0.58, 0.06], [0, -0.29, 0], pants),
        box([0.065, 0.06, 0.065], [0, 0, 0], dark),
        box([0.13, 0.04, 0.07], [0.04, -0.58, 0], skin),
      );
      upper.add(box([0.075, 0.3, 0.075], [0, 0.15, 0], pants), lower);
      this._crawl.push({ upper, lower, front: false, side });
      this.body.add(upper);
    }
    this.body.add(this._head);
  }

  /**
   * The windup, the leap, and a moment to land.
   * @returns Seconds.
   */
  protected attackDuration(): number {
    return this._attack.windup + GHOUL_LEAP_TIME + 0.3;
  }

  /**
   * A streak behind its jaws.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._head, [0.15, 0, 0]]], color: SWOOSH, opacity: 0.14, size: 0.14 };
  }

  /**
   * Bounds along low on hands and feet: both hands reach out together,
   * then both feet, the body rocking front to back and the joints folding
   * as each pair lifts, the head twitching. Its legs keep pace with how
   * fast it's really going (see `update`). To pounce it gathers itself
   * lower still, arms and legs folded under it, knees high, then springs:
   * arms reaching out ahead, legs flung back straight, nose up then down as
   * it lands.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   */
  protected animate(dt: number, time: number): void {
    const t = this.target;
    const a = this._attack.age;
    const crouch = a < this._attack.windup ? (a / this._attack.windup) ** 0.6 : 0;
    const leap = a >= this._attack.windup && a < this._attack.windup + GHOUL_LEAP_TIME ? (a - this._attack.windup) / GHOUL_LEAP_TIME : 0;
    const air = Math.sin(leap * Math.PI);
    const stretch = leap > 0 ? Math.min(1, (1 - leap) * 4, leap * 6) : 0;
    const run = t.moving && leap === 0 ? 1 : 0;
    const ph = this._gait.phase;
    for (const limb of this._crawl) {
      const at = ph + (limb.front ? 0 : Math.PI);
      const swing = Math.sin(at) * run;
      const lift = Math.max(0, Math.cos(at)) * run;
      const rest = limb.front ? [0.35 + swing * 0.6, -0.5 - lift * 0.6] : [-0.75 + swing * 0.4, 0.85 + lift * 0.3];
      const coiled = limb.front ? [0.6, -1.1] : [-1.05, 1.4];
      const flung = limb.front ? [1.4, -0.2] : [-0.1, 0.3];
      limb.upper.rotation.z = mix(mix(rest[0], coiled[0], crouch), flung[0], stretch);
      limb.lower.rotation.z = mix(mix(rest[1], coiled[1], crouch), flung[1], stretch);
    }
    this.body.position.y = run * Math.abs(Math.sin(ph)) * 0.035 - crouch * 0.07 + air * 0.3 + (run ? 0 : Math.sin(time * 2.2 + ph) * 0.005);
    this.body.rotation.z = run * Math.sin(ph) * 0.09 - crouch * 0.06 + (leap > 0 ? 0.2 * Math.cos(leap * Math.PI) : 0);
    this.body.rotation.x = 0;
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 0.3 + Math.random() * 1.5;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._headYaw += ((t.hunting || crouch > 0 ? 0 : this._headTarget) - this._headYaw) * Math.min(1, dt * 14);
    this._head.rotation.y = this._headYaw;
    this._head.rotation.z = 0.2 + crouch * 0.3 + Math.sin(time * 3 + ph) * 0.03;
  }
}
