// Packages
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import { BONE_DARK, CORK, SILVER_SHINE, SOCKET, VIAL_GLASS } from './config/palette';

// Types
import type { Mesh } from 'three';
import type { Material } from '@halloween/shared/goods/goods';
import type { BoxFactory } from '../../types/models';

/**
 * The infusion essences that have a bag model of their own here.
 */
export type EssenceMaterial = Extract<Material, 'holy-water' | 'brute-tendon' | 'ghoul-fang' | 'hex-shard' | 'brimstone'>;

/**
 * A small heap of one infusion essence, as it looks in the bag: a vial of
 * holy water, a coil of tendon, a pair of fangs, a hex shard, or a lump
 * of smouldering brimstone.
 * @param material The essence.
 * @param make Makes each box.
 * @returns The heap's boxes.
 */
export function essenceModel(material: EssenceMaterial, make: BoxFactory): Mesh[] {
  const color = RESOURCE_COLORS[material];
  switch (material) {
    case 'holy-water':
      return [
        make([0.14, 0.16, 0.14], [0, 0.08, 0], VIAL_GLASS),
        make([0.11, 0.12, 0.11], [0, 0.07, 0], color, true),
        make([0.06, 0.06, 0.06], [0, 0.19, 0], VIAL_GLASS),
        make([0.07, 0.04, 0.07], [0, 0.235, 0], CORK),
        make([0.02, 0.08, 0.02], [0, 0.08, 0.075], SILVER_SHINE),
        make([0.06, 0.02, 0.02], [0, 0.09, 0.075], SILVER_SHINE),
      ];
    case 'brute-tendon':
      return [
        make([0.26, 0.05, 0.06], [0, 0.025, -0.05], color),
        make([0.22, 0.05, 0.06], [0.02, 0.025, 0.04], color),
        make([0.06, 0.05, 0.12], [-0.12, 0.05, 0], color),
        make([0.05, 0.03, 0.05], [0.13, 0.03, -0.05], BONE_DARK),
      ];
    case 'ghoul-fang':
      return [-0.05, 0.05].flatMap((x: number, i: number): Mesh[] => [
        make([0.05, 0.05, 0.16], [x, 0.025, i * 0.03], color),
        make([0.035, 0.04, 0.06], [x, 0.02, 0.1 + i * 0.03], color),
        make([0.05, 0.05, 0.04], [x, 0.025, -0.07 + i * 0.03], SOCKET),
      ]);
    case 'hex-shard':
      return [
        make([0.08, 0.2, 0.06], [0, 0.1, 0], color, true),
        make([0.05, 0.1, 0.04], [0.06, 0.05, 0.03], color, true),
        make([0.04, 0.06, 0.04], [-0.05, 0.03, -0.02], color, true),
      ];
    case 'brimstone':
      return [
        make([0.2, 0.12, 0.18], [0, 0.06, 0], SOCKET),
        make([0.14, 0.08, 0.12], [0.02, 0.15, 0], SOCKET),
        make([0.06, 0.03, 0.14], [0.06, 0.12, 0], color, true),
        make([0.12, 0.03, 0.04], [-0.03, 0.09, 0.08], color, true),
      ];
  }
}
