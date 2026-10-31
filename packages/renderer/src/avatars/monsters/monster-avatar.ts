// Packages
import { Group } from 'three';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { NO_BLOOM_LAYER } from '../../effects/post/config/post';
import { hexColor } from '../../helpers/colors';
import { angleDelta } from '../../helpers/angles';
import { Avatar } from '../avatar';
import { FOLLOW_RATE } from '../config/avatar';
import { VoxelParts } from '../shared/voxel-parts';
import {
  MONSTER_SCALE,
  SWOOSH_TIME,
  TURN_RATE,
  ZOMBIE_ATTACK_TIME,
} from './config/monster-motion';
import { AttackClock } from './attack-clock';
import { flailLimbs } from './helpers/flail-limbs';
import { HitKick } from './hit-kick';
import { MonsterGait } from './monster-gait';
import { MonsterGlow } from './monster-glow';
import { MonsterSwoosh } from './monster-swoosh';
import { ShadowBlink } from './shadow-blink';
import { Stumble } from './stumble';

// Types
import type { Object3D } from 'three';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { TrailStyle } from './types/trail-style';

/**
 * A voxel monster, facing +x in its local space. Smooths toward the server
 * state and animates walking, attacking, hits, and stumbling; each kind
 * builds its own body and animates it. Most are lit by the light map (with
 * glowing eyes); ghosts glow on their own. One a necromancer wards pulses
 * green, and what's afflicting it shows (`MonsterGlow`). Always made
 * through `createMonsterAvatar`, which calls `assemble()` once the
 * subclass's fields exist.
 */
export abstract class MonsterAvatar extends Avatar<MonsterState> {
  /**
   * Legs (or boots) that step with the stride.
   */
  protected _limbs: Object3D[] = [];

  /**
   * The left arm.
   */
  protected _armL = new Group();

  /**
   * The right arm.
   */
  protected _armR = new Group();

  /**
   * Its build's scale (on top of MONSTER_SCALE).
   */
  protected _size = 1;

  /**
   * Its walk cycle.
   */
  protected _gait = new MonsterGait();

  /**
   * Times its attacks.
   */
  protected _attack: AttackClock;

  /**
   * Which way it's looking, relative to its body.
   */
  protected _headYaw = 0;

  /**
   * Where it wants to look (see headYaw).
   */
  protected _headTarget = 0;

  /**
   * When it next picks somewhere new to look (see headYaw).
   */
  protected _nextLookAt = 0;

  /**
   * Goes up each time a brute's fists hit the ground, for the renderer's
   * dust and shake.
   */
  impactCount = 0;

  /**
   * How hard this monster shakes the trees around it right now (only
   * brutes do).
   */
  quake = 0;

  /**
   * Its shadow steps.
   */
  protected _blink: ShadowBlink;

  /**
   * Its stumbles.
   */
  protected _stumble: Stumble;

  /**
   * Its hit reaction.
   */
  protected _kick = new HitKick();

  /**
   * The streak its attack leaves, if its kind has one.
   */
  private _swoosh = new MonsterSwoosh();

  /**
   * Its hurt flash, ward, and afflictions' glow.
   */
  private _glow = new MonsterGlow();

  /**
   * Starts a monster at the state's position (call `assemble()` next).
   * @param state The first server state.
   */
  constructor(state: MonsterState) {
    super(state, new VoxelParts({ glowLayer: NO_BLOOM_LAYER }));
    this._attack = new AttackClock(state.attacks, MONSTERS[state.kind].windup);
    this._stumble = new Stumble(state.stumbles);
    this._blink = new ShadowBlink(state.blinks);
  }

  /**
   * Builds the body, times the attack, wires the swoosh, and sizes it.
   */
  assemble(): void {
    this.build();
    this._attack.setDuration(this.attackDuration());
    this._swoosh.build(this.trail, this.trailStyle());
    this.group.add(this.body);
    this.group.scale.setScalar(MONSTER_SCALE * this._size);
  }

  /**
   * Builds this kind's body from boxes.
   */
  protected abstract build(): void;

  /**
   * Poses the body for this frame.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param stride The walk cycle, -1 to 1 (0 standing).
   * @param trip How far into a stumble, 0 to 1.
   * @param lunge How far into a lunge, 0 to 1.
   * @param coil How far through the windup, 0 to 1.
   */
  protected abstract animate(dt: number, time: number, stride: number, trip: number, lunge: number, coil: number): void;

  /**
   * How long one attack plays.
   * @returns Seconds.
   */
  protected attackDuration(): number {
    return ZOMBIE_ATTACK_TIME;
  }

  /**
   * Where its swoosh comes from and how it looks.
   * @returns The style, or null for no swoosh.
   */
  protected trailStyle(): TrailStyle | null {
    return null;
  }

  /**
   * Runs first each frame, before any smoothing.
   * @param _dt Seconds since the last frame.
   */
  protected beforeUpdate(_dt: number): void {}

  /**
   * Called when a new attack starts.
   */
  protected onAttackStart(): void {}

  /**
   * Adds the hit reaction to the pose: the head and the body.
   */
  protected applyKick(): void {
    this._head.rotation.y += this._kick.yaw;
    this._head.rotation.z += this._kick.pitch;
    this.body.rotation.z += this._kick.recoil;
  }

  /**
   * Whether the attack is drawing its swoosh right now.
   * @returns True mid-swing.
   */
  protected swinging(): boolean {
    const { age, windup } = this._attack;
    return age >= windup * 0.85 && age < windup + SWOOSH_TIME[this.target.kind];
  }

  /**
   * How much a blow rocks it (1 for a zombie).
   * @returns The scale on the hit reaction.
   */
  protected heft(): number {
    return 1;
  }

  /**
   * Kicks the legs and flaps the arms while held up by the TV's mouse.
   * Runs after `update`.
   * @param amount 0 (on the ground) to 1 (fully lifted).
   * @param time Seconds since the renderer started.
   */
  flail(amount: number, time: number): void {
    flailLimbs(this._limbs, this._armL, this._armR, this._head, this._gait.phase, amount, time);
  }

  /**
   * Advances smoothing and animation.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param groundHeight Ground height under it (plus any lift).
   */
  update(dt: number, time: number, groundHeight: number): void {
    const t = this.target;
    this.beforeUpdate(dt);
    if (this._blink.update(dt, t.blinks)) {
      this._x = t.x;
      this._y = t.y;
      this._facing = t.facing;
    }
    const wasX = this._x;
    const wasY = this._y;
    const k = 1 - Math.exp(-FOLLOW_RATE * dt);
    const kPos = this.exact ? 1 : k;
    this._x += (t.x - this._x) * kPos;
    this._y += (t.y - this._y) * kPos;
    this._elevation += (groundHeight - this._elevation) * k;
    this._gait.step(dt, Math.hypot(this._x - wasX, this._y - wasY), t.moving, t.kind);
    const turn = angleDelta(this._facing, t.facing) * k;
    const maxTurn = TURN_RATE[t.kind] * dt;
    this._facing += Math.max(-maxTurn, Math.min(maxTurn, turn));

    if (this._attack.update(dt, t.attacks)) {
      this.onAttackStart();
    }
    const trip = this._stumble.update(dt, t.stumbles);
    const stride = t.moving ? Math.sin(this._gait.phase) : 0;
    if (this._limbs.length === 2) {
      this._limbs[0].position.x = stride * 0.08;
      this._limbs[1].position.x = -stride * 0.08;
    }
    this._kick.step(dt);
    this.animate(dt, time, stride, trip, this._attack.lunge, this._attack.coil);
    this.applyKick();

    this.placeGroup();
    this._swoosh.update(dt, this.swinging(), this.group);

    this._glow.update(dt, time, this.advanceHurt(dt), t, this._gait.phase, this.group, this._parts.lit);
  }

  /**
   * A blow landed: the head snaps the way it was hit (back if struck from
   * the front, sideways from the side) and the body rocks, then both
   * spring back.
   * @param angle The blow's direction, a tile-space angle.
   */
  knock(angle: number): void {
    this._kick.knock(angle - this._facing, this.heft());
  }

  /**
   * Tints its eyes for a world event (see `EventModifiers.eyes`).
   * @param eyes The color and how far toward it, or null.
   */
  tintEyes(eyes: { color: string; amount: number } | null): void {
    this._parts.tintEyes(eyes ? hexColor(eyes.color) : null, eyes?.amount ?? 0);
  }

  /**
   * Disposes its materials, its swoosh's, and its afflictions'.
   */
  dispose(): void {
    super.dispose();
    this._swoosh.dispose();
    this._glow.dispose();
  }
}
