// Packages
import { Color, Group } from 'three';

// Local Imports
import { HOLLOW } from '../config/blade-variant-palette';

// Types
import type { Material, Mesh, Object3D } from 'three';
import type { BoxFactory } from '../../../../types/models';
import type { Restyle } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Three numbers, one per axis.
 */
type Vec3 = [number, number, number];

/**
 * The axis names, by index.
 */
const AXES = ['x', 'y', 'z'] as const;

/**
 * Turns something about the head's thickness axis (its face's normal), so
 * it leans within the blade's face.
 * @param decor The model being decorated.
 * @param part What to turn.
 * @param angle How far.
 */
export const faceTilt = (decor: VariantDecor, part: Object3D, angle: number): void => {
  part.rotation[AXES[decor.thick]] = angle;
};

/**
 * Restyles every box in the head that came out in one of some colors.
 * @param decor The model being decorated.
 * @param from The colors to restyle, as the builders pass them.
 * @param to Their new style.
 */
export const restyleColor = (decor: VariantDecor, from: string[], to: Restyle): void => {
  const hexes = from.map((c: string): string => new Color(c).getHexString());
  decor.restyleHead((mesh: Mesh): Restyle | null => {
    const color = (mesh.material as Material & { color?: Color }).color;
    return color && hexes.includes(color.getHexString()) ? to : null;
  });
};

/**
 * Where the weapon's tip sits in the head's space, or the head's far end
 * when the tip isn't part of the head.
 * @param decor The model being decorated.
 * @returns The spot.
 */
export const tipSpot = (decor: VariantDecor): Vec3 => {
  const tip = decor.model.tip;
  if (tip && tip.parent === decor.head) {
    return [tip.position.x, tip.position.y - tip.scale.y / 2, tip.position.z];
  }
  return decor.vec(-decor.gripSide * decor.length / 2, 0, 0);
};

/**
 * Drops that swell at a spot, fall, and start over (blood, poison).
 * @param decor The model being decorated.
 * @param from Where they form, in the head's space.
 * @param color Their color.
 * @param glow Whether they glow.
 * @param count How many, staggered.
 * @param fall How far each falls.
 */
export const drips = (decor: VariantDecor, from: Vec3, color: string, glow: boolean, count = 2, fall = 0.14): void => {
  const beads: Mesh[] = [];
  for (let i = 0; i < count; i++) {
    beads.push(decor.add([0.022, 0.022, 0.022], from, color, glow, 0.9));
  }
  decor.animate((time: number): void => {
    for (let i = 0; i < beads.length; i++) {
      const k = (time * 0.8 + i / beads.length) % 1;
      const swell = k < 0.3 ? k / 0.3 : 1;
      const drop = k < 0.3 ? 0 : (k - 0.3) / 0.7;
      beads[i].position.y = from[1] - drop * drop * fall;
      beads[i].scale.setScalar(0.022 * (0.3 + swell * 0.7) * (1 - drop * 0.4));
    }
  });
};

/**
 * Strips of cloth hanging down (head space -y) from spots on the head,
 * each swaying in the head's face.
 * @param decor The model being decorated.
 * @param spots Where each hangs from, in the head's space.
 * @param color Their color.
 * @param glow Whether they glow.
 * @param opacity How opaque they are.
 */
export const tatters = (decor: VariantDecor, spots: Vec3[], color: string, glow: boolean, opacity: number): void => {
  const strips = spots.map((at: Vec3, i: number): Group => {
    const strip = new Group();
    const long = 0.09 + (i % 3) * 0.025;
    strip.position.set(...at);
    strip.add(decor.box([0.03, long, 0.008], [0, -long / 2, 0], color, glow, opacity));
    strip.add(decor.box([0.018, 0.03, 0.008], [(i % 2 ? 0.006 : -0.006), -long - 0.012, 0], color, glow, opacity));
    decor.head.add(strip);
    return strip;
  });
  decor.animate((time: number): void => {
    for (let i = 0; i < strips.length; i++) {
      strips[i].rotation[AXES[decor.thick]] = Math.sin(time * 2.1 + i * 1.3) * 0.3;
    }
  });
};

/**
 * A boxy skull facing +z: cranium, jaw, two eye sockets, and a nose.
 * @param box Makes each box.
 * @param s How big it is.
 * @param bone Its bone color.
 * @param eye The eye sockets' color.
 * @param glow Whether the eyes glow.
 * @returns The skull, as a group about its middle.
 */
export const skull = (box: BoxFactory, s: number, bone: string, eye: string, glow: boolean): Group => {
  const group = new Group();
  const face = s * 0.45 + 0.003;
  group.add(
    box([s, s * 0.85, s * 0.9], [0, 0, 0], bone),
    box([s * 0.7, s * 0.3, s * 0.7], [0, -s * 0.5, s * 0.08], bone),
    box([s * 0.26, s * 0.22, 0.006], [-s * 0.22, s * 0.05, face], eye, glow),
    box([s * 0.26, s * 0.22, 0.006], [s * 0.22, s * 0.05, face], eye, glow),
    box([s * 0.12, s * 0.12, 0.006], [0, -s * 0.17, face], HOLLOW),
  );
  return group;
};

/**
 * A hollow rectangle lying in the head's face (a ring of sound, a seal).
 * @param decor The model being decorated.
 * @param long Its length along the edge.
 * @param wide Its width out from the edge.
 * @param color Its color.
 * @param opacity How opaque it is.
 * @returns The rectangle, as a group about its middle (not yet added).
 */
export const frame = (decor: VariantDecor, long: number, wide: number, color: string, opacity: number): Group => {
  const group = new Group();
  const bar = 0.008;
  for (const side of [-1, 1]) {
    group.add(
      decor.box(decor.vec(bar, wide, bar), decor.vec(side * long / 2, 0, 0), color, true, opacity),
      decor.box(decor.vec(long, bar, bar), decor.vec(0, side * wide / 2, 0), color, true, opacity),
    );
  }
  return group;
};
