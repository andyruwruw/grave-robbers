// Packages
import { Group } from 'three';

// Local Imports
import {
  BONE,
  EDGE,
  GRIP,
  HANDLE,
  LEATHER,
  MUSKET_WOOD,
  WHIP_LEATHER,
  WRAP,
} from '../../config/palette';
import {
  HEX,
  HEX_CORD,
  HEX_EYE,
  HEX_LEATHER,
  HEX_STEEL,
  HEX_STITCH,
} from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * How far a level 2 head is twisted about its edge, in radians.
 */
const TWIST = 0.5;

/**
 * Hex shard (Hexed): level 1 dull violet steel with glowing purple runes
 * and bone charms dangling from the head; level 2 the haft turns to
 * stitched leather, an eye opens in the head, and the head twists.
 */
export class HexLook extends EssenceLook {
  /**
   * Violet edges; at level 2, leather for every handle and wrap.
   * @param level The infusion's level.
   * @returns The color remap.
   */
  remap(level: InfusionLevel): ColorRemap {
    const remap: ColorRemap = { [EDGE]: { color: HEX_STEEL } };
    if (level === 2) {
      for (const hide of [HANDLE, GRIP, WRAP, LEATHER, MUSKET_WOOD, WHIP_LEATHER]) {
        remap[hide] = { color: HEX_LEATHER };
      }
    }
    return remap;
  }

  /**
   * Runes and charms; at level 2 stitches, an eye, and a twist.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    this._runes(decor);
    this._charms(decor);
    if (level === 2) {
      this._stitches(decor);
      this._eye(decor);
      decor.head.rotation.set(0, 0, 0);
      decor.head.rotation[(['x', 'y', 'z'] as const)[decor.along]] = TWIST;
    }
  }

  /**
   * Small glowing runes down both faces, each a pair of strokes.
   * @param decor The model being decorated.
   */
  private _runes(decor: VariantDecor): void {
    for (const side of [-1, 1]) {
      const t = side * (decor.depth / 2 + 0.003);
      decor.spread(this.fit(decor, 0.1, 2, 4), 0.2).forEach((a: number, i: number): void => {
        decor.add(decor.vec(0.032, 0.008, 0.005), decor.vec(a, 0, t), HEX, true);
        decor.add(decor.vec(0.008, 0.026, 0.005), decor.vec(a + (i % 2 ? 0.01 : -0.01), i % 2 ? 0.008 : -0.008, t), HEX, true);
      });
    }
  }

  /**
   * Two bone charms on cords, hanging from the head's grip end and swaying.
   * @param decor The model being decorated.
   */
  private _charms(decor: VariantDecor): void {
    const charms: Group[] = [];
    for (const side of [-1, 1]) {
      const charm = new Group();
      charm.position.set(...decor.vec(decor.gripSide * decor.length * 0.45, side * decor.width * 0.3, 0));
      charm.add(
        decor.box([0.008, 0.07, 0.008], [0, -0.035, 0], HEX_CORD),
        decor.box([0.03, 0.036, 0.03], [0, -0.085, 0], BONE),
        decor.box([0.014, 0.02, 0.014], [0, -0.112, 0], BONE),
      );
      decor.head.add(charm);
      charms.push(charm);
    }
    decor.animate((time: number): void => {
      for (let i = 0; i < charms.length; i++) {
        charms[i].rotation.z = Math.sin(time * 2.3 + i * 1.9) * 0.35;
        charms[i].rotation.x = Math.sin(time * 1.7 + i) * 0.2;
      }
    });
  }

  /**
   * Pale stitches across the leather haft.
   * @param decor The model being decorated.
   */
  private _stitches(decor: VariantDecor): void {
    for (let i = 0; i < 4; i++) {
      decor.wrap(0.2 + i * 0.18, 0.008, HEX_STITCH, 0.02);
    }
  }

  /**
   * An eye set in both faces, with a glowing pupil, that blinks now and
   * then.
   * @param decor The model being decorated.
   */
  private _eye(decor: VariantDecor): void {
    const wide = Math.min(0.07, decor.length * 0.6);
    const tall = Math.min(0.045, decor.width * 0.8);
    const eyes: Group[] = [];
    for (const side of [-1, 1]) {
      const eye = new Group();
      eye.position.set(...decor.vec(0, 0, side * (decor.depth / 2 + 0.006)));
      eye.add(
        decor.box(decor.vec(wide, tall, 0.01), [0, 0, 0], HEX_EYE),
        decor.box(decor.vec(wide * 1.1, 0.01, 0.014), decor.vec(0, tall / 2, 0), HEX_CORD),
        decor.box(decor.vec(tall * 0.45, tall * 0.55, 0.006), decor.vec(0, 0, side * 0.006), HEX, true),
      );
      decor.head.add(eye);
      eyes.push(eye);
    }
    decor.animate((time: number): void => {
      const blink = Math.max(0, Math.sin(time * 2)) ** 40;
      for (const eye of eyes) {
        eye.scale.setComponent(decor.out, 1 - blink * 0.9);
      }
    });
  }
}
