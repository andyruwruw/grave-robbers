// Packages
import { Group } from 'three';

// Local Imports
import {
  AVATAR_SCALE,
  BELT,
  BOOT,
  BUCKLE,
  DARK,
  SKIN,
  TROUSERS,
} from './config/player-look';
import { HIP_HEIGHT } from './config/player-poses';

// Types
import type { VoxelParts } from '../shared/voxel-parts';

/**
 * The jointed figure of a player: legs, hips, body, head, the tool arm
 * with its wrist and grip, and the off arm. The motions pose these.
 */
export class PlayerRig {
  /**
   * The left leg.
   */
  readonly legL = new Group();

  /**
   * The right leg.
   */
  readonly legR = new Group();

  /**
   * The hips, which the torso tips from.
   */
  readonly hips = new Group();

  /**
   * The right (tool) arm, swung from the shoulder.
   */
  readonly tool = new Group();

  /**
   * The tool arm's wrist.
   */
  readonly wrist = new Group();

  /**
   * Turns what's in hand about its own handle, to lay a scythe's blade flat
   * for a sweep.
   */
  readonly grip = new Group();

  /**
   * The left (off) arm, carrying the lantern, torch, or shield.
   */
  readonly lanternArm = new Group();

  /**
   * Starts a rig around the avatar's body and head.
   * @param body The body (everything above the legs).
   * @param head The head.
   */
  constructor(readonly body: Group, readonly head: Group) {}

  /**
   * Builds the legs, the body, and the hooded head: hood and cloak in the
   * player's color, a muted tunic, and a rounded face.
   * @param parts The avatar's boxes.
   * @param color The player's color.
   * @param cloak The player's color darkened, for the cloak.
   * @param tunic The player's color muted, for the tunic.
   */
  build(parts: VoxelParts, color: string, cloak: string, tunic: string): void {
    const { box } = parts;
    for (const [leg, side] of [[this.legL, -1], [this.legR, 1]] as const) {
      leg.position.z = 0.08 * side;
      leg.add(
        box([0.12, 0.17, 0.12], [0, 0.155, 0], TROUSERS),
        box([0.15, 0.08, 0.13], [0.015, 0.04, 0], BOOT),
      );
    }

    this.body.add(
      box([0.24, 0.32, 0.34], [0, 0.41, 0], tunic),
      box([0.25, 0.04, 0.35], [0, 0.29, 0], BELT),
      box([0.02, 0.04, 0.05], [0.13, 0.29, 0], BUCKLE),
      box([0.05, 0.44, 0.38], [-0.14, 0.4, 0], cloak),
    );

    this.head.position.set(0.01, 0.58, 0);
    this.head.add(
      ...parts.roundedBox([0.28, 0.26, 0.3], [0, 0.13, 0], SKIN),
      box([0.02, 0.06, 0.05], [0.145, 0.14, -0.065], DARK),
      box([0.02, 0.06, 0.05], [0.145, 0.14, 0.065], DARK),
      box([0.3, 0.06, 0.3], [-0.01, 0.28, 0], color),
      box([0.07, 0.24, 0.32], [-0.13, 0.15, 0], color),
      box([0.22, 0.2, 0.04], [-0.02, 0.16, -0.16], color),
      box([0.22, 0.2, 0.04], [-0.02, 0.16, 0.16], color),
      box([0.05, 0.05, 0.3], [0.12, 0.27, 0], cloak),
    );
    this.body.add(this.head);
  }

  /**
   * Hangs the body from the hips and puts the figure in the avatar's
   * group, at the player scale.
   * @param group The avatar's group.
   */
  assemble(group: Group): void {
    const torso = new Group();
    torso.position.y = -HIP_HEIGHT;
    torso.add(this.body);
    this.hips.position.y = HIP_HEIGHT;
    this.hips.add(torso);
    group.add(this.legL, this.legR, this.hips);
    group.scale.setScalar(AVATAR_SCALE);
  }
}
