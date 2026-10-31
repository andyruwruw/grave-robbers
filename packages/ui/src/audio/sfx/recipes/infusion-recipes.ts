// Types
import type { InfusionSfx, SfxRecipe } from '../../../types/sfx';

/**
 * Recipes for the infused weapons' abilities.
 */
export const INFUSION_RECIPES: Record<InfusionSfx, SfxRecipe> = {
  'chain-zap': (s) => {
    let at = 0;
    for (let i = 0; i < 5; i++) {
      s.noise({ filter: 'highpass', from: 3000 + Math.random() * 2000, dur: 0.02, gain: 0.5, at });
      s.tone({ type: 'sawtooth', from: 1400 + Math.random() * 900, to: 300, dur: 0.04, gain: 0.08, at });
      at += 0.025 + Math.random() * 0.025;
    }
    s.noise({ filter: 'bandpass', from: 4200, to: 1600, q: 2, dur: 0.22, gain: 0.3 });
    s.tone({ type: 'square', from: 60, dur: 0.18, gain: 0.08, vibrato: [50, 20] });
  },
  'blast': (s) => {
    s.noise({ filter: 'lowpass', from: 3200, to: 140, dur: 0.55, gain: 0.85 });
    s.tone({ type: 'sine', from: 120, to: 34, dur: 0.5, gain: 0.55 });
    s.noise({ filter: 'bandpass', from: 900, to: 260, q: 0.8, dur: 0.7, gain: 0.28, at: 0.06 });
  },
  'wail': (s) => {
    s.tone({ type: 'sawtooth', from: 520, to: 980, dur: 0.22, gain: 0.08, attack: 0.04, vibrato: [9, 30], lowpass: [2600, 1800] });
    s.tone({ type: 'sawtooth', from: 980, to: 360, dur: 0.6, gain: 0.08, at: 0.2, vibrato: [7, 40], lowpass: [2200, 700] });
    s.tone({ type: 'sine', from: 760, to: 1400, dur: 0.5, gain: 0.07, attack: 0.08, vibrato: [5, 25] });
    s.noise({ filter: 'bandpass', from: 1800, to: 600, q: 1.2, dur: 0.75, gain: 0.25, attack: 0.05 });
  },
  'slam': (s) => {
    s.noise({ filter: 'lowpass', from: 900, to: 90, dur: 0.32, gain: 0.8 });
    s.tone({ type: 'sine', from: 90, to: 36, dur: 0.3, gain: 0.55 });
    s.noise({ filter: 'bandpass', from: 500, to: 220, q: 0.9, dur: 0.4, gain: 0.2, at: 0.05 });
  },
  'fissure': (s) => {
    let at = 0;
    for (let i = 0; i < 7; i++) {
      s.noise({ filter: 'bandpass', from: 1200 + Math.random() * 1400, q: 2, dur: 0.03, gain: 0.45, at });
      at += 0.03 + Math.random() * 0.03;
    }
    s.noise({ filter: 'lowpass', from: 700, to: 70, dur: 0.85, gain: 0.7 });
    s.tone({ type: 'sine', from: 70, to: 28, dur: 0.8, gain: 0.5 });
  },
  'flame-roar': (s) => {
    s.noise({ filter: 'lowpass', from: 600, to: 1600, dur: 0.38, gain: 0.55, attack: 0.05 });
    s.noise({ filter: 'bandpass', from: 1100, to: 700, q: 0.7, dur: 0.38, gain: 0.3, attack: 0.04 });
    for (let i = 0; i < 4; i++) {
      s.noise({ filter: 'highpass', from: 2400, dur: 0.012, gain: 0.18, at: 0.05 + i * 0.07 + Math.random() * 0.03 });
    }
  },
  'nova': (s) => {
    [523, 784, 1046, 1568].forEach((f: number, i: number): void => s.tone({ type: 'triangle', from: f, dur: 0.6 - i * 0.08, gain: 0.1, at: i * 0.03, attack: 0.02 }));
    s.noise({ filter: 'highpass', from: 5000, to: 2400, dur: 0.5, gain: 0.12, attack: 0.03 });
    s.noise({ filter: 'lowpass', from: 1200, to: 120, dur: 0.4, gain: 0.45 });
    s.tone({ type: 'sine', from: 140, to: 50, dur: 0.35, gain: 0.35 });
  },
  'reflect': (s) => {
    s.tone({ type: 'triangle', from: 2200, to: 3100, dur: 0.08, gain: 0.14 });
    s.tone({ type: 'sine', from: 1650, dur: 0.3, gain: 0.08, at: 0.03 });
    s.noise({ filter: 'highpass', from: 4200, dur: 0.05, gain: 0.3 });
  },
  'infuse': (s) => {
    s.noise({ filter: 'highpass', from: 3600, dur: 0.04, gain: 0.5 });
    s.tone({ type: 'square', from: 1800, to: 1200, dur: 0.12, gain: 0.08 });
    s.tone({ type: 'sawtooth', from: 110, to: 220, dur: 0.6, gain: 0.12, attack: 0.1, lowpass: [400, 1800] });
    [659, 880, 1175, 1568].forEach((f: number, i: number): void => s.tone({ type: 'triangle', from: f, dur: 0.18, gain: 0.1, at: 0.25 + i * 0.07 }));
    s.noise({ filter: 'bandpass', from: 2400, to: 5200, q: 2, dur: 0.5, gain: 0.15, at: 0.2, attack: 0.08 });
  },
};
