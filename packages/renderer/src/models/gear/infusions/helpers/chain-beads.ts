// Packages
import { Mesh } from 'three';

// Local Imports
import { WHIP_SEGMENT } from '../../config/whip';

// Types
import type { Object3D } from 'three';
import type { VariantDecor } from '../variant-decor';

/**
 * Sets a bead on every few links of the Mourning Star's chain, on either
 * build: in its joints when held (so the beads bend with the whip), or
 * beside the flattened links on the ground and in icons.
 * @param decor The model being decorated.
 * @param every A bead on one link in this many.
 * @param size How big each bead is.
 * @param color Their color.
 * @param glow Whether they glow.
 * @returns The beads, from the handle out.
 */
export const chainBeads = (decor: VariantDecor, every: number, size: number, color: string, glow: boolean): Mesh[] => {
  const beads: Mesh[] = [];
  const joints = decor.model.joints;
  if (joints) {
    joints.forEach((joint: Object3D, i: number): void => {
      if (i % every === every - 1) {
        const bead = decor.box([size, size, size], [0, -WHIP_SEGMENT / 2, 0], color, glow);
        joint.add(bead);
        beads.push(bead);
      }
    });
    return beads;
  }
  const links = decor.model.parts.filter((part: Object3D): part is Mesh => part instanceof Mesh && Math.abs(part.scale.y - (WHIP_SEGMENT + 0.02)) < 1e-4);
  links.forEach((link: Mesh, i: number): void => {
    if (i % every === every - 1) {
      const bead = decor.box([size, size, size], [link.position.x, link.position.y, link.position.z], color, glow);
      bead.quaternion.copy(link.quaternion);
      decor.addToModel(bead);
      beads.push(bead);
    }
  });
  return beads;
};
