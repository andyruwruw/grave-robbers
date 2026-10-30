// Types
import type { Group, Mesh, Object3D } from 'three';

/**
 * Makes one box: size, position, color, and whether it glows (unlit).
 */
export type BoxFactory = (size: [number, number, number], pos: [number, number, number], color: string, glow?: boolean) => Mesh;

/**
 * A piece of gear built from boxes, plus the parts the avatar animates: the
 * cutting edge (or point) that leaves the swing streak, and a flame.
 */
export interface GearModel {
  /**
   * Every part of the model, ready to add to a group.
   */
  parts: Object3D[];

  /**
   * The cutting edge or point that leaves the swing streak.
   */
  tip: Mesh | null;

  /**
   * The flame that flickers (the torch).
   */
  flame: Mesh | null;

  /**
   * A part that turns while it fires (the repeating crossbow's drum),
   * about its local y.
   */
  spinner?: Group;
}

/**
 * Builds one gear model from boxes.
 */
export type GearBuilder = (box: BoxFactory) => GearModel;
