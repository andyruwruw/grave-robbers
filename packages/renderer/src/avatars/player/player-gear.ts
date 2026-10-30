// Packages
import { Group } from 'three';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { buildGearModel } from '../../models/gear/gear-model';
import { buildLantern, buildSpade } from '../../models/gear/tools';
import { buildWhip } from '../../models/gear/whip';
import { ChargeGlows } from './charge-glows';
import { SKIN } from './config/player-look';
import {
  ARM_BLOCK,
  ARM_BLOCK_YAW,
  ARM_PUMP,
  ARM_SHIELD,
  ARM_TORCH,
} from './config/player-poses';
import { DRUM_SPIN } from './config/player-timing';
import { whipBend } from './helpers/whip-bend';
import { PlayerArmor } from './player-armor';

// Types
import type { Mesh } from 'three';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { VoxelParts } from '../shared/voxel-parts';
import type { PlayerLocomotion } from './player-locomotion';
import type { PlayerRig } from './player-rig';

/**
 * Everything a player can hold or wear, built once and shown as it's
 * equipped: every weapon in the tool hand, the spade, the lantern, torch,
 * and shield in the off hand (or the lantern on the belt), the left
 * gauntlet, the charge glows, and every armor.
 */
export class PlayerGear {
  /**
   * Each weapon's model in the tool hand (the hammer when empty), with the
   * edge that leaves the swing streak.
   */
  private _weapons = new Map<GearKind | 'hammer', { group: Group; tip: Mesh | null }>();

  /**
   * The morning star's whip joints, coiled and cracked by `curl`.
   */
  private _whipJoints: Group[] = [];

  /**
   * The repeating crossbow's drum.
   */
  private _drum: Group | null = null;

  /**
   * How fast the drum is turning.
   */
  private _drumSpin = 0;

  /**
   * The spade, shown while digging.
   */
  private _spade = new Group();

  /**
   * The left hand's gauntlet.
   */
  private _leftFist = new Group();

  /**
   * The glow of a gauntlet's charge on both fists.
   */
  readonly chargeGlows = new ChargeGlows();

  /**
   * Each off-hand piece's model (the lantern when empty).
   */
  private _offhands = new Map<GearKind | 'lantern', Group>();

  /**
   * The lantern on the belt (behind a shield, or with bare gauntlets).
   */
  private _beltLantern = new Group();

  /**
   * Every armor.
   */
  private _armor = new PlayerArmor();

  /**
   * The shield standing square in front while blocking.
   */
  private _frontShield = new Group();

  /**
   * The torch's flame.
   */
  private _torchFlame: Mesh | null = null;

  /**
   * What was last shown (weapon, off hand, armor, digging), to notice
   * changes.
   */
  gearKey = '';

  /**
   * The edge of what's in hand that leaves the swing streak, or null.
   */
  blade: Mesh | null = null;

  /**
   * Builds both arms with everything they can hold, the belt lantern, the
   * armor, and the front shield, and puts them on the body.
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
    for (const kind of GEAR_KINDS.filter((k: GearKind): boolean => GEAR[k].slot === 'weapon')) {
      const group = new Group();
      let model: { tip: Mesh | null };
      if (kind === 'morning-star') {
        const whip = buildWhip(box);
        group.add(whip.root);
        this._whipJoints = whip.joints;
        model = whip;
      } else {
        const built = buildGearModel(kind, box);
        group.add(...built.parts);
        model = built;
        if (built.spinner) {
          this._drum = built.spinner;
        }
      }
      rig.grip.add(group);
      this._weapons.set(kind, { group, tip: model.tip });
    }
    this._spade.add(...buildSpade(box));
    this._spade.visible = false;
    rig.grip.add(this._spade);
    rig.tool.add(rig.wrist);

    /**
     * Builds a fresh set of lantern boxes.
     * @returns The lantern meshes.
     */
    const lantern = (): Mesh[] => buildLantern(box);
    rig.lanternArm.position.set(0, 0.56, 0.23);
    rig.lanternArm.add(
      box([0.09, 0.2, 0.09], [0, -0.1, 0], color),
      box([0.08, 0.06, 0.08], [0, -0.21, 0], SKIN),
    );
    this._leftFist.add(...buildGearModel('spiked-gauntlet', box).parts);
    this._leftFist.position.y = -0.21;
    this._leftFist.visible = false;
    rig.lanternArm.add(this._leftFist);
    this.chargeGlows.build(box, rig.wrist, rig.lanternArm);
    const handLantern = new Group();
    handLantern.add(...lantern());
    this._offhands.set('lantern', handLantern);
    for (const kind of ['torch', 'shield'] as const) {
      const model = buildGearModel(kind, box);
      const group = new Group();
      group.add(...model.parts);
      group.position.y = kind === 'torch' ? -0.21 : 0;
      this._offhands.set(kind, group);
      this._torchFlame ??= model.flame;
    }
    rig.lanternArm.add(...this._offhands.values());
    this._beltLantern.add(...lantern());
    this._beltLantern.position.set(0.03, 0.52, 0.2);
    this._beltLantern.scale.setScalar(0.8);
    this._armor.build(box);
    this._frontShield.add(...buildGearModel('shield', box).parts);
    this._frontShield.rotation.y = Math.PI / 2;
    this._frontShield.visible = false;
    rig.body.add(rig.tool, rig.lanternArm, this._beltLantern, this._armor.plate, this._frontShield);
  }

  /**
   * Shows the equipped weapon, off-hand piece, and armor (the hammer and
   * the lantern when a slot is empty; the lantern moves to the belt behind
   * a shield). Something drawn for a moment (the hammer for a job, a stake
   * for a vampire) takes the weapon's place.
   * @param target The player's state.
   */
  apply(target: PlayerState): void {
    const { offhand, armor } = target.gear;
    const weapon = target.drawn ?? target.gear.weapon;
    const digging = target.digging;
    this.gearKey = `${weapon}|${offhand}|${armor}|${digging}`;
    for (const [kind, { group, tip }] of this._weapons) {
      group.visible = !digging && kind === (weapon ?? 'hammer');
      if (group.visible) {
        this.blade = weapon && GEAR[weapon].weapon?.ranged ? null : tip;
      }
    }
    this._spade.visible = digging;
    if (digging) {
      this.blade = null;
    }
    const fists = weapon === 'spiked-gauntlet';
    for (const [kind, group] of this._offhands) {
      group.visible = !fists && kind === (offhand ?? 'lantern');
    }
    this._leftFist.visible = fists;
    this._beltLantern.visible = offhand === 'shield' || (fists && !offhand);
    this._armor.show(armor);
  }

  /**
   * Bends the whip's joints: trailing behind on the windup, a wave rolling
   * down it as it comes forward, snapping straight at the crack, then
   * hanging loose and swaying (phase 1 and after).
   * @param phase How far through the swing, 0 to 1.
   * @param time Seconds since the renderer started.
   */
  curl(phase: number, time: number): void {
    this._whipJoints.forEach((joint: Group, i: number): void => {
      const k = i / (this._whipJoints.length - 1);
      joint.rotation.z = whipBend(phase, time, i, k);
    });
  }

  /**
   * Swings the lantern with the walk, holds a torch up high, or keeps a
   * shield forward.
   * @param rig The figure.
   * @param target The player's state.
   * @param locomotion The walk (its phase, run, and side).
   * @param block How far the shield is raised, 0 to 1.
   * @param lean How far the body leans with the swing.
   */
  poseOffhand(rig: PlayerRig, target: PlayerState, locomotion: PlayerLocomotion, block: number, lean: number): void {
    const offhand = target.gear.offhand;
    const sway = Math.sin(locomotion.walkPhase);
    rig.lanternArm.rotation.x = 0;
    const raised = offhand === 'shield' && block > 0.5;
    this._frontShield.visible = raised;
    this._frontShield.position.set(0.15 + 0.08 * block, 0.58, 0.02);
    this._offhands.get('shield')!.visible = offhand === 'shield' && !raised;
    rig.lanternArm.rotation.y = offhand === 'shield' ? ARM_BLOCK_YAW * block : 0;
    if (offhand === 'torch') {
      rig.lanternArm.rotation.z = ARM_TORCH + lean * 0.3 - sway * 0.06;
    } else if (offhand === 'shield') {
      rig.lanternArm.rotation.z = ARM_SHIELD + (ARM_BLOCK - ARM_SHIELD) * block + lean * 0.3 * (1 - block);
    } else {
      rig.lanternArm.rotation.z = 0.35 + lean * 0.8 + sway * (0.25 + ARM_PUMP * Math.min(1, Math.hypot(locomotion.run, locomotion.side)));
    }
  }

  /**
   * Starts the repeating crossbow's drum spinning (a swing fired).
   */
  spinUp(): void {
    this._drumSpin = DRUM_SPIN;
  }

  /**
   * Eases the drum's spin off and turns it.
   * @param dt Seconds since the last frame.
   */
  spinDrum(dt: number): void {
    this._drumSpin = Math.max(0, this._drumSpin - dt * DRUM_SPIN * 2);
    if (this._drum) {
      this._drum.rotation.y += this._drumSpin * dt;
    }
  }

  /**
   * Flickers the torch's flame.
   * @param time Seconds since the renderer started.
   */
  flickerTorch(time: number): void {
    if (this._torchFlame) {
      this._torchFlame.scale.set(0.11 * (1 + Math.sin(time * 23) * 0.12), 0.15 * (1 + Math.sin(time * 31 + 1) * 0.22), 0.11);
    }
  }
}
