// Local Imports
import { HURT_COLOR } from '../config/avatar';
import { HAZE_COLOR } from './config/player-look';
import { PROTECTION_DIM, PROTECTION_PULSE_RATE } from './config/player-timing';
import { PlayerHaze } from './player-haze';

// Types
import type { Group, MeshLambertMaterial } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { VoxelParts } from '../shared/voxel-parts';

/**
 * How a player's body is tinted: red when hit, dimmed by the spawn
 * protection pulse, and green, flickering, and fading with the ectoplasm
 * haze.
 */
export class PlayerShading {
  /**
   * The spawn protection pulse's brightness, 1 when not pulsing.
   */
  pulse = 1;

  /**
   * The ectoplasm haze.
   */
  private _haze = new PlayerHaze();

  /**
   * Tints and fades every box for this frame.
   * @param parts The avatar's boxes.
   * @param t The player's state.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param flash How strong the hurt flash is, 0 to 1.
   * @param group The avatar's group, where the haze's wisps go.
   */
  apply(parts: VoxelParts, t: PlayerState, dt: number, time: number, flash: number, group: Group): void {
    this.pulse = t.protected ? 1 - PROTECTION_DIM * (0.5 - 0.5 * Math.cos(time * PROTECTION_PULSE_RATE * Math.PI * 2)) : 1;
    const shimmer = this._haze.step(dt, t.slowed, time);
    const { litColors } = parts;
    parts.lit.forEach((m: MeshLambertMaterial, i: number): void => {
      m.emissive.set(HURT_COLOR).multiplyScalar(flash).lerp(HAZE_COLOR, shimmer * 0.45);
      m.color.copy(litColors[i]).multiplyScalar(this.pulse);
    });
    this._haze.render(time, group);

    const opacity = 1 - 0.4 * shimmer;
    for (const m of parts.materials) {
      m.opacity = opacity * ((m.userData.opacity as number | undefined) ?? 1);
      m.transparent = m.opacity < 1;
    }
  }

  /**
   * Disposes the haze.
   */
  dispose(): void {
    this._haze.dispose();
  }
}
