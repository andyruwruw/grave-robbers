// Types
import type { SfxRecipe, WorldSfx } from '../../../types/sfx';

/**
 * Recipes for the sounds of working the world.
 */
export const WORLD_RECIPES: Record<WorldSfx, SfxRecipe> = {
  'chop': (s) => {
    s.tone({ from: 150, to: 70, dur: 0.09, gain: 0.3 });
    s.noise({ filter: 'lowpass', from: 1400, to: 400, dur: 0.06, gain: 0.35 });
  },
  'mine': (s) => {
    s.tone({ type: 'triangle', from: 1250, to: 950, dur: 0.14, gain: 0.22 });
    s.tone({ from: 2500, dur: 0.05, gain: 0.05 });
    s.noise({ filter: 'highpass', from: 3000, dur: 0.04, gain: 0.25 });
  },
  'dig': (s) => {
    s.noise({ filter: 'bandpass', from: 1800, to: 600, q: 1.5, dur: 0.12, gain: 0.45 });
    s.tone({ type: 'sine', from: 110, to: 55, dur: 0.14, gain: 0.4, at: 0.04 });
    s.noise({ filter: 'lowpass', from: 600, to: 200, dur: 0.18, gain: 0.3, at: 0.06 });
  },
  'unlock': (s) => {
    s.tone({ type: 'triangle', from: 523, dur: 0.12, gain: 0.18 });
    s.tone({ type: 'triangle', from: 659, dur: 0.12, gain: 0.18, at: 0.09 });
    s.tone({ type: 'triangle', from: 784, dur: 0.12, gain: 0.18, at: 0.18 });
    s.tone({ type: 'triangle', from: 1047, dur: 0.35, gain: 0.2, at: 0.27 });
  },
  'build': (s) => {
    s.tone({ type: 'sine', from: 210, to: 130, dur: 0.12, gain: 0.45 });
    s.noise({ filter: 'lowpass', from: 700, dur: 0.07, gain: 0.3 });
    s.tone({ type: 'triangle', from: 640, dur: 0.04, gain: 0.08, at: 0.02 });
  },
  'craft': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, q: 6, dur: 0.04, gain: 0.35 });
    s.tone({ type: 'triangle', from: 1180, dur: 0.06, gain: 0.1 });
    s.noise({ filter: 'bandpass', from: 2300, q: 6, dur: 0.04, gain: 0.3, at: 0.11 });
    s.tone({ type: 'triangle', from: 1050, dur: 0.06, gain: 0.09, at: 0.11 });
    s.tone({ type: 'sine', from: 660, dur: 0.09, gain: 0.1, at: 0.22 });
    s.tone({ type: 'sine', from: 990, dur: 0.16, gain: 0.1, at: 0.3 });
  },
  'break': (s) => {
    s.noise({ filter: 'lowpass', from: 2200, to: 250, dur: 0.38, gain: 0.5 });
    s.tone({ from: 95, to: 38, dur: 0.28, gain: 0.25 });
    s.noise({ filter: 'bandpass', from: 1200, q: 4, dur: 0.06, gain: 0.25, at: 0.12 });
  },
  'pickup': (s) => {
    s.tone({ from: 660, dur: 0.06, gain: 0.12 });
    s.tone({ from: 990, dur: 0.09, gain: 0.12, at: 0.06 });
  },
  'candy': (s) => {
    for (const [at, from] of [[0, 3200], [0.07, 2400], [0.13, 3600], [0.21, 2800], [0.27, 3000]]) {
      s.noise({ filter: 'bandpass', from, to: from * 0.6, q: 2.5, dur: 0.05, gain: 0.7, at });
    }
    s.tone({ type: 'triangle', from: 523, dur: 0.1, gain: 0.1, at: 0.34 });
    s.tone({ type: 'triangle', from: 659, dur: 0.1, gain: 0.1, at: 0.42 });
    s.tone({ type: 'triangle', from: 784, to: 1046, dur: 0.18, gain: 0.1, at: 0.5 });
  },
  'drop': (s) => s.tone({ from: 520, to: 240, dur: 0.11, gain: 0.13 }),
  'refuel': (s) => {
    s.noise({ filter: 'bandpass', from: 500, to: 1900, q: 1.5, dur: 0.32, gain: 0.8, attack: 0.08 });
    s.tone({ type: 'sine', from: 300, to: 520, dur: 0.22, gain: 0.07 });
  },
  'snuff': (s) => s.noise({ filter: 'highpass', from: 2200, to: 6000, dur: 0.45, gain: 0.22, attack: 0.04 }),
  'error': (s) => {
    s.tone({ from: 150, dur: 0.09, gain: 0.14 });
    s.tone({ from: 150, dur: 0.09, gain: 0.14, at: 0.13 });
  },
};
