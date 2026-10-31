// Packages
import { Group } from 'three';

// Local Imports
import { buildLantern } from '../../models/gear/tools';
import {
  ARM_BLOCK,
  ARM_BLOCK_YAW,
  ARM_PUMP,
  ARM_SHIELD,
  ARM_TORCH,
} from './config/player-poses';
import { HeldModels } from './held-models';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { BoxFactory } from '../../types/models';
import type { PlayerLocomotion } from './player-locomotion';
import type { PlayerRig } from './player-rig';
import type { HeldModel } from './types/held-model';

/**
 * What the off hand holds: the lantern (or none), a torch, or a shield,
 * plain or infused (built the first time each is equipped), the lantern on
 * the belt when the hand is busy, and the shield held square in front while
 * blocking.
 */
export class PlayerOffhand {
  /**
   * The lantern in hand.
   */
  private _lantern = new Group();

  /**
   * The lantern on the belt (behind a shield, or when the hand is busy).
   */
  private _belt = new Group();

  /**
   * The torches and shields in hand.
   */
  private _pieces = new HeldModels();

  /**
   * The shields held square in front while blocking.
   */
  private _fronts = new HeldModels();

  /**
   * The front shield matching the shield in hand, or null.
   */
  private _front: HeldModel | null = null;

  /**
   * Builds both lanterns and sets where torches and shields go.
   * @param rig The figure.
   * @param box Makes the avatar's boxes.
   */
  build(rig: PlayerRig, box: BoxFactory): void {
    this._lantern.add(...buildLantern(box));
    this._belt.add(...buildLantern(box));
    this._belt.position.set(0.03, 0.52, 0.2);
    this._belt.scale.setScalar(0.8);
    this._pieces.mount(rig.lanternArm, box);
    this._fronts.mount(rig.body, box, (group: Group): void => {
      group.rotation.y = Math.PI / 2;
    });
    rig.lanternArm.add(this._lantern);
    rig.body.add(this._belt);
  }

  /**
   * Shows what the off hand holds.
   * @param target The player's state.
   * @param busy Whether the hand is busy with the weapon (the gauntlets, the
   * two-handed infused hammer), hiding what it holds.
   */
  show(target: PlayerState, busy: boolean): void {
    const piece = target.gear.offhand;
    const infusion = target.gearInfusion?.offhand ?? null;
    const shown = this._pieces.show(busy ? null : piece, infusion);
    if (shown && piece === 'torch') {
      shown.group.position.y = -0.21;
    }
    this._lantern.visible = !busy && !piece;
    this._belt.visible = piece === 'shield' || (busy && !piece);
    this._front = this._fronts.show(piece === 'shield' ? piece : null, infusion);
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
  pose(rig: PlayerRig, target: PlayerState, locomotion: PlayerLocomotion, block: number, lean: number): void {
    const offhand = target.gear.offhand;
    const sway = Math.sin(locomotion.walkPhase);
    rig.lanternArm.rotation.x = 0;
    const raised = offhand === 'shield' && block > 0.5;
    if (this._front) {
      this._front.group.visible = raised;
      this._front.group.position.set(0.15 + 0.08 * block, 0.58, 0.02);
    }
    const shown = this._pieces.shown;
    if (shown && offhand === 'shield') {
      shown.group.visible = !raised;
    }
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
   * Flickers a torch's flame about its own size and moves an infused
   * piece's animated bits.
   * @param time Seconds since the renderer started.
   * @param dt Seconds since the last frame.
   * @param target The player's state.
   */
  step(time: number, dt: number, target: PlayerState): void {
    const shown = this._pieces.shown;
    const flame = shown?.model.flame;
    if (flame && shown.flameBase) {
      const base = shown.flameBase;
      flame.scale.set(base.x * (1 + Math.sin(time * 23) * 0.12), base.y * (1 + Math.sin(time * 31 + 1) * 0.22), base.z);
    }
    shown?.model.animate?.(time, dt, target);
    if (this._front?.group.visible) {
      this._front.model.animate?.(time, dt, target);
    }
  }
}
