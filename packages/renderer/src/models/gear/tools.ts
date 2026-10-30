// Local Imports
import {
  BAND,
  DARK_WOOD,
  LANTERN_FRAME,
  LANTERN_GLASS,
  PALE_WOOD,
  SILVER,
  STEEL,
} from './config/palette';

// Types
import type { Mesh } from 'three';
import type { BoxFactory } from '../../types/models';

/**
 * The spade a player digs graves with: a D grip, a long ash handle, and a
 * flat iron blade with a bright edge, hanging down -y from the hand at the
 * origin. Only ever shown for a dig, so it's not a piece of gear.
 * @param box Makes each box.
 * @returns The spade's boxes.
 */
export function buildSpade(box: BoxFactory): Mesh[] {
  return [
    box([0.16, 0.035, 0.04], [0, 0.06, 0], DARK_WOOD),
    box([0.035, 0.08, 0.04], [-0.065, 0.02, 0], DARK_WOOD),
    box([0.035, 0.08, 0.04], [0.065, 0.02, 0], DARK_WOOD),
    box([0.045, 0.7, 0.045], [0, -0.35, 0], PALE_WOOD),
    box([0.07, 0.06, 0.05], [0, -0.71, 0], BAND),
    box([0.2, 0.22, 0.025], [0, -0.85, 0], STEEL),
    box([0.16, 0.035, 0.026], [0, -0.975, 0], SILVER),
  ];
}

/**
 * The lantern every player carries when nothing else is in their off hand,
 * hanging down -y from the hand at the origin.
 * @param box Makes each box.
 * @returns The lantern's boxes.
 */
export function buildLantern(box: BoxFactory): Mesh[] {
  return [
    box([0.02, 0.05, 0.02], [0, -0.26, 0], LANTERN_FRAME),
    box([0.11, 0.03, 0.11], [0, -0.29, 0], LANTERN_FRAME),
    box([0.08, 0.1, 0.08], [0, -0.35, 0], LANTERN_GLASS, true),
    box([0.11, 0.02, 0.11], [0, -0.41, 0], LANTERN_FRAME),
  ];
}
