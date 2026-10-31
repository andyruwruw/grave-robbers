// Packages
import { Group } from 'three';

// Types
import type { BoxFactory } from '../../../../types/models';

/**
 * A small wing: feathers fanning up (+y) from the group's middle, longest
 * first, each tilted further toward +x. Turn and place the group to fit it.
 * @param box Makes each feather.
 * @param count How many feathers.
 * @param length How long the first feather is.
 * @param color Their color.
 * @returns The wing.
 */
export const featherFan = (box: BoxFactory, count: number, length: number, color: string): Group => {
  const wing = new Group();
  for (let i = 0; i < count; i++) {
    const long = length * (1 - i * 0.18);
    const turn = -0.25 - i * 0.4;
    const feather = box([0.026, long, 0.01], [-Math.sin(turn) * long * 0.5, Math.cos(turn) * long * 0.5, 0], color);
    feather.rotation.z = turn;
    wing.add(feather);
  }
  return wing;
};
