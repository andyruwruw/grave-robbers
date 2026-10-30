// Local Imports
import {
  DROP_BOB,
  DROP_HEIGHT,
  DROP_RATE,
  GLINT_RATE,
} from './config/piles';

// Types
import type { Group, Mesh, MeshBasicMaterial } from 'three';

/**
 * The moving parts of ground drops: glints that twinkle over gear and
 * crates, and drops that bob over blood, each on its own beat.
 */
export class PileAnimations {
  /**
   * Every glint and its beat.
   */
  private _glints: { mesh: Mesh; phase: number }[] = [];

  /**
   * Every bobbing drop and its beat.
   */
  private _bobbers: { group: Group; phase: number }[] = [];

  /**
   * Starts twinkling a glint.
   * @param mesh The glint, with its own cloned material.
   * @param phase Its beat.
   */
  addGlint(mesh: Mesh, phase: number): void {
    this._glints.push({ mesh, phase });
  }

  /**
   * Starts bobbing a drop.
   * @param group The drop.
   * @param phase Its beat.
   */
  addBobber(group: Group, phase: number): void {
    this._bobbers.push({ group, phase });
  }

  /**
   * Twinkles the glints over gear and bobs the drops over blood, each on
   * its own beat.
   * @param time Seconds since the renderer started.
   */
  update(time: number): void {
    for (const { group, phase } of this._bobbers) {
      group.position.y = DROP_HEIGHT + Math.sin(time * DROP_RATE + phase) * DROP_BOB;
      group.rotation.y = time * 1.2 + phase;
    }
    for (const { mesh, phase } of this._glints) {
      const k = Math.max(0, Math.sin(time * GLINT_RATE + phase));
      const flash = k ** 6;
      mesh.visible = flash > 0.02;
      mesh.scale.setScalar(0.03 + flash * 0.05);
      (mesh.material as MeshBasicMaterial).opacity = 0.35 + flash * 0.65;
    }
  }

  /**
   * Stops animating everything in a removed pile, freeing its glints'
   * materials.
   * @param pile The pile.
   */
  forget(pile: Group): void {
    this._bobbers = this._bobbers.filter(({ group }): boolean => group.parent !== pile);
    this._glints = this._glints.filter(({ mesh }): boolean => {
      if (mesh.parent === pile) {
        (mesh.material as MeshBasicMaterial).dispose();
        return false;
      }
      return true;
    });
  }

  /**
   * Frees every glint's material.
   */
  dispose(): void {
    this._glints.forEach(({ mesh }): void => (mesh.material as MeshBasicMaterial).dispose());
  }
}
