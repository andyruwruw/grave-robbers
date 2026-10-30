// Types
import type { Cue } from '../types/sound';

/**
 * How far sounds are panned at the map's left and right edges.
 */
export const PAN_WIDTH = 0.8;

/**
 * Least seconds between one monster's idle noises.
 */
export const VOICE_MIN = 7;

/**
 * Extra random seconds on top of `VOICE_MIN` between one monster's idle
 * noises.
 */
export const VOICE_SPREAD = 12;

/**
 * Least seconds between any two monsters' idle noises, so a crowd murmurs
 * instead of droning.
 */
export const VOICE_GAP = 1.2;

/**
 * Least time between two monsters' "spotted you" cries (a zombie's snarl,
 * a vampire's hiss), so a horde noticing someone isn't a wall of noise.
 */
export const SPOT_GAP = 0.8;

/**
 * A fight, for the music: a monster within this many tiles of a living
 * player.
 */
export const FIGHT_RANGE = 6;

/**
 * A fight, for the music: anyone (or anything) hit in the last this many
 * seconds.
 */
export const FIGHT_LINGER = 6;

/**
 * A witch's broom swipe as she draws back: a cackle.
 */
export const SWIPE_WINDUP: Cue = ['ghost-shriek', 1.6, 0.7];

/**
 * A witch's broom swipe as it sweeps: a heavy whoosh.
 */
export const SWIPE_STRIKE: Cue = ['swing', 0.65, 0.9];

/**
 * Seconds between growls while a brute or ghoul hunts (give or take a
 * half).
 */
export const GROWL_EVERY = 2.6;
