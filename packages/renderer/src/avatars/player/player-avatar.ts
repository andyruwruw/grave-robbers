// Packages
import { Color } from 'three';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { SUPER_COMBO } from '@halloween/shared/gear/melee-rules';

// Local Imports
import { Avatar } from '../avatar';
import { FOLLOW_RATE } from '../config/avatar';
import { SwooshTrail } from '../shared/swoosh-trail';
import { VoxelParts } from '../shared/voxel-parts';
import { BuildMarker } from './build-marker';
import { DARK, TUNIC } from './config/player-look';
import { AIM_LEAN, ARM_PUMP, RUN_LEAN } from './config/player-poses';
import {
  BLOCK_RATE,
  HANG_END,
  IMPACT_END,
  SHOT_TIME,
  TRAIL_LIFE,
  TRAIL_POOL,
  TRAIL_SIZE,
  TRAIL_STEPS,
} from './config/player-timing';
import { pickMeleeMotion, pickShotMotion, RELOAD_MOTION } from './motions/motion-picker';
import { PlayerGear } from './player-gear';
import { PlayerLabel } from './player-label';
import { PlayerLocomotion } from './player-locomotion';
import { PlayerRig } from './player-rig';
import { PlayerShading } from './player-shading';
import { PlayerSwing } from './player-swing';
import { PlayerTurn } from './player-turn';

// Types
import type { Group, LineSegments, Object3D } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { PlacePreview } from '../../types/build';
import type { MotionContext } from './types/motion-context';

/**
 * A hooded graveyard keeper built from boxes, facing +x in its local space:
 * hood and cloak in the player's color, a muted tunic, a rounded head, a
 * weapon swung from the right shoulder, and a lantern carried in the left
 * hand. Smooths toward the latest server state each frame and animates
 * walking and swinging. Also owns the outline marking the tile it would
 * act on, and its name tag.
 */
export class PlayerAvatar extends Avatar<PlayerState> {
  /**
   * The jointed figure.
   */
  private _rig: PlayerRig;

  /**
   * Everything it can hold or wear.
   */
  private _gear: PlayerGear;

  /**
   * How it moves on its feet.
   */
  private _locomotion = new PlayerLocomotion();

  /** Turns the model toward the facing, lagging and overshooting a touch. */
  readonly turn = new PlayerTurn();

  /**
   * The streak behind the swinging blade.
   */
  private _swoosh: SwooshTrail;

  /**
   * The facing-tile outline and build preview.
   */
  private _buildMarker: BuildMarker;

  /**
   * The name tag (the renderer sets what it shows).
   */
  readonly nameTag: PlayerLabel;

  /**
   * The hurt flash, protection pulse, and haze.
   */
  private _shading = new PlayerShading();

  /**
   * Times its swings.
   */
  private _swing: PlayerSwing;

  /**
   * Seconds since a crossbow reload began.
   */
  private _reloadAge = 0;

  /**
   * How far the shield is raised, 0 to 1.
   */
  private _block = 0;

  /**
   * What the weapon motions read, refilled each frame.
   */
  private _motion: MotionContext = {
    time: 0,
    combo: 0,
    swingAge: 0,
    poseOffhand: (lean: number): void => this._gear.poseOffhand(this._rig, this.target, this._locomotion, this._block, lean),
  };

  /**
   * Builds the player's figure, gear, swoosh, marker, and name tag.
   * @param state The player's first state.
   * @param labelLayer Where the name tag goes.
   */
  constructor(state: PlayerState, labelLayer: HTMLElement) {
    super(state, new VoxelParts({ keepColors: true }));
    this.turn.snap(state.facing);
    this._swing = new PlayerSwing(state.swings);
    const cloak = `#${new Color(state.color).lerp(new Color(DARK), 0.4).getHexString()}`;
    const tunic = `#${new Color(state.color).lerp(new Color(TUNIC), 0.6).getHexString()}`;
    this._rig = new PlayerRig(this.body, this._head);
    this._rig.build(this._parts, state.color, cloak, tunic);
    this._gear = new PlayerGear();
    this._gear.build(this._rig, this._parts, state.color);
    this._gear.apply(state);
    this._swoosh = new SwooshTrail(this.trail, { poolPerSource: TRAIL_POOL, life: TRAIL_LIFE, steps: TRAIL_STEPS, size: TRAIL_SIZE, opacity: 0.25, color: new Color(state.color).multiplyScalar(0.5) });
    this._swoosh.addSource((): Object3D | null => this._gear.blade);
    this._rig.assemble(this.group);
    this._buildMarker = new BuildMarker(state.color);
    this.nameTag = new PlayerLabel(state, labelLayer);
  }

  /**
   * The name tag; the renderer positions it each frame.
   * @returns The tag's element.
   */
  get label(): HTMLDivElement {
    return this.nameTag.element;
  }

  /**
   * The facing-tile outline and build preview; the renderer adds it to the
   * scene.
   * @returns The marker's group.
   */
  get marker(): Group {
    return this._buildMarker.marker;
  }

  /**
   * Light red outline around whatever stops a build, in world space; the
   * renderer adds it to the scene.
   * @returns The outline.
   */
  get blocker(): LineSegments {
    return this._buildMarker.blocker;
  }

  /**
   * How bright the player's light is right now (dims with the spawn
   * protection pulse).
   * @returns 1 normally, lower mid-pulse.
   */
  get lightLevel(): number {
    return this._shading.pulse;
  }

  /**
   * Kicks the legs and flaps the arms while held up by the TV's mouse.
   * Runs after `update`.
   * @param amount 0 (on the ground) to 1 (fully lifted).
   * @param time Seconds since the renderer started.
   */
  flail(amount: number, time: number): void {
    if (amount > 0) {
      const kick = Math.sin(time * 15) * 0.7 * amount;
      this._rig.legL.rotation.z += kick;
      this._rig.legR.rotation.z -= kick;
      this._rig.lanternArm.rotation.z += Math.sin(time * 11) * 0.7 * amount;
      this._rig.tool.rotation.z += Math.sin(time * 11 + 2) * 0.5 * amount;
      this._head.rotation.z += Math.sin(time * 6) * 0.3 * amount;
    }
  }

  /**
   * Advances smoothing and animation. `time` drives the spawn-protection
   * pulse. Running tips the torso into the direction of travel, lengthens
   * and lifts the stride, and pumps the arms.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param groundHeight Ground height under it (plus any lift).
   */
  update(dt: number, time: number, groundHeight: number): void {
    const t = this.target;
    const { _rig: rig, _gear: gear, _locomotion: locomotion } = this;
    this.group.visible = !t.dead;
    this.nameTag.element.style.display = t.dead ? 'none' : '';
    if (t.dead) {
      this._x = t.x;
      this._y = t.y;
      this._hurts = t.hurts;
      return;
    }
    const k = this.exact ? 1 : 1 - Math.exp(-FOLLOW_RATE * dt);
    const dx = (t.x - this._x) * k;
    const dy = (t.y - this._y) * k;
    this._x += dx;
    this._y += dy;
    this._elevation = locomotion.settle(dt, t, k, groundHeight, this._elevation);
    this._facing = this.turn.step(dt, t.facing);
    locomotion.pose(dt, t, dx, dy, this._facing, rig, this.group);
    const { stride, speed, jumpPose, slumpPose: slump } = locomotion;

    gear.refresh(t);
    const seen = this._swing.track(t, time);
    if (seen === 'started') {
      gear.spinUp();
    }
    if (seen !== 'none' && t.combo === SUPER_COMBO) {
      locomotion.superHop(this._elevation);
    }
    this._reloadAge = t.reloading ? this._reloadAge + dt : 0;
    gear.step(dt, time, t);
    const swingTime = this._swing.advance(dt, t);
    this._block += ((t.blocking ? 1 : 0) - this._block) * Math.min(1, dt * BLOCK_RATE);
    this._motion.time = time;
    this._motion.combo = t.combo;
    this._motion.swingAge = this._swing.age;
    const infusion = t.drawn ? null : t.gearInfusion?.weapon ?? null;
    if (!t.drawn && t.gear.weapon && GEAR[t.gear.weapon].weapon?.ranged) {
      pickShotMotion(t.gear.weapon, infusion).apply(rig, t.aiming ? 1 : Math.min(1, this._swing.age / SHOT_TIME), this._motion);
      if (t.reloading) {
        RELOAD_MOTION.apply(rig, this._reloadAge);
      }
      if (t.aiming) {
        this.body.rotation.z -= AIM_LEAN;
      }
    } else {
      const held = t.drawn ?? t.gear.weapon;
      gear.curl(held === 'morning-star' ? this._swing.curlPhase() : 1, time, this._swing.from);
      pickMeleeMotion(held, t.digging, t.combo, infusion).apply(rig, this._swing.age / swingTime, this._motion);
      if (this._swing.age >= swingTime) {
        rig.tool.rotation.z -= stride * ARM_PUMP * speed;
      }
    }
    this._head.rotation.z += RUN_LEAN * 0.5 * Math.max(0, locomotion.run);
    if (slump > 0) {
      rig.lanternArm.rotation.z -= 0.3 * slump;
      rig.tool.rotation.z -= 0.5 * slump;
      this._head.rotation.z -= 0.75 * slump + Math.sin(time * 1.2) * 0.04 * slump;
    }
    if (jumpPose > 0) {
      rig.lanternArm.rotation.z += 2.2 * jumpPose;
      rig.tool.rotation.z += 1.6 * jumpPose;
      this._head.rotation.z += 0.3 * jumpPose;
    }

    this.placeGroup();
    const phase = this._swing.age / swingTime;
    this._swoosh.update(dt, gear.blade !== null && phase >= HANG_END && phase <= IMPACT_END && t.connected && !t.dead, this.group);
    this._shading.apply(this._parts, t, dt, time, this.advanceHurt(dt), this.group);
    this.nameTag.update(t);
  }

  /**
   * Starts a swing now, ahead of the server (/play's instant attacks); the
   * server's matching swing, if it comes within PREDICTED_SWING_WAIT, then
   * doesn't start it over.
   * @param time Seconds since the renderer started.
   */
  predictSwing(time: number): void {
    this._swing.predict(time);
    this._gear.spinUp();
  }

  /**
   * Outlines the tile this player would act on (see BuildMarker.show).
   * @param tile The tile to mark, or null to hide.
   * @param place The structure being placed, if any.
   * @param height Ground height the marker sits at.
   * @param facing Which way a turned structure will face, or null.
   */
  showMarker(tile: { tx: number; ty: number } | null, place: PlacePreview | null = null, height = 0, facing: number | null = null): void {
    this._buildMarker.show(this.target, tile, place, height, facing);
  }

  /**
   * Removes the name tag and disposes every material.
   */
  dispose(): void {
    this.nameTag.dispose();
    super.dispose();
    this._buildMarker.dispose();
    this._shading.dispose();
    this._swoosh.dispose();
  }
}
