// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
} from 'three';

// Local Imports
import { toWorld } from '../../space/world-coords';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { PileAnimations } from '../pile-animations';
import type { PileMaterials } from '../pile-materials';

/**
 * The unit box every piece of a drop is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * What every kind of ground drop is built with.
 */
export interface DropContext {
  /**
   * The shared materials.
   */
  materials: PileMaterials;

  /**
   * Where glints and bobbing drops go to be animated.
   */
  animations: PileAnimations;

  /**
   * Ground height at a tile-space point, so drops on a hill sit on top of it.
   */
  groundHeight: (x: number, y: number) => number;
}

/**
 * One kind of thing lying on the ground, built as a group standing where
 * the item is.
 */
export abstract class GroundDrop {
  /**
   * The unit box every piece is scaled from.
   */
  protected readonly _unitBox = UNIT_BOX;

  /**
   * Starts a builder.
   * @param _ctx What drops are built with.
   */
  constructor(protected readonly _ctx: DropContext) {}

  /**
   * Builds the drop for an item.
   * @param item The item on the ground.
   * @returns The drop's group, standing where the item is.
   */
  abstract build(item: ItemState): Group;

  /**
   * A new group standing on the ground where the item is.
   * @param item The item on the ground.
   * @returns The group.
   */
  protected place(item: ItemState): Group {
    const pile = new Group();
    const { x, z } = toWorld(item.x, item.y);
    pile.position.set(x, this._ctx.groundHeight(item.x, item.y), z);
    return pile;
  }

  /**
   * Adds a twinkling glint to a drop, with its own copy of the glint
   * material.
   * @param pile The drop's group.
   * @param item The item on the ground (its id sets the glint's beat).
   * @param x Where the glint sits in the drop, x.
   * @param y Where the glint sits in the drop, y.
   * @param z Where the glint sits in the drop, z.
   * @returns The glint.
   */
  protected addGlint(pile: Group, item: ItemState, x: number, y: number, z: number): Mesh {
    const glint = new Mesh(UNIT_BOX, this._ctx.materials.glint.clone());
    glint.position.set(x, y, z);
    pile.add(glint);
    this._ctx.animations.addGlint(glint, item.id * 1.7);
    return glint;
  }
}
