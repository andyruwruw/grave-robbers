// Packages
import { Group } from 'three';
import { GEAR } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { buildSpade } from '../../models/gear/tools';
import { ChargeGlows } from './charge-glows';
import { SKIN } from './config/player-look';
import { DRUM_SPIN } from './config/player-timing';
import { gearKeyOf } from './helpers/gear-key';
import { whipBend } from './helpers/whip-bend';
import { HeldModels } from './held-models';
import { PlayerArmor } from './player-armor';
import { PlayerOffhand } from './player-offhand';

// Types
import type { Mesh } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { VoxelParts } from '../shared/voxel-parts';
import type { PlayerLocomotion } from './player-locomotion';
import type { PlayerRig } from './player-rig';
import type { HeldModel } from './types/held-model';

/**
 * Everything a player can hold or wear, each built the first time it's
 * equipped (plain or infused) and kept: the weapon in the tool hand, the
 * spade, the off hand (see `PlayerOffhand`), the left gauntlet, the charge
 * glows, and every armor.
 */
export class PlayerGear {
  /**
   * The weapons in the tool hand (the hammer when empty).
   */
  private _weapons = new HeldModels();

  /**
   * The weapon in hand, or null (digging, or a thrown glaive).
   */
  private _held: HeldModel | null = null;

  /**
   * How fast the repeating crossbow's drum is turning.
   */
  private _drumSpin = 0;

  /**
   * The spade, shown while digging.
   */
  private _spade = new Group();

  /**
   * The left hand's gauntlet (matching the right's infusion).
   */
  private _leftFists = new HeldModels();

  /**
   * The glow of a gauntlet's charge on both fists.
   */
  private _chargeGlows = new ChargeGlows();

  /**
   * The off hand: lantern, torch, or shield.
   */
  private _offhand = new PlayerOffhand();

  /**
   * Every armor.
   */
  private _armor = new PlayerArmor();

  /**
   * What was last shown (see `gearKeyOf`), to notice changes.
   */
  private _gearKey = '';

  /**
   * The edge of what's in hand that leaves the swing streak, or null.
   */
  blade: Mesh | null = null;

  /**
   * Builds both arms, the spade, the lanterns, and the armor, and puts them
   * on the body; weapons, torches, and shields are built as they're first
   * equipped.
   * @param rig The figure.
   * @param parts The avatar's boxes.
   * @param color The player's color, for the sleeves.
   */
  build(rig: PlayerRig, parts: VoxelParts, color: string): void {
    const { box } = parts;
    rig.tool.position.set(0, 0.56, -0.23);
    rig.tool.add(
      box([0.09, 0.2, 0.09], [0, -0.1, 0], color),
      box([0.08, 0.06, 0.08], [0, -0.21, 0], SKIN),
    );
    rig.wrist.position.set(0, -0.21, 0);
    rig.wrist.add(rig.grip);
    this._weapons.mount(rig.grip, box);
    this._spade.add(...buildSpade(box));
    this._spade.visible = false;
    rig.grip.add(this._spade);
    rig.tool.add(rig.wrist);
    rig.lanternArm.position.set(0, 0.56, 0.23);
    rig.lanternArm.add(
      box([0.09, 0.2, 0.09], [0, -0.1, 0], color),
      box([0.08, 0.06, 0.08], [0, -0.21, 0], SKIN),
    );
    this._leftFists.mount(rig.lanternArm, box, (group: Group): void => {
      group.position.y = -0.21;
    });
    this._chargeGlows.build(box, rig.wrist, rig.lanternArm);
    this._offhand.build(rig, box);
    this._armor.build(box);
    rig.body.add(rig.tool, rig.lanternArm, this._armor.plate);
  }

  /**
   * Shows the equipped weapon (with its infusion), off-hand piece, and
   * armor (the hammer and the lantern when a slot is empty; the lantern
   * moves to the belt behind a shield, or while the gauntlets or the
   * two-handed infused hammer fill both hands). Something drawn for a
   * moment (the plain hammer for a job, a stake for a vampire) takes the
   * weapon's place; a thrown glaive leaves the hand empty.
   * @param target The player's state.
   */
  apply(target: PlayerState): void {
    const weapon = target.drawn ?? target.gear.weapon;
    const infusion = target.drawn ? null : target.gearInfusion?.weapon ?? null;
    const digging = target.digging;
    this._gearKey = gearKeyOf(target);
    this._held = this._weapons.show(digging || target.thrown ? null : weapon ?? 'hammer', infusion);
    this.blade = this._held && !(weapon && GEAR[weapon].weapon?.ranged) ? this._held.model.tip : null;
    this._spade.visible = digging;
    const fists = weapon === 'spiked-gauntlet';
    this._leftFists.show(fists ? 'spiked-gauntlet' : null, infusion);
    this._offhand.show(target, fists || weapon === 'infused-hammer');
    this._armor.show(target.gear.armor);
  }

  /**
   * Shows the gear again if anything about it changed (see `gearKeyOf`).
   * @param target The player's state.
   */
  refresh(target: PlayerState): void {
    if (gearKeyOf(target) !== this._gearKey) {
      this.apply(target);
    }
  }

  /**
   * Bends the whip's joints: unwinding from its coil and trailing behind on
   * the windup, a wave rolling down it as it comes forward, snapping
   * straight at the crack, hanging loose and swaying, then winding back
   * into its coil at rest (past phase 1).
   * @param phase How far through the swing (past 1 while resting).
   * @param time Seconds since the renderer started.
   * @param from How coiled the whip was when the swing started, 0 to 1.
   */
  curl(phase: number, time: number, from: number): void {
    const joints = this._held?.model.joints;
    if (joints) {
      for (let i = 0; i < joints.length; i++) {
        joints[i].rotation.z = whipBend(phase, time, i, i / (joints.length - 1), from);
      }
    }
  }

  /**
   * Poses the off arm (see `PlayerOffhand.pose`).
   * @param rig The figure.
   * @param target The player's state.
   * @param locomotion The walk (its phase, run, and side).
   * @param block How far the shield is raised, 0 to 1.
   * @param lean How far the body leans with the swing.
   */
  poseOffhand(rig: PlayerRig, target: PlayerState, locomotion: PlayerLocomotion, block: number, lean: number): void {
    this._offhand.pose(rig, target, locomotion, block, lean);
  }

  /**
   * Starts the repeating crossbow's drum spinning (a swing fired).
   */
  spinUp(): void {
    this._drumSpin = DRUM_SPIN;
  }

  /**
   * Moves everything that moves on its own each frame: eases the drum's
   * spin off and turns it, pulses the charge glows, flickers the torch, and
   * runs the infused models' motion (wisps, embers, motes).
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param target The player's state.
   */
  step(dt: number, time: number, target: PlayerState): void {
    this._drumSpin = Math.max(0, this._drumSpin - dt * DRUM_SPIN * 2);
    const held = this._held?.model;
    if (held?.spinner) {
      held.spinner.rotation.y += this._drumSpin * dt;
    }
    held?.animate?.(time, dt, target);
    this._leftFists.shown?.model.animate?.(time, dt, target);
    this._chargeGlows.update(target, time);
    this._offhand.step(time, dt, target);
  }
}
