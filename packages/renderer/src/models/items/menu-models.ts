// Local Imports
import {
  BUTTON_BLUE,
  BUTTON_GREEN,
  EYE_ROWS,
  EYE_WHITE,
  GEAR_ROWS,
  PAD_BODY,
  PAD_DARK,
  PAD_ROWS,
  SHIELD_ROWS,
  SPEAKER_ROWS,
} from './config/menu-icons';
import {
  BRASS,
  CANDY_YELLOW,
  GREY,
  GREY_DARK,
  GREY_LIGHT,
  HEART_RED,
  LEATHER_DARK,
  NODE_GLOW,
  SOCKET,
} from './config/palette';
import { voxelRows } from './helpers/voxel-rows';
import { iconBox } from './icon-box';

// Types
import type { Mesh } from 'three';
import type { UiIcon } from '../../types/icons';

/**
 * The settings menu's icons.
 */
export type MenuIcon = Extract<UiIcon, 'settings' | 'gameplay' | 'graphics' | 'controls' | 'audio'>;

/**
 * A sword lying diagonally behind the gameplay shield, hilt at the lower
 * left and tip at the upper right.
 * @returns The sword's boxes.
 */
const diagonalSword = (): Mesh[] => {
  const box = iconBox.box;
  const along = (s: number): [number, number, number] => [s * Math.SQRT1_2, s * Math.SQRT1_2, -0.04];
  const parts = [
    box([0.11, 1.2, 0.05], along(0.22), GREY_LIGHT),
    box([0.04, 1.1, 0.06], along(0.2), GREY),
    box([0.34, 0.09, 0.08], along(-0.42), BRASS),
    box([0.08, 0.18, 0.07], along(-0.55), LEATHER_DARK),
    box([0.12, 0.11, 0.1], along(-0.68), BRASS),
  ];
  parts.forEach((m: Mesh): void => {
    m.rotation.z = -Math.PI / 4;
  });
  return parts;
};

/**
 * The settings menu's buttons as little models: a chunky iron gear for
 * settings, a red shield over a sword for gameplay, a glowing cat's eye for
 * graphics, a gamepad with sticks and buttons for controls, and a speaker
 * with glowing sound waves for audio.
 * @param icon The menu button.
 * @returns The model's boxes.
 */
export const menuModel = (icon: MenuIcon): Mesh[] => {
  const box = iconBox.box;
  switch (icon) {
    case 'settings':
      return voxelRows(GEAR_ROWS, { T: { color: GREY_LIGHT, depth: 0.14 }, X: { color: GREY_LIGHT, depth: 0.14 }, H: { color: GREY, depth: 0.2 } }, 0.08);
    case 'gameplay':
      return [
        ...diagonalSword(),
        ...voxelRows(SHIELD_ROWS, { R: { color: GREY, depth: 0.12 }, F: { color: HEART_RED, depth: 0.1 }, B: { color: BRASS, depth: 0.16 } }, 0.06).map((m: Mesh): Mesh => {
          m.position.z += 0.06;
          return m;
        }),
      ];
    case 'graphics':
      return voxelRows(EYE_ROWS, {
        O: { color: GREY_DARK, depth: 0.14 },
        W: { color: EYE_WHITE, depth: 0.1 },
        I: { color: NODE_GLOW, depth: 0.12, glow: true },
        P: { color: SOCKET, depth: 0.14 },
        S: { color: '#ffffff', depth: 0.14, glow: true },
      }, 0.075);
    case 'controls':
      return [
        ...voxelRows(PAD_ROWS, { S: { color: PAD_DARK, depth: 0.12 }, B: { color: PAD_BODY, depth: 0.18 } }, 0.065),
        box([0.15, 0.15, 0.06], [-0.26, 0.04, 0.11], PAD_DARK),
        box([0.1, 0.1, 0.12], [-0.26, 0.04, 0.17], GREY_LIGHT),
        box([0.15, 0.15, 0.06], [0.1, -0.04, 0.11], PAD_DARK),
        box([0.1, 0.1, 0.12], [0.1, -0.04, 0.17], GREY_LIGHT),
        box([0.07, 0.07, 0.06], [0.3, 0.12, 0.11], CANDY_YELLOW, true),
        box([0.07, 0.07, 0.06], [0.3, -0.02, 0.11], BUTTON_GREEN, true),
        box([0.07, 0.07, 0.06], [0.23, 0.05, 0.11], BUTTON_BLUE, true),
        box([0.07, 0.07, 0.06], [0.37, 0.05, 0.11], HEART_RED, true),
      ];
    case 'audio':
      return voxelRows(SPEAKER_ROWS, { D: { color: GREY_DARK, depth: 0.22 }, G: { color: GREY_LIGHT, depth: 0.16 }, W: { color: NODE_GLOW, depth: 0.08, glow: true } }, 0.07);
  }
};
