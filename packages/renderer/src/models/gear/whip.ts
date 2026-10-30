// Packages
import { Group } from 'three';

// Local Imports
import {
  EDGE,
  GRIP,
  IRON,
  WHIP_CHAIN,
  WHIP_CHAIN_DARK,
  WHIP_LEATHER,
} from './config/palette';
import { WHIP_SEGMENT, WHIP_SEGMENTS } from './config/whip';

// Types
import type { Mesh } from 'three';
import type { BoxFactory } from '../../types/models';

/**
 * The morning star: a leather whip on a short wooden handle, ending in a
 * small spiked iron ball, as a chain of joints (each `joints[i]` bends
 * about z) so the avatar can coil and crack it. Laid out straight down -y
 * from the hand.
 * @param box Makes each box.
 * @returns The whip's root, its joints in order, and the spiked ball.
 */
export function buildWhip(box: BoxFactory): { root: Group; joints: Group[]; tip: Mesh } {
  const root = new Group();
  root.add(box([0.06, 0.1, 0.06], [0, 0, 0], GRIP), box([0.055, 0.2, 0.055], [0, -0.13, 0], WHIP_LEATHER), box([0.07, 0.03, 0.07], [0, -0.23, 0], IRON), box([0.08, 0.03, 0.08], [0, 0.06, 0], IRON));
  const joints: Group[] = [];
  let parent: Group = root;
  let at = -0.25;
  for (let i = 0; i < WHIP_SEGMENTS; i++) {
    const joint = new Group();
    joint.position.y = at;
    const color = i % 2 ? WHIP_CHAIN_DARK : WHIP_CHAIN;
    if (i % 2) {
      joint.add(box([0.018, WHIP_SEGMENT + 0.02, 0.05], [0, -WHIP_SEGMENT / 2, 0], color));
    } else {
      joint.add(box([0.05, WHIP_SEGMENT + 0.02, 0.018], [0, -WHIP_SEGMENT / 2, 0], color));
    }
    parent.add(joint);
    joints.push(joint);
    parent = joint;
    at = -WHIP_SEGMENT;
  }
  const tip = box([0.13, 0.13, 0.13], [0, -0.08, 0], IRON);
  parent.add(
    tip,
    box([0.035, 0.035, 0.22], [0, -0.08, 0], EDGE),
    box([0.22, 0.035, 0.035], [0, -0.08, 0], EDGE),
    box([0.035, 0.22, 0.035], [0, -0.08, 0], EDGE),
    box([0.16, 0.03, 0.16], [0, -0.08, 0], WHIP_CHAIN_DARK),
  );
  return { root, joints, tip };
}
