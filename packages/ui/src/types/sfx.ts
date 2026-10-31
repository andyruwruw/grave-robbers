// Types
import type { Synth } from '../audio/sfx/synth';

/**
 * Sounds the players make: swings, hits, and what happens to them.
 */
export type PlayerSfx =
  | 'swing' | 'hit' | 'hurt' | 'death' | 'respawn' | 'equip' | 'shoot' | 'gunshot' | 'whip-crack' | 'drink' | 'shadow-step';

/**
 * Sounds the monsters make, and the blood moon.
 */
export type MonsterSfx =
  | 'monster-hit' | 'bite' | 'zombie-groan' | 'zombie-angry' | 'zombie-hurt' | 'vampire-hiss' | 'vampire-hurt'
  | 'ghost-moan' | 'ghost-shriek' | 'ghost-shot' | 'ghoul-hiss' | 'ghoul-screech' | 'ghoul-click' | 'monster-death' | 'blood-moon' | 'splat'
  | 'werewolf-howl' | 'werewolf-snarl' | 'bloater-gurgle' | 'bloater-burst' | 'necro-chant' | 'raise';

/**
 * Sounds of working the world: gathering, building, items, and a blood
 * fountain catching a monster.
 */
export type WorldSfx =
  | 'chop' | 'mine' | 'dig' | 'unlock' | 'build' | 'craft' | 'break' | 'pickup' | 'candy' | 'drop' | 'refuel' | 'snuff' | 'error'
  | 'fountain-catch';

/**
 * Sounds of the infused weapons' abilities (see `docs/infusions.md`):
 * chain lightning, death blasts, a wail, slams and fissures, a Hellmouth's
 * roar, a holy nova, a Mirror Shield's reflect, and infusing at the anvil.
 */
export type InfusionSfx =
  | 'chain-zap' | 'blast' | 'wail' | 'slam' | 'fissure' | 'flame-roar' | 'nova' | 'reflect' | 'infuse';

/**
 * Every sound effect in the game. Each has a synthesized recipe; an mp3
 * with the same name in `server/media/sfx/` replaces it.
 */
export type SfxName = PlayerSfx | MonsterSfx | WorldSfx | InfusionSfx;

/**
 * Schedules one sound's tones and noise on a Synth.
 */
export type SfxRecipe = (s: Synth) => void;

/**
 * How one play of a sound comes out.
 */
export interface PlayOptions {
  /**
   * 0..1 on top of the master volume.
   */
  volume?: number;

  /**
   * -1 (left) to 1 (right).
   */
  pan?: number;

  /**
   * Pitch multiplier (also playback speed for mp3 overrides).
   */
  pitch?: number;
}

/**
 * One enveloped oscillator: a pitch glide over `dur` seconds, optionally
 * with vibrato and a low-pass sweep.
 */
export interface ToneOptions {
  /**
   * Waveform (square by default).
   */
  type?: OscillatorType;

  /**
   * Starting frequency, in Hz.
   */
  from: number;

  /**
   * Frequency it glides to, in Hz.
   */
  to?: number;

  /**
   * Seconds it lasts.
   */
  dur: number;

  /**
   * Peak gain.
   */
  gain: number;

  /**
   * Seconds to reach the peak.
   */
  attack?: number;

  /**
   * Seconds after the sound starts that this tone starts.
   */
  at?: number;

  /**
   * Vibrato rate (Hz) and depth (Hz).
   */
  vibrato?: [rate: number, depth: number];

  /**
   * Low-pass cutoff sweep, in Hz.
   */
  lowpass?: [from: number, to: number];
}

/**
 * One burst of filtered white noise, with a filter sweep over `dur`.
 */
export interface NoiseOptions {
  /**
   * The filter's type.
   */
  filter: BiquadFilterType;

  /**
   * Starting filter frequency, in Hz.
   */
  from: number;

  /**
   * Filter frequency it sweeps to, in Hz.
   */
  to?: number;

  /**
   * The filter's Q (1 by default).
   */
  q?: number;

  /**
   * Seconds it lasts.
   */
  dur: number;

  /**
   * Peak gain.
   */
  gain: number;

  /**
   * Seconds to reach the peak.
   */
  attack?: number;

  /**
   * Seconds after the sound starts that this burst starts.
   */
  at?: number;
}

/**
 * One ambience track playing through its own gain, for crossfades.
 */
export interface AmbienceVoice {
  /**
   * The streamed track.
   */
  audio: HTMLAudioElement;

  /**
   * Its own gain, for fading.
   */
  gain: GainNode;

  /**
   * Whether it has started fading into the next track.
   */
  handedOff: boolean;
}
