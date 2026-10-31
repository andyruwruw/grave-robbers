// Local Imports
import {
  DARK_WOOD,
  GRIP,
  HANDLE,
  MUSKET_WOOD,
  MUSKET_WOOD_DARK,
  PALE_WOOD,
  WHIP_LEATHER,
} from '../../config/palette';
import {
  CHARRED,
  LAVA,
  LAVA_HOT,
  OBSIDIAN,
  OBSIDIAN_SHEEN,
} from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { Mesh } from 'three';
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Embers rising off a level 2 head.
 */
const EMBERS = 3;

/**
 * Brimstone (Enflamed): level 1 black obsidian with glowing lava cracks
 * and a charred haft; level 2 a jagged volcanic head with flames licking
 * along its edge and embers rising off it.
 */
export class BrimstoneLook extends EssenceLook {
  /**
   * Metal to obsidian, wood to char.
   * @returns The color remap.
   */
  remap(): ColorRemap {
    const remap = this.metals({ color: OBSIDIAN_SHEEN }, { color: OBSIDIAN });
    for (const wood of [HANDLE, GRIP, DARK_WOOD, PALE_WOOD, MUSKET_WOOD, MUSKET_WOOD_DARK, WHIP_LEATHER]) {
      remap[wood] = { color: CHARRED };
    }
    return remap;
  }

  /**
   * Lava cracks; at level 2 jagged spikes, edge flames, and embers.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    this._cracks(decor);
    if (level === 2) {
      this._jags(decor);
      this._flames(decor);
      this._embers(decor);
    }
  }

  /**
   * A thin zigzag of glowing lava down both faces.
   * @param decor The model being decorated.
   */
  private _cracks(decor: VariantDecor): void {
    const count = this.fit(decor, 0.09, 2, 5);
    const step = (decor.length * 0.8) / count;
    for (const side of [-1, 1]) {
      decor.spread(count, 0.12).forEach((a: number, i: number): void => {
        const crack = decor.add(decor.vec(step * 1.1, 0.012, 0.006), decor.vec(a, decor.width * 0.12 * (i % 2 ? 1 : -1), side * (decor.depth / 2 + 0.003)), LAVA, true);
        this.tilt(decor, crack, i % 2 ? 0.45 : -0.45);
      });
    }
  }

  /**
   * Jagged obsidian spikes along the edge and a few on its back.
   * @param decor The model being decorated.
   */
  private _jags(decor: VariantDecor): void {
    decor.spread(this.fit(decor, 0.08, 2, 6)).forEach((a: number, i: number): void => {
      const big = i % 2 ? 0.05 : 0.075;
      const jag = decor.add(decor.vec(big * 0.7, big, decor.depth * 0.8), decor.vec(a, decor.width / 2 + big * 0.25, 0), OBSIDIAN);
      this.tilt(decor, jag, Math.PI / 4);
      if (i % 2 === 0) {
        const back = decor.add(decor.vec(0.035, 0.035, decor.depth * 0.7), decor.vec(a, -decor.width / 2 - 0.01, 0), OBSIDIAN_SHEEN);
        this.tilt(decor, back, Math.PI / 4);
      }
    });
  }

  /**
   * Small flickering flames along the edge.
   * @param decor The model being decorated.
   */
  private _flames(decor: VariantDecor): void {
    const flames = decor.spread(this.fit(decor, 0.1, 2, 4)).map((a: number): Mesh => decor.add(decor.vec(0.03, 0.04, 0.02), decor.vec(a, decor.width / 2 + 0.07, 0), LAVA_HOT, true));
    decor.animate((time: number): void => {
      for (let i = 0; i < flames.length; i++) {
        const s = 1 + Math.sin(time * 19 + i * 2.3) * 0.25;
        flames[i].scale.setComponent(decor.out, 0.04 * s);
        flames[i].scale.setComponent(decor.along, 0.03 * (2 - s));
      }
    });
  }

  /**
   * Embers rising off the head, shrinking as they go, then starting over.
   * @param decor The model being decorated.
   */
  private _embers(decor: VariantDecor): void {
    const embers: Mesh[] = [];
    for (let i = 0; i < EMBERS; i++) {
      embers.push(decor.add([0.016, 0.016, 0.016], [0, 0, 0], LAVA, true));
    }
    decor.animate((time: number): void => {
      for (let i = 0; i < embers.length; i++) {
        const k = (time * 0.8 + i / EMBERS) % 1;
        decor.place(embers[i], Math.sin(i * 2.4) * decor.length * 0.35, decor.width / 2 + 0.04, Math.cos(i * 1.7) * 0.03);
        embers[i].position.y += k * 0.22;
        embers[i].scale.setScalar(0.018 * (1 - k));
      }
    });
  }
}
