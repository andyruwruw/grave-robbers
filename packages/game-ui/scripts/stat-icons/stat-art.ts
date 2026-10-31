// Types
import type { PixelArt } from './types';

/**
 * Shared colors.
 */
const STEEL = '#c3c8d0';
const STEEL_LIGHT = '#eef1f5';
const STEEL_DARK = '#7d838c';
const WOOD = '#8a5a32';
const GOLD = '#e0b03a';

/**
 * The stat bars' icons, one per stat.
 */
export const STAT_ART: Record<string, PixelArt> = {
  damage: {
    rows: [
      '........L',
      '.......LS',
      '......LS.',
      '.....LS..',
      '.G..LS...',
      '..GLS....',
      '..BG.....',
      '.B..G....',
      'B........',
    ],
    colors: { L: STEEL_LIGHT, S: STEEL, G: GOLD, B: WOOD },
  },
  speed: {
    rows: [
      '....YYY.',
      '...YYY..',
      '..YYY...',
      '.YYYYYY.',
      '....YYY.',
      '...YYY..',
      '..YY....',
      '.Y......',
    ],
    colors: { Y: '#f5c62e' },
    glow: 'Y',
  },
  reach: {
    rows: [
      '..A...A..',
      '.AA...AA.',
      'AAAAAAAAA',
      '.AA...AA.',
      '..A...A..',
    ],
    colors: { A: '#4fb6e0' },
  },
  knockback: {
    rows: [
      'K...K...',
      '.K...K..',
      '..K...K.',
      '...K...K',
      '..K...K.',
      '.K...K..',
      'K...K...',
    ],
    colors: { K: '#a9c4dc' },
  },
  gathering: {
    rows: [
      '..SSSS...',
      '.S...SS..',
      'S....BSS.',
      '....B..S.',
      '...B...S.',
      '..B......',
      '.B.......',
      'B........',
    ],
    colors: { S: STEEL, B: WOOD },
  },
  lasts: {
    rows: [
      'BBBBBBB',
      '.G...G.',
      '.GsssG.',
      '..GsG..',
      '...s...',
      '..G.G..',
      '.G.s.G.',
      '.GsssG.',
      'BBBBBBB',
    ],
    colors: { B: WOOD, G: '#cfe6f0', s: '#e8c27a' },
  },
  toughness: {
    rows: [
      'BBBMBBBBB',
      'MMMMMMMMM',
      'BBBBBMBBB',
      'MMMMMMMMM',
      'BBBMBBBBB',
      'MMMMMMMMM',
      'BBBBBMBBB',
    ],
    colors: { B: '#8d929b', M: '#4a4d54' },
  },
  spikes: {
    rows: [
      '....L....',
      'L...S...L',
      'S..LSS..S',
      'S..SSS..S',
      'SS.SSS.SS',
      'SSSSSSSSS',
      'BBBBBBBBB',
    ],
    colors: { L: STEEL_LIGHT, S: STEEL_DARK, B: WOOD },
  },
  blood: {
    rows: [
      '....R....',
      '...RR....',
      '...RRR...',
      '..RRRRR..',
      '.RLRRRRR.',
      '.RLRRRRR.',
      '.RRRRRRR.',
      '..RRRRR..',
      '...RRR...',
    ],
    colors: { R: '#b0141e', L: '#e5484d' },
  },
  dig: {
    rows: [
      '.BBB.',
      '..B..',
      '..B..',
      '..B..',
      '..B..',
      '.SSS.',
      'SSSSS',
      'SSSSS',
      '.SSS.',
      '..S..',
    ],
    colors: { B: WOOD, S: STEEL },
  },
  ghost: {
    rows: [
      '..GGGGG..',
      '.GGGGGGG.',
      '.GDGGGDG.',
      '.GDGGGDG.',
      '.GGGGGGG.',
      '.GGGDGGG.',
      '.GGGGGGG.',
      '.GG.G.GG.',
      '.G..G..G.',
    ],
    colors: { G: '#9dffc8', D: '#1d3a2c' },
    glow: 'G',
  },
  light: {
    rows: [
      '....Y....',
      '.Y..Y..Y.',
      '..YYYYY..',
      '..YOOOY..',
      'YYYOOOYYY',
      '..YOOOY..',
      '..YYYYY..',
      '.Y..Y..Y.',
      '....Y....',
    ],
    colors: { Y: '#ffd166', O: '#fff3c4' },
    glow: 'YO',
  },
  flame: {
    rows: [
      '....F....',
      '...FF....',
      '...FFF...',
      '..FFOFF..',
      '..FOOOF..',
      '.FOOYOOF.',
      '.FOYYYOF.',
      '.FOYYYOF.',
      '..FFFFF..',
    ],
    colors: { F: '#d8361f', O: '#ea6a1f', Y: '#ffd166' },
    glow: 'FOY',
  },
  gear: {
    rows: [
      '...G.G...',
      '.GGGGGGG.',
      '..GGGGG..',
      'GGG...GGG',
      '.GG...GG.',
      'GGG...GGG',
      '..GGGGG..',
      '.GGGGGGG.',
      '...G.G...',
    ],
    colors: { G: '#d9a93a' },
  },
  shield: {
    rows: [
      'RRRRRRR',
      'RSSSSSR',
      'RSSLSSR',
      'RSLLLSR',
      'RSSLSSR',
      '.RSSSR.',
      '..RSR..',
      '...R...',
    ],
    colors: { R: STEEL_DARK, S: STEEL, L: STEEL_LIGHT },
  },
};
