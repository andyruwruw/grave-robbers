// Types
import type { PatchState } from '@halloween/shared/protocol/state/world-state';

/**
 * Most patches drawn at once (a Pyre Bow leaves one per tile flown).
 */
export const PATCH_POOL = 48;

/**
 * Motes (embers, licks of fire, or smoke) per patch.
 */
export const PATCH_MOTES = 6;

/**
 * Height above the ground line, clear of the tallest grass tufts (just
 * under the puddles').
 */
export const PATCH_LIFT = 0.06;

/**
 * How each kind of patch looks: its ground disc, its brighter middle (and
 * how much each shows), its motes, how high and fast they rise, how big
 * they are, and whether they glow or drift as see-through smoke.
 */
export const PATCH_LOOKS: Record<PatchState['kind'], {
  disc: string;
  discOpacity: number;
  middle: string;
  middleOpacity: number;
  mote: string;
  moteOpacity: number;
  rise: number;
  speed: number;
  size: number;
  grow: number;
}> = {
  scorch: { disc: '#140a06', discOpacity: 0.75, middle: '#ff4a1a', middleOpacity: 0.35, mote: '#ffb347', moteOpacity: 1, rise: 0.45, speed: 0.9, size: 0.05, grow: 0 },
  fire: { disc: '#ff5a1a', discOpacity: 0.35, middle: '#ffd27a', middleOpacity: 0.45, mote: '#ff7a1a', moteOpacity: 1, rise: 0.35, speed: 1.6, size: 0.08, grow: 0 },
  incense: { disc: '#e8dcc0', discOpacity: 0.14, middle: '#fff2c0', middleOpacity: 0.12, mote: '#ddd6c6', moteOpacity: 0.4, rise: 0.9, speed: 0.35, size: 0.18, grow: 1.6 },
};

/**
 * How a patch's middle pulses: rate (radians a second) and depth (0..1).
 */
export const PATCH_PULSE = { rate: 7, depth: 0.35 };

/**
 * Flames licking up from fire and scorch patches: the most the shared
 * flame pool gives them, their size as a share of the patch's diameter,
 * and how strong.
 */
export const PATCH_FLAMES = { budget: 16, size: 0.7, strength: 0.6 };

/**
 * Light fire and scorch patches give off: the most lit at once, their
 * reach as a share of the patch's radius, color, and brightness.
 */
export const PATCH_LIGHT = { budget: 16, reach: 2.4, color: '#ff8a3a', intensity: 0.45 };
