// Packages
import { Vector3 } from 'three';
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import {
  BARK,
  BLOODSTEEL_EDGE,
  BLOOD_SHINE,
  BOLT_TIP,
  BONE_DARK,
  CORK,
  ECTO_PALE,
  END_GRAIN,
  FLETCH,
  IRON_EDGE,
  PUMPKIN_STEM,
  SILVER_SHINE,
  SOCKET,
  STONE_DARK,
  VIAL_GLASS,
} from './config/palette';
import { essenceModel } from './essence-models';
import { iconBox } from './icon-box';

// Types
import type { Mesh } from 'three';
import type { Material } from '@halloween/shared/goods/goods';
import type { BoxFactory } from '../../types/models';

/**
 * The axis bones are turned about.
 */
const UP = new Vector3(0, 1, 0);

/**
 * A small heap of one material, as it looks in the bag, made of boxes
 * from `make` (lit icon boxes by default).
 * @param material The material.
 * @param make Makes each box.
 * @returns The heap's boxes.
 */
export function materialModel(material: Material, make: BoxFactory = iconBox.box): Mesh[] {
  const color = RESOURCE_COLORS[material];
  switch (material) {
    case 'wood':
      return [
        ...[[-0.06, 0.045], [0.06, 0.045], [0, 0.13]].flatMap(([y, z]) => [
          make([0.34, 0.09, 0.09], [0, z, y], BARK),
          make([0.02, 0.07, 0.07], [0.17, z, y], END_GRAIN),
          make([0.33, 0.03, 0.03], [0, z + 0.03, y + 0.02], color),
        ]),
      ];
    case 'planks':
      return [0, 1, 2].map((i: number): Mesh => make([0.38, 0.035, 0.11], [(i % 2) * 0.03 - 0.015, 0.018 + i * 0.04, 0], i % 2 ? END_GRAIN : color));
    case 'stone':
      return [
        make([0.13, 0.1, 0.13], [-0.07, 0.05, 0.03], color),
        make([0.11, 0.09, 0.11], [0.07, 0.045, -0.03], STONE_DARK),
        make([0.09, 0.08, 0.09], [0, 0.13, 0], color),
      ];
    case 'iron':
      return [
        make([0.07, 0.05, 0.2], [-0.04, 0.025, 0], color),
        make([0.07, 0.05, 0.2], [0.04, 0.025, 0], IRON_EDGE),
        make([0.07, 0.05, 0.2], [0, 0.075, 0], color),
      ];
    case 'bolts':
      return [-0.5, 0.05, 0.6].flatMap((turn: number, i: number): Mesh[] => fanned(turn, [
        make([0.28, 0.025, 0.025], [0, 0.02 + i * 0.025, 0], color),
        make([0.05, 0.035, 0.035], [0.16, 0.02 + i * 0.025, 0], BOLT_TIP),
        make([0.05, 0.04, 0.01], [-0.13, 0.02 + i * 0.025, 0], FLETCH),
      ]));
    case 'arrows':
      return [-0.7, -0.25, 0.2, 0.65].flatMap((turn: number, i: number): Mesh[] => fanned(turn, [
        make([0.34, 0.02, 0.02], [0, 0.02 + i * 0.022, 0], color),
        make([0.04, 0.035, 0.03], [0.18, 0.02 + i * 0.022, 0], BOLT_TIP),
        make([0.07, 0.045, 0.008], [-0.15, 0.02 + i * 0.022, 0], FLETCH),
      ]));
    case 'bone':
      return [
        ...[-1, 1].flatMap((side: number): Mesh[] => {
          const parts = [
            make([0.34, 0.05, 0.05], [0, 0.03 + (side + 1) * 0.03, 0], color),
            make([0.06, 0.07, 0.1], [0.17, 0.03 + (side + 1) * 0.03, 0], color),
            make([0.06, 0.07, 0.1], [-0.17, 0.03 + (side + 1) * 0.03, 0], color),
          ];
          for (const part of parts) {
            part.position.applyAxisAngle(UP, side * 0.5);
            part.rotation.y = side * 0.5;
          }
          return parts;
        }),
        make([0.16, 0.13, 0.15], [0, 0.17, 0.02], color),
        make([0.11, 0.05, 0.1], [0, 0.09, 0.05], BONE_DARK),
        make([0.04, 0.035, 0.01], [-0.035, 0.165, 0.1], SOCKET),
        make([0.04, 0.035, 0.01], [0.035, 0.165, 0.1], SOCKET),
      ];
    case 'silver':
      return [
        make([0.16, 0.05, 0.08], [-0.02, 0.025, -0.05], color),
        make([0.16, 0.05, 0.08], [0.02, 0.025, 0.05], color),
        make([0.12, 0.04, 0.05], [0, 0.07, 0], SILVER_SHINE),
        make([0.05, 0.04, 0.05], [0.13, 0.02, -0.02], SILVER_SHINE),
      ];
    case 'bloodsteel':
      return [
        make([0.07, 0.05, 0.2], [-0.04, 0.025, 0], color),
        make([0.07, 0.05, 0.2], [0.04, 0.025, 0], BLOODSTEEL_EDGE),
        make([0.07, 0.05, 0.2], [0, 0.075, 0], color),
        make([0.05, 0.005, 0.16], [0, 0.1, 0], BLOODSTEEL_EDGE),
      ];
    case 'tonic':
      return [[-0.07, 0.04], [0.08, -0.03]].flatMap(([x, z]) => [
        make([0.12, 0.14, 0.12], [x, 0.07, z], VIAL_GLASS),
        make([0.1, 0.11, 0.1], [x, 0.065, z + 0.015], color, true),
        make([0.05, 0.06, 0.05], [x, 0.17, z], VIAL_GLASS),
        make([0.06, 0.04, 0.06], [x, 0.21, z], CORK),
      ]);    case 'ectoplasm':
      return [
        make([0.26, 0.08, 0.22], [0, 0.04, 0], color, true),
        make([0.18, 0.08, 0.16], [-0.02, 0.11, 0.01], color, true),
        make([0.1, 0.07, 0.09], [0.01, 0.17, 0], ECTO_PALE, true),
        make([0.06, 0.04, 0.06], [0.14, 0.03, 0.08], color, true),
      ];
    case 'chain':
      return [-0.15, -0.05, 0.05, 0.15].flatMap((x: number, i: number): Mesh[] => (i % 2
        ? [make([0.1, 0.02, 0.06], [x, 0.03, 0], color), make([0.02, 0.02, 0.06], [x - 0.045, 0.03, 0], IRON_EDGE), make([0.02, 0.02, 0.06], [x + 0.045, 0.03, 0], IRON_EDGE)]
        : [make([0.1, 0.06, 0.02], [x, 0.04, 0], color), make([0.02, 0.06, 0.02], [x - 0.045, 0.04, 0], IRON_EDGE), make([0.02, 0.06, 0.02], [x + 0.045, 0.04, 0], IRON_EDGE)]));
    case 'cursed-core':
      return [
        make([0.16, 0.16, 0.16], [0, 0.1, 0], color, true),
        make([0.18, 0.04, 0.18], [0, 0.04, 0], SILVER_SHINE),
        make([0.18, 0.04, 0.18], [0, 0.16, 0], SILVER_SHINE),
        make([0.04, 0.2, 0.04], [0.08, 0.1, 0.08], BLOODSTEEL_EDGE),
        make([0.04, 0.2, 0.04], [-0.08, 0.1, -0.08], BLOODSTEEL_EDGE),
      ];
    case 'pumpkin':
      return [
        make([0.28, 0.2, 0.24], [0, 0.1, 0], color),
        make([0.32, 0.16, 0.14], [0, 0.1, 0], color),
        make([0.04, 0.07, 0.04], [0, 0.23, 0], PUMPKIN_STEM),
      ];
    case 'watering-can':
      return [
        make([0.2, 0.18, 0.16], [0, 0.09, 0], color),
        make([0.21, 0.03, 0.17], [0, 0.17, 0], IRON_EDGE),
        make([0.04, 0.04, 0.2], [0, 0.22, -0.02], IRON_EDGE),
        make([0.18, 0.04, 0.04], [0.16, 0.12, 0], color),
        make([0.05, 0.05, 0.05], [0.26, 0.15, 0], IRON_EDGE),
        make([0.03, 0.03, 0.03], [0.29, 0.15, 0], BLOOD_SHINE, true),
      ];
    case 'holy-water':
    case 'brute-tendon':
    case 'ghoul-fang':
    case 'hex-shard':
    case 'brimstone':
      return essenceModel(material, make);
  }
}

/**
 * Turns the parts of one shaft (an arrow or a bolt) about the pile's
 * middle, so a pile of them fans out instead of lying side by side.
 * @param turn How far it's turned about straight up.
 * @param parts The shaft's parts, laid along x.
 * @returns The same parts, turned.
 */
function fanned(turn: number, parts: Mesh[]): Mesh[] {
  for (const part of parts) {
    part.position.applyAxisAngle(UP, turn);
    part.rotation.y = turn;
  }
  return parts;
}
