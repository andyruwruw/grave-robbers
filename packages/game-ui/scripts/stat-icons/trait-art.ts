// Types
import type { PixelArt } from './types';

/**
 * Shared colors.
 */
const BONE = '#ece3c8';
const BONE_DARK = '#2a2420';
const HEART = '#e5484d';
const IRON = '#4a4f58';

/**
 * The traits' icons, and the details' other little markers.
 */
export const TRAIT_ART: Record<string, PixelArt> = {
  'crosshair': {
    rows: [
      '....C....',
      '..CCCCC..',
      '.C..C..C.',
      '.C.....C.',
      'CCC.R.CCC',
      '.C.....C.',
      '.C..C..C.',
      '..CCCCC..',
      '....C....',
    ],
    colors: { C: '#c9cdd4', R: '#e5484d' },
    glow: 'R',
  },
  'skull': {
    rows: [
      '..WWWWW..',
      '.WWWWWWW.',
      'WWWWWWWWW',
      'WDDWWWDDW',
      'WDDWWWDDW',
      'WWWWDWWWW',
      '.WWWWWWW.',
      '..WDWDW..',
      '..WWWWW..',
    ],
    colors: { W: BONE, D: BONE_DARK },
  },
  'holy': {
    rows: [
      '...HH...',
      '...HH...',
      'HHHHHHHH',
      'HHHHHHHH',
      '...HH...',
      '...HH...',
      '...HH...',
      '...HH...',
    ],
    colors: { H: '#ffe08a' },
    glow: 'H',
  },
  'fang': {
    rows: [
      'MMMMMMMMM',
      'MWWWWWWWM',
      '.WWWWWWW.',
      '.W.....W.',
      '.W.....W.',
      '.R.......',
      '.R.......',
    ],
    colors: { M: '#6a0f18', W: BONE, R: '#b0141e' },
  },
  'heart-crack': {
    rows: [
      '.HH...HH.',
      'HHHH.HHHH',
      'HHHHCHHHH',
      'HHHCHHHHH',
      '.HHHCHHH.',
      '..HHCHH..',
      '...HHH...',
      '....H....',
    ],
    colors: { H: '#8a2430', C: '#1c070b' },
  },
  'heart-plus': {
    rows: [
      '.HH...HH.',
      'HHHH.HHHH',
      'HHHHWHHHH',
      'HHHWWWHHH',
      '.HHHWHHH.',
      '..HHHHH..',
      '...HHH...',
      '....H....',
    ],
    colors: { H: HEART, W: '#7ddc4a' },
    glow: 'W',
  },
  'sparkle': {
    rows: [
      '....S....',
      '....S....',
      '...SSS...',
      'SSSSWSSSS',
      '...SSS...',
      '....S....',
      '....S....',
    ],
    colors: { S: '#f5c62e', W: '#fff7d6' },
    glow: 'SW',
  },
  'anvil': {
    rows: [
      'AAAAAAAAAA',
      '.AAAAAAAA.',
      '....AAA...',
      '....AAA...',
      '...AAAAA..',
      '..AAAAAAA.',
    ],
    colors: { A: IRON },
  },
  'lock': {
    rows: [
      '..SSSSS..',
      '.S.....S.',
      '.S.....S.',
      'GGGGGGGGG',
      'GGGGDGGGG',
      'GGGDDDGGG',
      'GGGGDGGGG',
      'GGGGGGGGG',
    ],
    colors: { S: '#9aa0a8', G: '#c9a24a', D: '#2a2010' },
  },
  'scroll': {
    rows: [
      'BBBBBBBBB',
      '.PPPPPPP.',
      '.PLLLLLP.',
      '.PPPPPPP.',
      '.PLLLLPP.',
      '.PPPPPPP.',
      '.PLLLLLP.',
      '.PPPPPPP.',
      'BBBBBBBBB',
    ],
    colors: { B: '#6b4424', P: '#e8d6a8', L: '#8a6a40' },
  },
  'arrow': {
    rows: [
      '.....A...',
      '.....AA..',
      'AAAAAAAA.',
      'AAAAAAAAA',
      'AAAAAAAA.',
      '.....AA..',
      '.....A...',
    ],
    colors: { A: '#c9cdd4' },
  },
};
