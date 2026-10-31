// Local Imports
import { HOLY_GOLD } from '../../models/gear/infusions/config/essence-palette';
import { CHARGE_GLOW } from './config/player-look';

// Types
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { BoxFactory } from '../../types/models';

/**
 * The glow of a spiked gauntlet's charge on both fists (gold for holy
 * gauntlets).
 */
export class ChargeGlows {
  /**
   * One glow per fist.
   */
  private _glows: Mesh[] = [];

  /**
   * Whether the glows are gold now.
   */
  private _holy = false;

  /**
   * Builds a hidden glow on each fist.
   * @param box Makes the avatar's boxes.
   * @param wrist The tool arm's wrist.
   * @param lanternArm The off arm.
   */
  build(box: BoxFactory, wrist: Group, lanternArm: Group): void {
    for (const [arm, y] of [[wrist, 0], [lanternArm, -0.25]] as const) {
      const glow = box([0.15, 0.15, 0.15], [0.02, y - 0.02, 0], CHARGE_GLOW, true);
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
    const holy = target.gearInfusion?.weapon?.essence === 'holy';
    if (holy !== this._holy) {
      this._holy = holy;
      for (const glow of this._glows) {
        (glow.material as MeshBasicMaterial).color.set(holy ? HOLY_GOLD : CHARGE_GLOW);
      }
    }
    for (const glow of this._glows) {
      glow.visible = target.charge > 0 && target.gear.weapon === 'spiked-gauntlet' && !target.drawn;
      glow.scale.setScalar((0.5 + target.charge * 0.5) * (1 + Math.sin(time * 12) * 0.08 * target.charge));
    }
  }
}
