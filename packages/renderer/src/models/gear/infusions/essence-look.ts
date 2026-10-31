// Packages
import { Group } from 'three';

// Local Imports
import {
  BAND,
  BLADE,
  BLOODSTEEL,
  BLOODSTEEL_DARK,
  BRASS,
  EDGE,
  IRON,
  MUSKET_BAND,
  MUSKET_IRON,
  SILVER,
  STEEL,
  WHIP_CHAIN,
  WHIP_CHAIN_DARK,
} from '../config/palette';

// Types
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap, Restyle } from './types/variant-shape';
import type { VariantDecor } from './variant-decor';

/**
 * The bright metals: edges and polished blades.
 */
const BRIGHT_METALS = [EDGE, SILVER, STEEL];

/**
 * The dark metals: heads, bands, fittings, chain, and barrels.
 */
const DARK_METALS = [IRON, BAND, BLADE, BRASS, MUSKET_IRON, MUSKET_BAND, WHIP_CHAIN, WHIP_CHAIN_DARK, BLOODSTEEL, BLOODSTEEL_DARK];

/**
 * How one essence changes a weapon's model (see the Look table in
 * `docs/infusions.md`): the colors its boxes come out in, then the boxes
 * it adds and the head's new shape, for each level. Level 2 builds on
 * level 1's look. One subclass per essence in `kinds/`.
 */
export abstract class EssenceLook {
  /**
   * What the palette turns into at a level (applied while the model is
   * built).
   * @param level The infusion's level.
   * @returns The color remap.
   */
  abstract remap(level: InfusionLevel): ColorRemap;

  /**
   * Adds the look's boxes and reshapes the head.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  abstract decorate(decor: VariantDecor, level: InfusionLevel): void;

  /**
   * Restyles every metal: the bright ones one way, the dark ones another.
   * @param bright What edges and polished blades turn into.
   * @param dark What heads, bands, and fittings turn into.
   * @returns The color remap.
   */
  protected metals(bright: Restyle, dark: Restyle): ColorRemap {
    const remap: ColorRemap = {};
    for (const color of BRIGHT_METALS) {
      remap[color] = bright;
    }
    for (const color of DARK_METALS) {
      remap[color] = dark;
    }
    return remap;
  }

  /**
   * A group standing in the head whose local y runs along the head's
   * edge, for rings and orbits built about y.
   * @param decor The model being decorated.
   * @param a Where along the edge it sits.
   * @returns The group, already in the head.
   */
  protected alongGroup(decor: VariantDecor, a: number): Group {
    const group = new Group();
    group.position.set(...decor.vec(a, 0, 0));
    if (decor.along === 0) {
      group.rotation.z = Math.PI / 2;
    } else if (decor.along === 2) {
      group.rotation.x = Math.PI / 2;
    }
    decor.head.add(group);
    return group;
  }

  /**
   * Turns a box about the head's thickness axis (its face's normal).
   * @param decor The model being decorated.
   * @param mesh The box.
   * @param angle How far.
   */
  protected tilt(decor: VariantDecor, mesh: { rotation: { x: number; y: number; z: number } }, angle: number): void {
    const axis = (['x', 'y', 'z'] as const)[decor.thick];
    mesh.rotation[axis] = angle;
  }

  /**
   * How many of something fit along the edge, one per `spacing`, clamped.
   * @param decor The model being decorated.
   * @param spacing Room for each.
   * @param min At least this many.
   * @param max At most this many.
   * @returns The count.
   */
  protected fit(decor: VariantDecor, spacing: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(decor.length / spacing)));
  }
}
