// Local Imports
import {
  ANVIL,
  ANVIL_TOP,
  BRASS,
  DEAD_WOOD,
  DEAD_WOOD_DARK,
  GREY,
  GREY_DARK,
  GREY_LIGHT,
  HAMMER_HANDLE,
  HEART_CRACK,
  HEART_CRACK_CELLS,
  HEART_EMPTY,
  HEART_RED,
  HEART_ROWS,
  HEART_SHINE,
  HEART_WOUND,
  LEATHER,
  LEATHER_DARK,
  NODE_GLOW,
  SILVER_SHINE,
} from './config/palette';
import { iconBox } from './icon-box';
import { menuModel } from './menu-models';

// Types
import type { Mesh } from 'three';
import type { UiIcon } from '../../types/icons';

/**
 * The phone's buttons as little models: a satchel for the bag, a hammer on
 * an anvil for crafting, a bare tree with glowing buds for the skill tree,
 * a sword stood in an anvil with glowing motes for the armory, a chunky
 * heart (red, grey for a fresh wound, dark when empty, or brass for
 * overheal), and,
 * in grey, an open hand (thumb on the left for the main hand, mirrored for
 * the off hand) and a breastplate, labeling the bag's equipped slots, and
 * the settings menu's buttons (see `menuModel`).
 * @param icon The button or heart.
 * @returns The model's boxes.
 */
export function uiModel(icon: UiIcon): Mesh[] {
  const box = iconBox.box;
  switch (icon) {
    case 'bag':
      return [
        box([0.5, 0.42, 0.3], [0, 0, 0], LEATHER),
        box([0.52, 0.2, 0.32], [0, 0.14, 0], LEATHER_DARK),
        box([0.08, 0.1, 0.04], [0, 0.04, 0.17], BRASS),
        box([0.06, 0.24, 0.06], [-0.18, 0.32, 0], LEATHER_DARK),
        box([0.06, 0.24, 0.06], [0.18, 0.32, 0], LEATHER_DARK),
        box([0.42, 0.06, 0.06], [0, 0.43, 0], LEATHER_DARK),
        box([0.16, 0.16, 0.06], [0.12, -0.08, 0.16], LEATHER_DARK),
      ];
    case 'craft':
      return [
        box([0.34, 0.1, 0.24], [0, -0.3, 0], ANVIL),
        box([0.16, 0.18, 0.14], [0, -0.16, 0], ANVIL),
        box([0.5, 0.12, 0.22], [0, -0.02, 0], ANVIL_TOP),
        box([0.14, 0.08, 0.12], [0.31, 0.0, 0], ANVIL_TOP),
        box([0.06, 0.44, 0.06], [-0.05, 0.2, 0], HAMMER_HANDLE),
        box([0.26, 0.12, 0.12], [-0.05, 0.44, 0], ANVIL),
        box([0.06, 0.12, 0.12], [-0.2, 0.44, 0], ANVIL_TOP),
      ];
    case 'tree':
      return [
        box([0.12, 0.42, 0.12], [0, -0.14, 0], DEAD_WOOD),
        box([0.26, 0.06, 0.18], [0, -0.36, 0], DEAD_WOOD_DARK),
        box([0.06, 0.24, 0.06], [-0.12, 0.14, 0], DEAD_WOOD),
        box([0.16, 0.06, 0.06], [-0.06, 0.04, 0], DEAD_WOOD),
        box([0.06, 0.2, 0.06], [0.13, 0.18, 0], DEAD_WOOD),
        box([0.16, 0.06, 0.06], [0.07, 0.1, 0], DEAD_WOOD),
        box([0.06, 0.2, 0.06], [0, 0.16, 0], DEAD_WOOD_DARK),
        box([0.1, 0.1, 0.1], [-0.12, 0.29, 0], NODE_GLOW, true),
        box([0.1, 0.1, 0.1], [0.13, 0.31, 0], NODE_GLOW, true),
        box([0.1, 0.1, 0.1], [0, 0.29, 0], NODE_GLOW, true),
      ];
    case 'armory':
      return [
        box([0.34, 0.1, 0.24], [0, -0.34, 0], ANVIL),
        box([0.16, 0.14, 0.14], [0, -0.22, 0], ANVIL),
        box([0.5, 0.1, 0.22], [0, -0.1, 0], ANVIL_TOP),
        box([0.08, 0.42, 0.04], [0, 0.16, 0], GREY_LIGHT),
        box([0.04, 0.4, 0.05], [0, 0.17, 0], SILVER_SHINE),
        box([0.26, 0.06, 0.08], [0, 0.39, 0], BRASS),
        box([0.06, 0.12, 0.06], [0, 0.48, 0], LEATHER_DARK),
        box([0.08, 0.08, 0.08], [-0.22, 0.24, 0.04], NODE_GLOW, true),
        box([0.07, 0.07, 0.07], [0.21, 0.12, 0.04], NODE_GLOW, true),
        box([0.06, 0.06, 0.06], [0.16, 0.36, 0.04], NODE_GLOW, true),
      ];
    case 'hand-main':
    case 'hand-off': {
      const side = icon === 'hand-main' ? -1 : 1;
      return [
        box([0.34, 0.3, 0.12], [0, -0.06, 0], GREY),
        box([0.3, 0.12, 0.12], [0, -0.26, 0], GREY_DARK),
        ...[-0.12, -0.04, 0.04, 0.12].map((x: number, i: number): Mesh => box([0.07, i === 1 || i === 2 ? 0.26 : 0.2, 0.1], [x, i === 1 || i === 2 ? 0.2 : 0.17, 0], GREY_LIGHT)),
        box([0.08, 0.18, 0.1], [side * 0.22, -0.02, 0.02], GREY_LIGHT),
        box([0.08, 0.08, 0.1], [side * 0.18, -0.12, 0.02], GREY),
      ];
    }
    case 'settings':
    case 'gameplay':
    case 'graphics':
    case 'controls':
    case 'audio':
      return menuModel(icon);
    case 'armor':
      return [
        box([0.44, 0.42, 0.2], [0, -0.06, 0], GREY),
        box([0.36, 0.1, 0.22], [0, -0.3, 0], GREY_DARK),
        box([0.16, 0.12, 0.26], [-0.25, 0.14, 0], GREY_LIGHT),
        box([0.16, 0.12, 0.26], [0.25, 0.14, 0], GREY_LIGHT),
        box([0.16, 0.08, 0.22], [0, 0.17, 0.01], GREY_DARK),
        box([0.04, 0.3, 0.02], [0, -0.06, 0.11], GREY_LIGHT),
      ];
    default: {
      const color = icon === 'heart' ? HEART_RED : icon === 'heart-wound' ? HEART_WOUND : icon === 'heart-over' ? BRASS : HEART_EMPTY;
      const cell = 0.1;
      const cellColor = (r: number, x: number): string => {
        if (icon === 'heart' && r === 1 && x === 1) {
          return HEART_SHINE;
        }
        return icon === 'heart-wound' && HEART_CRACK_CELLS.some(([cr, cx]): boolean => cr === r && cx === x) ? HEART_CRACK : color;
      };
      return HEART_ROWS.flatMap((row: string, r: number): Mesh[] => [...row].flatMap((c: string, x: number): Mesh[] => (c === 'X'
        ? [box([cell, cell, 0.16], [(x - 3) * cell, (2.5 - r) * cell, 0], cellColor(r, x))]
        : [])));
    }
  }
}
