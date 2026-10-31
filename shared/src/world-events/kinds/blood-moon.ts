// Types
import type { WorldEventDef } from '../types/world-events';

/**
 * The blood moon: the sky turns red, the lights go out, and the horde
 * comes faster, harder, and straight for the players, werewolves with it.
 */
export const BLOOD_MOON: WorldEventDef = {
  name: 'Blood moon',
  duration: 90,
  fade: 8,
  every: { min: 480, spread: 240 },
  effects: [
    { on: 'spawning', interval: 1, perPlayer: 7, lightsPerGhost: 2 },
    { on: 'spawn-mix', mix: { werewolf: 8 } },
    { on: 'monster-power', scale: 1.25 },
    { on: 'monster-speed', scale: 1.12 },
    { on: 'monster-hunt' },
    { on: 'blackout', within: 7, sputter: 1.4 },
    { on: 'sky', moon: '#ff7a66', ambient: [0.26, 0.09, 0.12], fog: '#6e3640', fogThicken: 0.6 },
    { on: 'eyes', color: '#ff2414' },
    { on: 'aberration', add: 0.0035 },
    { on: 'music', drums: 0.5 },
    { on: 'announce', sound: 'blood-moon', duck: 0.25, seconds: 3 },
  ],
};
