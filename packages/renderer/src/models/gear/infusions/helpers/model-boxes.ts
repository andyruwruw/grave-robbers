// Packages
import { Mesh, Vector3 } from 'three';

// Types
import type { Object3D } from 'three';
import type { VariantDecor } from '../variant-decor';
import type { Restyle } from '../types/variant-shape';

/**
 * Three numbers, one per axis.
 */
type Vec3 = [number, number, number];

/**
 * Every box of a given size among some parts and everything inside them
 * (the builders' boxes are told apart by size, since their colors may
 * already be restyled).
 * @param parts Where to look.
 * @param size The box's size.
 * @returns The boxes, in build order.
 */
export const findBoxes = (parts: Object3D[], size: Vec3): Mesh[] => {
  const found: Mesh[] = [];
  for (const part of parts) {
    part.traverse((o: Object3D): void => {
      if (o instanceof Mesh && Math.abs(o.scale.x - size[0]) < 1e-4 && Math.abs(o.scale.y - size[1]) < 1e-4 && Math.abs(o.scale.z - size[2]) < 1e-4) {
        found.push(o);
      }
    });
  }
  return found;
};

/**
 * The first box of a given size on a model.
 * @param decor The model being decorated.
 * @param size The box's size.
 * @returns The box, or null when there is none.
 */
export const findBox = (decor: VariantDecor, size: Vec3): Mesh | null => findBoxes(decor.model.parts, size)[0] ?? null;

/**
 * Swaps a box for one in a new style, also when it sits loose in the
 * model's part list (where `VariantDecor.restyle` alone would drop it).
 * @param decor The model being decorated.
 * @param mesh The box.
 * @param to Its new style.
 * @returns The new box.
 */
export const swapBox = (decor: VariantDecor, mesh: Mesh, to: Restyle): Mesh => {
  const at = decor.model.parts.indexOf(mesh);
  const next = decor.restyle(mesh, to);
  if (at >= 0) {
    decor.model.parts[at] = next;
  }
  return next;
};

/**
 * Adds a box beside the head, in the model's own space (it stays put when
 * the head floats).
 * @param decor The model being decorated.
 * @param size Its size.
 * @param pos Where it sits.
 * @param color Its color.
 * @param glow Whether it glows.
 * @param opacity How opaque it is.
 * @returns The box.
 */
export const putBox = (decor: VariantDecor, size: Vec3, pos: Vec3, color: string, glow = false, opacity = 1): Mesh => {
  const mesh = decor.box(size, pos, color, glow, opacity);
  decor.addToModel(mesh);
  return mesh;
};

/**
 * Where one end of a box is, in its parent's space, taking its turn into
 * account (a bent bow limb's tip).
 * @param mesh The box.
 * @param axis Which of its own axes the end is on (0 x, 1 y, 2 z).
 * @param sign Which end: 1 or -1.
 * @returns The point.
 */
export const boxEnd = (mesh: Mesh, axis: 0 | 1 | 2, sign: number): Vector3 => new Vector3().setComponent(axis, sign / 2).multiply(mesh.scale).applyQuaternion(mesh.quaternion).add(mesh.position);

/**
 * Makes a box flicker like a flame: it swells and squashes about its own
 * size, out of step with others by `phase`.
 * @param decor The model being decorated.
 * @param mesh The box.
 * @param phase Its offset in the flicker.
 * @param amount How far it swells, as a share of its size.
 */
export const flicker = (decor: VariantDecor, mesh: Mesh, phase: number, amount = 0.2): void => {
  const base = mesh.scale.clone();
  decor.animate((time: number): void => {
    const s = 1 + Math.sin(time * 17 + phase) * amount + Math.sin(time * 29 + phase * 2) * amount * 0.5;
    mesh.scale.set(base.x * s, base.y * (2 - s), base.z * s);
  });
};
