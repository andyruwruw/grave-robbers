// Packages
import {
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { UNIT_BOX } from '../config/avatar';
import { HAZE_COLOR, HAZE_FADE, HAZE_WISPS } from './config/player-look';

/**
 * The green haze around a player slowed by ectoplasm: how strong it is,
 * and the wisps circling them (built the first time they're needed).
 */
export class PlayerHaze {
  /**
   * How strong the haze is, 0 to 1.
   */
  private _haze = 0;

  /**
   * The wisps, once built.
   */
  private _hazeGroup: Group | null = null;

  /**
   * The wisps' shared material, once built.
   */
  private _hazeMaterial: MeshBasicMaterial | null = null;

  /**
   * Fades the haze in while slowed and out after.
   * @param dt Seconds since the last frame.
   * @param slowed Whether the player is slowed.
   * @param time Seconds since the renderer started.
   * @returns The flickering tint strength, 0 to 1.
   */
  step(dt: number, slowed: boolean, time: number): number {
    this._haze = Math.max(0, Math.min(1, this._haze + (slowed ? 1 : -1) * HAZE_FADE * dt));
    return this._haze * (0.6 + 0.4 * Math.sin(time * 9));
  }

  /**
   * Circles the wisps around the player, building them the first time
   * they're needed, or hides them.
   * @param time Seconds since the renderer started.
   * @param group The avatar's group, where the wisps go.
   */
  render(time: number, group: Group): void {
    if (this._haze <= 0) {
      if (this._hazeGroup) {
        this._hazeGroup.visible = false;
      }
      return;
    }
    if (!this._hazeGroup) {
      this._hazeMaterial = new MeshBasicMaterial({ color: HAZE_COLOR, transparent: true, opacity: 0, depthWrite: false });
      this._hazeGroup = new Group();
      for (let i = 0; i < HAZE_WISPS; i++) {
        const wisp = new Mesh(UNIT_BOX, this._hazeMaterial);
        wisp.scale.setScalar(0.07 + (i % 3) * 0.02);
        this._hazeGroup.add(wisp);
      }
      group.add(this._hazeGroup);
    }
    this._hazeGroup.visible = true;
    this._hazeMaterial!.opacity = 0.55 * this._haze;
    this._hazeGroup.children.forEach((wisp, i: number): void => {
      const a = time * (1.6 + (i % 2) * 0.7) + (i * Math.PI * 2) / HAZE_WISPS;
      const r = 0.3 + 0.05 * Math.sin(time * 3 + i);
      wisp.position.set(Math.cos(a) * r, 0.25 + ((i * 0.13 + time * 0.35) % 0.7), Math.sin(a) * r);
      wisp.rotation.set(time * 2 + i, time * 1.3, 0);
    });
  }

  /**
   * Disposes the wisps' material, if built.
   */
  dispose(): void {
    this._hazeMaterial?.dispose();
  }
}
