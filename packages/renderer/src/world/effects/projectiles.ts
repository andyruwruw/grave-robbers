// Local Imports
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import {
  POTION_ARC,
  SHOT_HEIGHT,
  SHOT_POOL,
  SHOT_SPEEDS,
} from './config/projectiles';

// Types
import type { ShotState } from '@halloween/shared/protocol/state/world-state';
import type { ShotSlot } from '../../types/effects';
import type { WorldContext } from '../world-context';

/**
 * Shots in flight (bolts, gobs of blood, ectoplasm, arrows, and potions),
 * drawn from a pool of SHOT_POOL slots and carried forward between ticks.
 */
export class Projectiles extends ScenePart {
  /**
   * The pooled slots, one shot each.
   */
  private _slots: ShotSlot[] = [];

  /**
   * Shots in flight this tick.
   */
  private _shots: ShotState[] = [];

  /**
   * When (clock seconds) this tick's shots arrived.
   */
  private _shotsAt = 0;

  /**
   * Builds every slot and adds it to the scene, hidden.
   * @param ctx What every part of the scene shares.
   */
  constructor(ctx: WorldContext) {
    super(ctx);
    for (let i = 0; i < SHOT_POOL; i++) {
      const slot = ctx.shotMaterials.buildSlot();
      this._slots.push(slot);
      this.scene.add(slot.bolt, slot.gob, slot.ecto, slot.arrow, slot.potion);
    }
  }

  /**
   * Bolts and blood in flight this tick.
   * @param shots The shots.
   */
  set(shots: ShotState[]): void {
    this._shots = shots;
    this._shotsAt = this._ctx.clock.elapsedTime;
  }

  /**
   * Draws each shot (a bolt's pale streak, a wobbling gob of blood, a
   * ghost's pulsing ball of ectoplasm, a skeleton's arrow, or a witch's
   * tumbling potion on its arc), carried forward from where the last tick
   * put it so it flies smoothly between ticks.
   * @param time Clock seconds.
   */
  update(time: number): void {
    const since = Math.min(time - this._shotsAt, 0.1);
    this._slots.forEach(({ bolt, gob, ecto, arrow, potion }, i: number): void => {
      const shot = this._shots[i];
      bolt.visible = shot?.kind === 'bolt' && !this._ctx.monstersHidden;
      gob.visible = shot?.kind === 'blood' && !this._ctx.monstersHidden;
      ecto.visible = shot?.kind === 'ecto' && !this._ctx.monstersHidden;
      arrow.visible = shot?.kind === 'arrow' && !this._ctx.monstersHidden;
      potion.visible = shot?.kind === 'potion' && !this._ctx.monstersHidden;
      if (!shot) {
        return;
      }
      const ahead = SHOT_SPEEDS[shot.kind] * since;
      const mesh = { blood: gob, ecto, bolt, arrow, potion }[shot.kind];
      const x = shot.x + Math.cos(shot.angle) * ahead;
      const y = shot.y + Math.sin(shot.angle) * ahead;
      const { x: wx, z } = toWorld(x, y);
      mesh.position.set(wx, this._ctx.elevation(x, y) + SHOT_HEIGHT, z);
      mesh.rotation.y = -shot.angle;
      if (shot.kind === 'blood') {
        const wobble = Math.sin(time * 40 + shot.id * 1.3) * 0.15;
        gob.scale.set(1 + wobble, 1 - wobble, 1 - wobble);
      } else if (shot.kind === 'potion') {
        potion.position.y += Math.sin((shot.lob ?? 0) * Math.PI) * POTION_ARC;
        potion.rotation.set(time * 9 + shot.id, 0, time * 7);
      } else if (shot.kind === 'ecto') {
        ecto.scale.setScalar(1 + Math.sin(time * 12 + shot.id) * 0.18);
        ecto.rotation.set(time * 3, time * 2 + shot.id, 0);
        ecto.position.y += Math.sin(time * 6 + shot.id) * 0.05;
      }
    });
  }
}
