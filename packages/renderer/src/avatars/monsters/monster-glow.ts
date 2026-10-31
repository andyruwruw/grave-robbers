// Packages
import { STATUS_WARDED, hasStatus } from '@halloween/shared/monsters/monster-status';

// Local Imports
import { HURT_COLOR } from '../config/avatar';
import { WARD_GLOW } from './config/monster-palette';
import { MonsterAfflictions } from './monster-afflictions';

// Types
import type { Group, MeshLambertMaterial } from 'three';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';

/**
 * What glows on a monster's body each frame: the hurt flash, else the
 * pulsing green of a necromancer's ward, else what's afflicting it
 * (`MonsterAfflictions`).
 */
export class MonsterGlow {
  /**
   * What's afflicting it (burning, cursed, ...): its glow and bits.
   */
  private _afflictions = new MonsterAfflictions();

  /**
   * Steps the afflictions and sets the body's glow.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param flash The hurt flash, 0 to 1.
   * @param t The monster's state.
   * @param phase Its walk phase (offsets the ward's pulse).
   * @param group The avatar's group, where the afflictions' bits go.
   * @param lit The body's lit materials.
   */
  update(dt: number, time: number, flash: number, t: MonsterState, phase: number, group: Group, lit: MeshLambertMaterial[]): void {
    const ward = flash > 0 || !hasStatus(t.status, STATUS_WARDED) ? 0 : WARD_GLOW.amount * (0.7 + 0.3 * Math.sin(time * 5 + phase));
    const tint = this._afflictions.update(dt, time, t.status, group);
    for (const m of lit) {
      if (flash > 0 || ward > 0) {
        m.emissive.set(ward > 0 ? WARD_GLOW.color : HURT_COLOR).multiplyScalar(ward > 0 ? ward : flash);
      } else {
        m.emissive.copy(tint);
      }
    }
  }

  /**
   * Disposes the afflictions' bits.
   */
  dispose(): void {
    this._afflictions.dispose();
  }
}
