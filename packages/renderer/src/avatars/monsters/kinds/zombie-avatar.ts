// Packages
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { ArmedMonsterAvatar } from '../armed-monster-avatar';
import {
  ARM_ARMED,
  ARM_DOWN,
  ARM_HALF,
  ARM_OUT,
  HEAD_CREEP,
  HEAD_SNAP,
  HEAD_TURN,
  MOOD_MIN,
  MOOD_SPREAD,
} from '../config/monster-motion';
import {
  ARMOR_DARK,
  ARMOR_IRON,
  ARMOR_RUST,
  SWOOSH,
  ZOMBIE_EYE,
  ZOMBIE_PANTS,
  ZOMBIE_SHIRTS,
} from '../config/monster-palette';
import {
  MOODS,
  ZOMBIE_BONE,
  ZOMBIE_HAIR,
  ZOMBIE_SKINS,
} from './config/zombie';
import { zombieAttackPose } from './helpers/zombie-attack-pose';

// Types
import type { TrailStyle } from '../types/trail-style';
import type { ZombieMood } from './types/moods';

/**
 * A zombie: lurches, reaches, stumbles, and looks around, and rears up and
 * slams down to attack.
 */
export class ZombieAvatar extends ArmedMonsterAvatar {
  /**
   * How far each arm droops below its pose.
   */
  private _droopL = 0;

  /**
   * How far the right arm droops below its pose.
   */
  private _droopR = 0;

  /**
   * How quickly the head turns toward where it wants to look.
   */
  private _headSpeed = HEAD_CREEP;

  /**
   * The head's nod, eased toward the mood's.
   */
  private _headPitch = 0;

  /**
   * What it's doing with itself while idle.
   */
  private _mood: ZombieMood = 'reach';

  /**
   * When the mood next changes.
   */
  private _moodUntil = 0;

  /**
   * Which arm goes up in the one-up mood.
   */
  private _raisedSide = 1;

  /**
   * The left arm's pose, easing toward the mood's.
   */
  private _armBaseL = 0;

  /**
   * The right arm's pose, easing toward the mood's.
   */
  private _armBaseR = 0;

  /**
   * How hunched its build is.
   */
  private _hunch = 0;

  /**
   * Whether it's missing its right arm.
   */
  private _oneArmed = false;

  /**
   * A zombie whose look is picked from its id: skin, clothes, hair, build,
   * a hunch, and sometimes a missing arm, showing ribs, or a slack jaw. A
   * piece of junk it carries sits in its hand, and a helmet or plate it
   * wears goes over its head or chest.
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
    const skin = pick(ZOMBIE_SKINS);
    const shirt = pick(ZOMBIE_SHIRTS);
    const pants = pick(ZOMBIE_PANTS);
    this._size = 0.9 + rand() * 0.2;
    this._hunch = rand() * 0.18;
    this._oneArmed = rand() < 0.15;

    const legL = box([0.14, 0.24, 0.14], [0, 0.12, -0.09], pants);
    const legR = box([0.14, 0.24, 0.14], [0, 0.12, 0.09], pants);
    this._limbs.push(legL, legR);
    this.group.add(legL, legR);
    this.body.add(box([0.28, 0.34, 0.4], [0, 0.41, 0], shirt));
    if (armor === 'plate') {
      this.body.add(
        box([0.32, 0.26, 0.44], [0.005, 0.45, 0], ARMOR_IRON),
        box([0.33, 0.04, 0.45], [0.005, 0.35, 0], ARMOR_DARK),
        box([0.02, 0.06, 0.08], [0.17, 0.5, 0.06], ARMOR_RUST),
      );
    }
    if (rand() < 0.6) {
      this.body.add(box([0.12, 0.1, 0.12], [0.1, 0.27 + rand() * 0.2, (rand() - 0.5) * 0.24], skin));
    }
    if (rand() < 0.2) {
      for (let i = 0; i < 3; i++) {
        this.body.add(box([0.02, 0.025, 0.18], [0.145, 0.38 + i * 0.06, 0], ZOMBIE_BONE));
      }
    }

    this._head.position.set(0.03, 0.58, 0);
    if (armor) {
      this._head.add(
        box([0.34, 0.1, 0.34], [-0.01, 0.27, 0], ARMOR_IRON),
        box([0.26, 0.06, 0.26], [-0.02, 0.34, 0], ARMOR_IRON),
        box([0.06, 0.12, 0.04], [0.17, 0.19, 0], ARMOR_DARK),
      );
    }
    this._head.add(
      ...this._parts.roundedBox([0.3, 0.3, 0.3], [0, 0.14, 0], skin),
      box([0.02, 0.07, 0.07], [0.16, 0.16, -0.07], '#1a1a12'),
      box([0.02, 0.07, 0.07], [0.16, 0.16, 0.07], '#1a1a12'),
      eye([0.03, 0.07, 0.07], [0.17, 0.16, -0.07], ZOMBIE_EYE),
      eye([0.03, 0.05, 0.06], [0.17, 0.17, 0.08], ZOMBIE_EYE),
      rand() < 0.25
        ? box([0.03, 0.09, 0.14], [0.16, 0.01, 0.01], '#2a1a12')
        : box([0.02, 0.04, 0.14], [0.16, 0.05, 0.01], '#2a1a12'),
    );
    const hair = armor ? 1 : rand();
    const hairColor = pick(ZOMBIE_HAIR);
    if (hair < 0.3) {
      this._head.add(box([0.18, 0.06, 0.2], [-0.07, 0.31, 0.05], hairColor));
    } else if (hair < 0.55) {
      this._head.add(
        box([0.06, 0.08, 0.06], [-0.02, 0.32, -0.08], hairColor),
        box([0.06, 0.1, 0.06], [-0.08, 0.33, 0.06], hairColor),
      );
    } else if (hair < 0.75) {
      this._head.add(
        box([0.32, 0.06, 0.32], [-0.01, 0.31, 0], hairColor),
        box([0.06, 0.24, 0.3], [-0.15, 0.12, 0], hairColor),
      );
    }

    for (const [arm, side] of [[this._armL, -1], [this._armR, 1]] as const) {
      arm.position.set(0.02, 0.54, 0.24 * side);
      if (side === 1 && this._oneArmed) {
        arm.add(box([0.12, 0.1, 0.1], [0.04, 0, 0], shirt));
      } else {
        arm.add(
          box([0.36, 0.1, 0.1], [0.18, 0, 0], shirt),
          box([0.1, 0.09, 0.09], [0.4, 0, 0], skin),
        );
      }
    }
    if (held) {
      this.mountHeld(this._oneArmed ? this._armL : this._armR, 0.4, held);
    }
    this.body.add(this._head, this._armL, this._armR);
    this._droopL = rand() * 0.35;
    this._droopR = rand() * 0.35;
  }

  /**
   * A streak behind each hand it has.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: this._oneArmed ? [[this._armL, [0.4, 0, 0]]] : [[this._armL, [0.4, 0, 0]], [this._armR, [0.4, 0, 0]]], color: SWOOSH, opacity: 0.14, size: 0.12 };
  }

  /**
   * Lurching sway kept small enough to stay inside its tile, plus a mood
   * that sets the arms and head: reaching out (always while hunting), hanging
   * limp with the head down, one arm up, or standing and slowly scanning
   * around. Poses blend into each other. A stumble buckles the knees and
   * flails the arms.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1.
   * @param trip How far into a stumble, 0 to 1.
   */
  protected animate(dt: number, time: number, stride: number, trip: number): void {
    const t = this.target;
    const { raise, slam } = zombieAttackPose(this._attack.age);
    const attacking = raise > 0 || slam > 0;
    if (t.hunting) {
      this._mood = 'reach';
      this._moodUntil = time + 1;
    } else if (time >= this._moodUntil) {
      let roll = Math.random();
      this._mood = MOODS.find(([, weight]): boolean => (roll -= weight) < 0)?.[0] ?? 'slack';
      this._moodUntil = time + MOOD_MIN + Math.random() * MOOD_SPREAD;
      this._raisedSide = Math.random() < 0.5 ? 1 : -1;
    }

    const slack = this._mood === 'slack';
    this.body.rotation.x = Math.sin(this._gait.phase * 0.5) * 0.1 + Math.sin(time * 0.7 + this._gait.phase) * 0.04 + trip * 0.12 * this._stumble.side;
    this.body.rotation.z = -0.1 - this._hunch - (slack ? 0.06 : 0) + raise * 0.15 - slam * 0.35 - trip * 0.18;
    this.body.position.x = slam * 0.16;
    this.body.position.y = -trip * 0.05;

    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 2 + Math.random() * 4;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN * (t.moving ? 0.5 : 1);
      this._headSpeed = Math.random() < 0.15 ? HEAD_SNAP : HEAD_CREEP;
      if (Math.random() < 0.3) {
        this._droopL = Math.random() * 0.35;
        this._droopR = Math.random() * 0.35;
      }
    }
    let yaw = this._headTarget;
    let pitch = 0;
    if (t.hunting || attacking) {
      yaw = this._headTarget * 0.2;
    } else if (this._mood === 'look') {
      yaw = Math.sin(time * 0.5 + this._gait.phase) * HEAD_TURN;
    } else if (slack) {
      yaw = this._headTarget * 0.4;
      pitch = -0.4;
    }
    const ease = Math.min(1, dt * this._headSpeed);
    this._headYaw += (yaw - this._headYaw) * ease;
    this._headPitch += (pitch - this._headPitch) * Math.min(1, dt * 1.5);
    this._head.rotation.y = this._headYaw;
    this._head.rotation.x = 0.12 + Math.sin(time * 0.9 + this._gait.phase) * 0.08;
    this._head.rotation.z = this._headPitch + Math.abs(stride) * 0.06 - trip * 0.2 + raise * 0.25 - slam * 0.45;

    /**
     * The resting arm angle the current mood gives one arm.
     * @param side Which arm (-1 or 1).
     * @returns The shoulder angle.
     */
    const pose = (side: number): number => {
      if (this.target.held && side === (this._oneArmed ? 1 : -1)) {
        return ARM_ARMED;
      }
      switch (this._mood) {
        case 'slack': return ARM_DOWN;
        case 'look': return ARM_HALF;
        case 'one-up': return side === this._raisedSide ? ARM_OUT : ARM_DOWN;
        default: return ARM_OUT;
      }
    };
    const blend = Math.min(1, dt * 2);
    this._armBaseL += (pose(1) - this._armBaseL) * blend;
    this._armBaseR += (pose(-1) - this._armBaseR) * blend;
    const swing = slack ? 0.3 : 0.18;
    const flail = Math.sin(this._stumble.age * 24) * trip;
    for (const [arm, base, droop, side] of [[this._armL, this._armBaseL, this._droopL, 1], [this._armR, this._armBaseR, this._droopR, -1]] as const) {
      arm.rotation.z = base - droop + stride * swing * side + Math.sin(time * 1.1 + this._gait.phase + side) * 0.08 + raise * 1.1 - slam * 0.9 + flail * 0.5 * side;
      arm.rotation.y = Math.sin(time * 0.7 + this._gait.phase * side) * 0.12 * side;
      arm.rotation.x = flail * 0.4 * side;
    }
  }
}
