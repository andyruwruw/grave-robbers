// Local Imports
import { BLADE, EDGE } from '../../config/palette';
import {
  ECTO,
  ECTO_DEEP,
  ECTO_OPACITY,
  ECTO_PALE,
  GHOST_OPACITY,
} from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { Material, Mesh } from 'three';
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * How far a level 2 head floats off its haft.
 */
const FLOAT_GAP = 0.07;

/**
 * Ectoplasm (Ephemeral): level 1 edges turn see-through green and drip;
 * level 2 the whole head turns ghostly, floating free of the haft with
 * wisps trailing off it.
 */
export class EctoLook extends EssenceLook {
  /**
   * Edges and the blade's core turn to see-through ectoplasm.
   * @returns The color remap.
   */
  remap(): ColorRemap {
    return {
      [EDGE]: { color: ECTO, opacity: ECTO_OPACITY },
      [BLADE]: { color: ECTO_DEEP, opacity: ECTO_OPACITY },
    };
  }

  /**
   * Drips along the edge; at level 2, a ghostly floating head and wisps.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    if (level === 2) {
      decor.restyleHead((mesh: Mesh) => ((mesh.material as Material).transparent ? null : { color: ECTO_PALE, opacity: GHOST_OPACITY }));
    }
    this._drips(decor);
    if (level === 2) {
      this._float(decor);
      this._wisps(decor);
    }
  }

  /**
   * Drips hanging off the edge, each with a bead that slides down and
   * starts over.
   * @param decor The model being decorated.
   */
  private _drips(decor: VariantDecor): void {
    const beads: { mesh: Mesh; y: number; phase: number }[] = [];
    decor.spread(this.fit(decor, 0.12, 2, 5)).forEach((a: number, i: number): void => {
      const long = 0.05 + (i % 2) * 0.03;
      const at = decor.vec(a, decor.width / 2 + 0.006, decor.depth * 0.2);
      at[1] -= long / 2;
      decor.add([0.02, long, 0.02], at, ECTO, false, ECTO_OPACITY);
      const y = at[1] - long / 2 - 0.012;
      const bead = decor.add([0.026, 0.026, 0.026], [at[0], y, at[2]], ECTO, false, ECTO_OPACITY);
      beads.push({ mesh: bead, y, phase: i * 0.37 });
    });
    decor.animate((time: number): void => {
      for (const { mesh, y, phase } of beads) {
        const k = (time * 0.7 + phase) % 1;
        mesh.position.y = y - k * 0.05;
        mesh.scale.setScalar(0.026 * (1 - k * 0.6));
      }
    });
  }

  /**
   * Lifts the head off the haft and bobs it there.
   * @param decor The model being decorated.
   */
  private _float(decor: VariantDecor): void {
    const { head, rest, reach } = decor;
    head.position.copy(rest).addScaledVector(reach, FLOAT_GAP);
    decor.animate((time: number): void => {
      head.position.copy(rest).addScaledVector(reach, FLOAT_GAP + Math.sin(time * 2.4) * 0.018);
      head.rotation.y = Math.sin(time * 1.3) * 0.08;
    });
  }

  /**
   * Faint glowing wisps drifting round the head.
   * @param decor The model being decorated.
   */
  private _wisps(decor: VariantDecor): void {
    const spots = decor.spread(4, 0.05);
    const reach = Math.max(decor.width, decor.depth) / 2 + 0.05;
    const wisps = spots.map((a: number): Mesh => decor.add([0.03, 0.03, 0.03], decor.vec(a, -reach, 0), ECTO_PALE, true, 0.4));
    decor.animate((time: number): void => {
      for (let i = 0; i < wisps.length; i++) {
        const turn = time * 1.6 + i * 1.7;
        decor.place(wisps[i], spots[i] + Math.sin(time * 0.9 + i) * 0.03, Math.cos(turn) * reach, Math.sin(turn) * reach);
        wisps[i].scale.setScalar(0.022 + 0.012 * (0.5 + 0.5 * Math.sin(time * 3 + i * 2)));
      }
    });
  }
}
