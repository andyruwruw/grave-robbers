// Packages
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import {
  BLOOD_SHINE,
  CANDY_ORANGE,
  CANDY_SHINE,
  CANDY_TWIST,
  CANDY_YELLOW,
} from './config/palette';
import { iconBox } from './icon-box';

// Types
import type { Mesh } from 'three';
import type { Resource } from '@halloween/shared/goods/goods';
import type { BoxFactory } from '../../types/models';

/**
 * Candy (a wrapped sweet: yellow with orange bands and twisted orange
 * ends) or blood (a drop).
 * @param resource The resource.
 * @param make Makes each box.
 * @param shine Whether a blood drop has its shine.
 * @returns The model's boxes.
 */
export function resourceModel(resource: Resource, make: BoxFactory = iconBox.box, shine = true): Mesh[] {
  if (resource === 'candy') {
    return [
      make([0.18, 0.14, 0.12], [0, 0.1, 0], CANDY_YELLOW),
      make([0.025, 0.145, 0.125], [-0.045, 0.1, 0], CANDY_ORANGE),
      make([0.025, 0.145, 0.125], [0.045, 0.1, 0], CANDY_ORANGE),
      make([0.1, 0.02, 0.02], [-0.01, 0.15, 0.06], CANDY_SHINE),
      ...[-1, 1].flatMap((side: number): Mesh[] => [
        make([0.03, 0.09, 0.08], [side * 0.1, 0.1, 0], CANDY_YELLOW),
        make([0.03, 0.05, 0.05], [side * 0.125, 0.1, 0], CANDY_TWIST),
        make([0.03, 0.09, 0.07], [side * 0.15, 0.1, 0], CANDY_ORANGE),
        make([0.03, 0.14, 0.09], [side * 0.18, 0.1, 0], CANDY_ORANGE),
        make([0.03, 0.19, 0.1], [side * 0.21, 0.1, 0], CANDY_ORANGE),
        make([0.031, 0.02, 0.101], [side * 0.21, 0.1, 0], CANDY_TWIST),
      ]),
    ];
  }
  const color = RESOURCE_COLORS.blood;
  return [
    ...([[0.12, 0.01], [0.2, 0.05], [0.22, 0.1], [0.18, 0.15], [0.13, 0.2], [0.08, 0.25], [0.04, 0.29]] as const)
      .map(([w, y]): Mesh => make([w, 0.05, w], [0, y + 0.025, 0], color)),
    ...(shine ? [
      make([0.04, 0.07, 0.02], [-0.06, 0.15, 0.09], BLOOD_SHINE),
      make([0.025, 0.03, 0.02], [-0.035, 0.21, 0.065], BLOOD_SHINE),
    ] : []),
  ];
}
