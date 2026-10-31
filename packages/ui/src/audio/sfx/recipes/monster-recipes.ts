// Types
import type { SfxRecipe, MonsterSfx } from '../../../types/sfx';

/**
 * Recipes for the sounds monsters make, and the blood moon.
 */
export const MONSTER_RECIPES: Record<MonsterSfx, SfxRecipe> = {
  'monster-hit': (s) => {
    s.noise({ filter: 'bandpass', from: 500, to: 150, q: 3, dur: 0.16, gain: 0.9 });
    s.tone({ type: 'sawtooth', from: 95, to: 60, dur: 0.12, gain: 0.18 });
  },
  'bite': (s) => {
    s.noise({ filter: 'lowpass', from: 800, to: 250, dur: 0.1, gain: 0.35 });
    s.tone({ from: 115, to: 60, dur: 0.13, gain: 0.2 });
  },
  'ghoul-hiss': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, to: 1500, q: 3, dur: 0.5, gain: 0.32, attack: 0.05 });
    for (let i = 0; i < 6; i++) {
      s.noise({ filter: 'highpass', from: 2800, dur: 0.015, gain: 0.28, at: 0.04 + i * 0.065 + Math.random() * 0.02 });
    }
    s.tone({ type: 'sawtooth', from: 150, to: 105, dur: 0.45, gain: 0.07 });
  },
  'ghoul-click': (s) => {
    let at = 0;
    for (let i = 0; i < 9; i++) {
      s.noise({ filter: 'highpass', from: 2600 + Math.random() * 900, dur: 0.012, gain: 0.3 + i * 0.015, at });
      s.noise({ filter: 'bandpass', from: 1400, q: 6, dur: 0.02, gain: 0.12, at });
      at += 0.075 - i * 0.006 + Math.random() * 0.01;
    }
  },
  'ghoul-screech': (s) => {
    s.tone({ type: 'sawtooth', from: 850, to: 1750, dur: 0.16, gain: 0.11 });
    s.tone({ type: 'sawtooth', from: 1750, to: 520, dur: 0.38, gain: 0.11, at: 0.14 });
    s.tone({ type: 'square', from: 910, to: 1840, dur: 0.18, gain: 0.04 });
    s.noise({ filter: 'bandpass', from: 3200, to: 1100, q: 2, dur: 0.55, gain: 0.3 });
  },
  'monster-death': (s) => {
    s.tone({ type: 'sawtooth', from: 230, to: 40, dur: 0.45, gain: 0.22 });
    s.noise({ filter: 'lowpass', from: 1600, to: 180, dur: 0.42, gain: 0.3 });
  },
  'blood-moon': (s) => {
    s.tone({ type: 'sawtooth', from: 55, dur: 3, gain: 0.28, attack: 0.7, lowpass: [300, 1100] });
    s.tone({ type: 'sawtooth', from: 82.5, dur: 3, gain: 0.2, attack: 0.9, lowpass: [300, 900] });
    s.tone({ type: 'sine', from: 41, dur: 3.2, gain: 0.35, attack: 0.5 });
  },
  'zombie-groan': (s) => {
    const f = 70 + Math.random() * 25;
    s.tone({ type: 'sawtooth', from: f, to: f * 0.8, dur: 1.1, gain: 0.16, attack: 0.25, vibrato: [5, 6], lowpass: [520, 300] });
  },
  'zombie-angry': (s) => {
    const f = 95 + Math.random() * 25;
    s.noise({ filter: 'bandpass', from: 420, to: 260, q: 2, dur: 0.65, gain: 0.3, attack: 0.04 });
    s.tone({ type: 'sawtooth', from: f, to: f * 1.45, dur: 0.3, gain: 0.2, attack: 0.04, vibrato: [16, 14], lowpass: [1100, 800] });
    s.tone({ type: 'sawtooth', from: f * 1.45, to: f * 0.8, dur: 0.45, gain: 0.2, at: 0.28, vibrato: [16, 14], lowpass: [900, 400] });
    s.tone({ type: 'square', from: 55, to: 45, dur: 0.6, gain: 0.05, attack: 0.05, lowpass: [300, 200] });
  },
  'zombie-hurt': (s) => {
    const f = 140 + Math.random() * 30;
    s.noise({ filter: 'lowpass', from: 900, to: 300, dur: 0.08, gain: 0.25 });
    s.tone({ type: 'sawtooth', from: f, to: f * 0.55, dur: 0.32, gain: 0.2, attack: 0.01, vibrato: [24, 10], lowpass: [1200, 400] });
  },
  'vampire-hurt': (s) => {
    s.noise({ filter: 'highpass', from: 2600, dur: 0.3, gain: 0.16, attack: 0.01 });
    s.tone({ type: 'sawtooth', from: 950, to: 560, dur: 0.38, gain: 0.08, attack: 0.01, vibrato: [32, 45], lowpass: [3600, 1600] });
    s.tone({ type: 'sine', from: 1500, to: 900, dur: 0.3, gain: 0.05 });
  },
  'vampire-hiss': (s) => {
    s.noise({ filter: 'highpass', from: 3600, dur: 0.55, gain: 0.2, attack: 0.05 });
    s.tone({ type: 'sine', from: 1800, to: 1300, dur: 0.2, gain: 0.03 });
  },
  'splat': (s) => {
    s.noise({ filter: 'lowpass', from: 900, to: 160, dur: 0.22, gain: 0.55 });
    s.tone({ type: 'sine', from: 160, to: 55, dur: 0.18, gain: 0.3 });
    s.noise({ filter: 'bandpass', from: 600, q: 5, dur: 0.05, gain: 0.25, at: 0.08 });
  },
  'ghost-shot': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, to: 900, q: 1.5, dur: 0.09, gain: 0.5 });
    s.tone({ type: 'square', from: 240, to: 90, dur: 0.08, gain: 0.08 });
    s.tone({ type: 'sine', from: 520, to: 260, dur: 0.6, gain: 0.09, attack: 0.04, vibrato: [11, 30] });
    s.tone({ type: 'triangle', from: 780, to: 390, dur: 0.5, gain: 0.04, attack: 0.04, vibrato: [9, 25] });
    s.noise({ filter: 'bandpass', from: 1400, to: 600, q: 4, dur: 0.5, gain: 0.12, attack: 0.05 });
  },
  'ghost-shriek': (s) => {
    s.tone({ type: 'sawtooth', from: 380, to: 1100, dur: 0.35, gain: 0.05, attack: 0.05, vibrato: [14, 40] });
    s.tone({ type: 'sine', from: 1100, to: 700, dur: 0.6, gain: 0.09, at: 0.3, vibrato: [9, 60] });
    s.tone({ type: 'sine', from: 760, to: 1500, dur: 0.4, gain: 0.05, attack: 0.08 });
    s.noise({ filter: 'bandpass', from: 3000, to: 1200, q: 3, dur: 0.7, gain: 0.12, attack: 0.1 });
  },
  'werewolf-howl': (s) => {
    const f = 300 + Math.random() * 40;
    s.tone({ type: 'sawtooth', from: f * 0.7, to: f * 1.5, dur: 0.45, gain: 0.07, attack: 0.08, vibrato: [5, 8], lowpass: [1400, 2200] });
    s.tone({ type: 'sawtooth', from: f * 1.5, to: f * 0.9, dur: 1.4, gain: 0.08, at: 0.42, vibrato: [5.5, 14], lowpass: [2200, 900] });
    s.tone({ type: 'sine', from: f * 1.5, to: f * 0.92, dur: 1.4, gain: 0.1, at: 0.42, vibrato: [5.5, 14] });
    s.noise({ filter: 'bandpass', from: 1200, to: 700, q: 3, dur: 1.8, gain: 0.08, attack: 0.2 });
  },
  'werewolf-snarl': (s) => {
    s.noise({ filter: 'bandpass', from: 500, to: 300, q: 2, dur: 0.7, gain: 0.4, attack: 0.03 });
    s.tone({ type: 'sawtooth', from: 72, to: 62, dur: 0.7, gain: 0.2, attack: 0.03, vibrato: [28, 9], lowpass: [700, 400] });
    s.tone({ type: 'square', from: 48, dur: 0.6, gain: 0.06, attack: 0.04, lowpass: [260, 200] });
  },
  'bloater-gurgle': (s) => {
    for (let i = 0; i < 5; i++) {
      const at = i * 0.11 + Math.random() * 0.05;
      s.tone({ type: 'sine', from: 90 + Math.random() * 60, to: 160 + Math.random() * 80, dur: 0.08, gain: 0.18, at });
      s.noise({ filter: 'lowpass', from: 500, to: 200, dur: 0.07, gain: 0.15, at });
    }
    s.tone({ type: 'sawtooth', from: 65, to: 55, dur: 0.7, gain: 0.07, attack: 0.1, vibrato: [7, 6], lowpass: [300, 200] });
  },
  'bloater-burst': (s) => {
    s.noise({ filter: 'lowpass', from: 1400, to: 120, dur: 0.5, gain: 0.85 });
    s.tone({ type: 'sine', from: 120, to: 32, dur: 0.45, gain: 0.55 });
    s.noise({ filter: 'bandpass', from: 700, q: 4, dur: 0.06, gain: 0.3, at: 0.12 });
    s.noise({ filter: 'bandpass', from: 500, q: 4, dur: 0.06, gain: 0.25, at: 0.22 });
  },
  'necro-chant': (s) => {
    s.tone({ type: 'sawtooth', from: 98, dur: 1.2, gain: 0.08, attack: 0.3, vibrato: [4, 3], lowpass: [500, 700] });
    s.tone({ type: 'sawtooth', from: 147, to: 139, dur: 1.2, gain: 0.06, attack: 0.35, vibrato: [4.5, 3], lowpass: [500, 800] });
    s.noise({ filter: 'bandpass', from: 2400, to: 1600, q: 4, dur: 1.1, gain: 0.08, attack: 0.3 });
  },
  'raise': (s) => {
    s.noise({ filter: 'lowpass', from: 700, to: 200, dur: 0.35, gain: 0.45 });
    s.tone({ type: 'sine', from: 180, to: 520, dur: 0.5, gain: 0.07, attack: 0.05, vibrato: [8, 20] });
    s.noise({ filter: 'highpass', from: 2400, dur: 0.02, gain: 0.2, at: 0.1 });
    s.noise({ filter: 'highpass', from: 2600, dur: 0.02, gain: 0.2, at: 0.19 });
  },
  'ghost-moan': (s) => {
    s.tone({ type: 'sine', from: 300, to: 430, dur: 0.8, gain: 0.1, attack: 0.3, vibrato: [6, 9] });
    s.tone({ type: 'sine', from: 430, to: 250, dur: 0.9, gain: 0.1, at: 0.75, vibrato: [6, 9] });
    s.tone({ type: 'sine', from: 450, to: 640, dur: 0.8, gain: 0.035, attack: 0.3 });
  },
};
