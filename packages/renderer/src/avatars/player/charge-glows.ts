// Local Imports
import { CHARGE_GLOW } from './config/player-look';

// Types
import type { Group, Mesh } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { BoxFactory } from '../../types/models';

/**
 * The glow of a spiked gauntlet's charge on both fists.
 */
export class ChargeGlows {
  /**
   * One glow per fist.
   */
  private _glows: Mesh[] = [];

  /**
   * Builds a hidden glow on each fist.
   * @param box Makes the avatar's boxes.
   * @param wrist The tool arm's wrist.
   * @param lanternArm The off arm.
   */
  build(box: BoxFactory, wrist: Group, lanternArm: Group): void {
    for (const [arm, y] of [[wrist, 0], [lanternArm, -0.25]] as const) {
      const glow = box([0.2, 0.2, 0.2], [0.02, y - 0.02, 0], CHARGE_GLOW, true);
      glow.visible = false;
      this._glows.push(glow);
      arm.add(glow);
    }
  }

  /**
   * Shows and pulses the glow while the gauntlets are charged.
   * @param target The player's state.
   * @param time Seconds since the renderer started.
   */
  update(target: PlayerState, time: number): void {
    for (const glow of this._glows) {
      glow.visible = target.charge > 0 && target.gear.weapon === 'spiked-gauntlet' && !target.drawn;
      glow.scale.setScalar((0.4 + target.charge * 0.8) * (1 + Math.sin(time * 12) * 0.12 * target.charge));
    }
  }
}
