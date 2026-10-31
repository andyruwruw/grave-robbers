// Packages
import { Group } from 'three';

// Local Imports
import { BAND, IRON } from '../../config/palette';
import {
  HOLY_CLOTH,
  HOLY_GOLD,
  HOLY_GOLD_DARK,
  HOLY_HALO,
  HOLY_SILVER,
  HOLY_WING,
} from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { Mesh } from 'three';
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Halo segments.
 */
const HALO_SEGMENTS = 10;

/**
 * Light motes orbiting a level 2 head.
 */
const MOTES = 4;

/**
 * Holy water (Blessed): level 1 silver filigree, white cloth wraps, and a
 * cross guard (or a cross on the face); level 2 turns gold, with wings
 * at the guard (or a turning halo) and drifting motes of light.
 */
export class HolyLook extends EssenceLook {
  /**
   * Silver iron at level 1; gold everything at level 2.
   * @param level The infusion's level.
   * @returns The color remap.
   */
  remap(level: InfusionLevel): ColorRemap {
    if (level === 2) {
      return this.metals({ color: HOLY_GOLD }, { color: HOLY_GOLD_DARK });
    }
    return { [IRON]: { color: HOLY_SILVER }, [BAND]: { color: HOLY_SILVER } };
  }

  /**
   * Filigree, wraps, and a guard; at level 2 wings or a halo, and motes.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    this._filigree(decor);
    this._wraps(decor);
    const blade = decor.along === 1;
    if (blade) {
      decor.add(decor.vec(0.035, decor.width + 0.16, decor.depth + 0.03), decor.vec(decor.gripSide * (decor.length / 2 + 0.02), 0, 0), level === 2 ? HOLY_GOLD : HOLY_SILVER);
    } else {
      this._cross(decor);
    }
    if (level === 2) {
      if (blade) {
        this._wings(decor);
      } else {
        this._halo(decor);
      }
      this._motes(decor);
    }
  }

  /**
   * Thin silver lines framing both faces.
   * @param decor The model being decorated.
   */
  private _filigree(decor: VariantDecor): void {
    for (const side of [-1, 1]) {
      const t = side * (decor.depth / 2 + 0.004);
      for (const o of [-0.3, 0.3]) {
        decor.add(decor.vec(decor.length * 0.7, 0.012, 0.008), decor.vec(0, decor.width * o, t), HOLY_SILVER);
      }
      decor.add(decor.vec(0.012, decor.width * 0.6, 0.008), decor.vec(0, 0, t), HOLY_SILVER);
    }
  }

  /**
   * White cloth wound round the haft, with a loose tail.
   * @param decor The model being decorated.
   */
  private _wraps(decor: VariantDecor): void {
    decor.wrap(0.55, 0.05, HOLY_CLOTH);
    const low = decor.wrap(0.7, 0.04, HOLY_CLOTH);
    if (low) {
      const tail = decor.box([0.03, 0.12, 0.012], [low.position.x + low.scale.x / 2 + 0.01, low.position.y - 0.06, low.position.z], HOLY_CLOTH);
      tail.rotation.z = 0.25;
      decor.addToModel(tail);
    }
  }

  /**
   * A small cross on both faces.
   * @param decor The model being decorated.
   */
  private _cross(decor: VariantDecor): void {
    const tall = Math.min(decor.length, 0.16) * 0.8;
    const wide = Math.min(decor.width, 0.12) * 0.8;
    for (const side of [-1, 1]) {
      const t = side * (decor.depth / 2 + 0.006);
      decor.add(decor.vec(tall, 0.022, 0.01), decor.vec(0, 0, t), HOLY_SILVER);
      decor.add(decor.vec(0.022, wide, 0.01), decor.vec(decor.gripSide * tall * 0.2, 0, t), HOLY_SILVER);
    }
  }

  /**
   * A pair of white wings at the guard.
   * @param decor The model being decorated.
   */
  private _wings(decor: VariantDecor): void {
    const a = decor.gripSide * (decor.length / 2 - 0.02);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const feather = decor.add(decor.vec(0.03, 0.09 - i * 0.02, 0.012), decor.vec(a - decor.gripSide * i * 0.03, side * (decor.width / 2 + 0.06 + i * 0.012), 0), HOLY_WING);
        this.tilt(decor, feather, side * decor.gripSide * (0.5 + i * 0.25));
      }
    }
  }

  /**
   * A thin glowing ring round the head (its far end, on a long head),
   * turning slowly.
   * @param decor The model being decorated.
   */
  private _halo(decor: VariantDecor): void {
    const a = decor.length < 0.3 ? 0 : -decor.gripSide * decor.length * 0.4;
    const ring = new Group();
    this.alongGroup(decor, a).add(ring);
    const r = Math.max(decor.width, decor.depth) / 2 + 0.06;
    for (let i = 0; i < HALO_SEGMENTS; i++) {
      const turn = (i / HALO_SEGMENTS) * Math.PI * 2;
      const seg = decor.box([((Math.PI * 2 * r) / HALO_SEGMENTS) * 1.05, 0.014, 0.014], [Math.cos(turn) * r, 0, Math.sin(turn) * r], HOLY_HALO, true);
      seg.rotation.y = Math.PI / 2 - turn;
      ring.add(seg);
    }
    decor.animate((time: number): void => {
      ring.rotation.y = time * 0.8;
    });
  }

  /**
   * Tiny motes of light drifting round the head.
   * @param decor The model being decorated.
   */
  private _motes(decor: VariantDecor): void {
    const r = Math.max(...decor.size) / 2 + 0.07;
    const motes: Mesh[] = [];
    for (let i = 0; i < MOTES; i++) {
      motes.push(decor.add([0.018, 0.018, 0.018], decor.vec(0, r, 0), HOLY_HALO, true));
    }
    decor.animate((time: number): void => {
      for (let i = 0; i < motes.length; i++) {
        const turn = time * (0.7 + i * 0.15) + i * 1.6;
        decor.place(motes[i], Math.sin(time * 0.8 + i * 2.1) * decor.length * 0.45, Math.cos(turn) * r, Math.sin(turn) * r);
      }
    });
  }
}
