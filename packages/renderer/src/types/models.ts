// Types
import type { Group, Mesh, Object3D } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';

/**
 * Makes one box: size, position, color, whether it glows (unlit), and how
 * opaque it is (1 when left out; below 1 it's see-through and writes no
 * depth).
 */
export type BoxFactory = (size: [number, number, number], pos: [number, number, number], color: string, glow?: boolean, opacity?: number) => Mesh;

/**
 * The working end of a weapon (a blade, a hammer's head, a bow's limbs),
 * where infusions decorate and reshape it.
 */
export interface GearHead {
  /**
   * The middle of the head, in the space of the parts' parent (the model,
   * or the whip's last joint).
   */
  center: [number, number, number];

  /**
   * How big the head is along each axis.
   */
  size: [number, number, number];

  /**
   * The boxes that make up the head.
   */
  parts: Object3D[];

  /**
   * The axis its edge runs along (0 x, 1 y, 2 z).
   */
  along: 0 | 1 | 2;

  /**
   * The axis its edge faces out on, toward + (0 x, 1 y, 2 z).
   */
  out: 0 | 1 | 2;
}

/**
 * Moves an infused model's animated bits for one frame.
 * @param time Seconds since the renderer started.
 * @param dt Seconds since the last frame.
 * @param holder The player holding it, or null (on the ground, an icon).
 */
export type GearAnimate = (time: number, dt: number, holder: PlayerState | null) => void;

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

  /**
   * The working end, for infusions to decorate and reshape.
   */
  head?: GearHead;

  /**
   * The handle or shaft, for wraps and lashings.
   */
  haft?: Mesh;

  /**
   * The whip's joints in order, when built to be bent (the morning star in
   * hand).
   */
  joints?: Group[];

  /**
   * An infused model's per-frame motion (wisps, embers, motes, a floating
   * head's bob).
   */
  animate?: GearAnimate;
}

/**
 * Builds one gear model from boxes.
 */
export type GearBuilder = (box: BoxFactory) => GearModel;
