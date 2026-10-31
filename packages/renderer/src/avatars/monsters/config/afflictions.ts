// Packages
import {
  STATUS_BURNING,
  STATUS_CURSED,
  STATUS_GLOWING,
  STATUS_PINNED,
  STATUS_POISONED,
  STATUS_SLOWED,
  STATUS_TURNED,
} from '@halloween/shared/monsters/monster-status';

// Types
import type { Affliction } from '../types/affliction';

/**
 * The `MonsterState.status` bits that show each affliction.
 */
export const AFFLICTION_STATUS: Record<Affliction, number> = {
  burning: STATUS_BURNING | STATUS_GLOWING,
  cursed: STATUS_CURSED,
  poisoned: STATUS_POISONED,
  slowed: STATUS_SLOWED,
  pinned: STATUS_PINNED,
  turned: STATUS_TURNED,
};

/**
 * The glow each affliction tints the body (mixed when several are on),
 * and how strong; `pulse` is how fast it throbs (radians a second, 0 for
 * steady). Pinned doesn't tint.
 */
export const AFFLICTION_TINTS: Partial<Record<Affliction, { color: string; amount: number; pulse: number }>> = {
  burning: { color: '#ff6a1a', amount: 0.35, pulse: 17 },
  cursed: { color: '#9a3aff', amount: 0.4, pulse: 4 },
  poisoned: { color: '#4adf2a', amount: 0.3, pulse: 6 },
  slowed: { color: '#8affd0', amount: 0.22, pulse: 3 },
  turned: { color: '#3ad6ff', amount: 0.45, pulse: 0 },
};

/**
 * The bits around a monster each affliction shows (turned shows none):
 * embers rising off a burning one, purple wisps circling a cursed one,
 * green drips off a poisoned one, pale ecto wisps drifting round a slowed
 * one, and iron spikes pinning one's feet. `count` bits of `size` (local
 * units) in `color` at `opacity`.
 */
export const AFFLICTION_MOTES: Partial<Record<Affliction, { color: string; opacity: number; count: number; size: number }>> = {
  burning: { color: '#ffb347', opacity: 1, count: 5, size: 0.05 },
  cursed: { color: '#b04aff', opacity: 0.65, count: 6, size: 0.06 },
  poisoned: { color: '#7aff3a', opacity: 0.9, count: 4, size: 0.04 },
  slowed: { color: '#8affd0', opacity: 0.5, count: 4, size: 0.07 },
  pinned: { color: '#7d848e', opacity: 1, count: 4, size: 0.03 },
};

/**
 * How fast an affliction's look fades in and out (strength per second).
 */
export const AFFLICTION_FADE = 5;
