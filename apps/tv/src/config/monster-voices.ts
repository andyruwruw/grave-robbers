// Packages
import { WEREWOLF_POUNCE_WINDUP } from '@halloween/shared/monsters/kinds/werewolf';
import { WITCH_SWIPE } from '@halloween/shared/monsters/kinds/witch';

// Local Imports
import { SWIPE_STRIKE, SWIPE_WINDUP } from './sound';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { Voice } from '../types/sound';

/**
 * Each monster kind's voice.
 */
export const MONSTER_VOICES: Record<MonsterKind, Voice> = {
  zombie: { hurt: ['zombie-hurt', 0.9, 0.7], windup: ['zombie-angry', 1.15, 0.35], strike: [['bite', 1, 0.8]], spot: ['zombie-angry', 0.9, 0.75], idle: ['zombie-groan', 0.85, 0.55] },
  vampire: { hurt: ['vampire-hurt', 0.9, 0.7], windup: ['vampire-hiss', 0.9, 0.7], strike: [['bite', 1.1, 0.8]], spot: ['vampire-hiss', 0.9, 0.6], idle: ['vampire-hiss', 0.85, 0.35] },
  ghost: { hurt: null, windup: null, strike: [], spot: ['ghost-shriek', 0.9, 0.75], idle: ['ghost-moan', 0.85, 0.55] },
  brute: { hurt: ['zombie-hurt', 0.55, 0.8], windup: ['zombie-angry', 0.42, 1], strike: [['hit', 0.32, 1], ['break', 0.38, 0.9], ['zombie-angry', 0.36, 0.7]], spot: ['zombie-angry', 0.48, 0.9], idle: ['zombie-groan', 0.5, 0.6], growl: ['zombie-groan', 0.42, 0.55] },
  skeleton: { hurt: ['mine', 1.7, 0.7], windup: ['equip', 0.7, 0.8], strike: [], spot: ['chop', 2, 0.6], idle: ['chop', 2.2, 0.35] },
  witch: { hurt: ['vampire-hurt', 1.35, 0.7], windup: ['ghost-shriek', 1.4, 0.7], strike: [['swing', 1.1, 0.6]], spot: ['ghost-shriek', 1.25, 0.75], idle: ['ghost-moan', 1.6, 0.4], swipe: { windup: SWIPE_WINDUP, strike: [SWIPE_STRIKE], time: WITCH_SWIPE.windup } },
  ghoul: { hurt: ['ghoul-screech', 1.3, 0.55], windup: ['ghoul-click', 1, 0.9], strike: [['bite', 1.3, 0.8]], spot: ['ghoul-screech', 0.9, 0.85], idle: ['ghoul-hiss', 1, 0.5], growl: ['ghoul-hiss', 0.85, 0.55] },
  demon: { hurt: ['vampire-hurt', 0.6, 0.7], windup: ['vampire-hiss', 0.55, 0.8], strike: [['bite', 0.55, 1]], spot: ['ghost-shriek', 0.6, 0.75], idle: ['vampire-hiss', 0.5, 0.4] },
  bloater: { hurt: ['bloater-gurgle', 0.9, 0.7], windup: ['bloater-gurgle', 1.4, 1], strike: [], spot: ['zombie-angry', 0.7, 0.7], idle: ['bloater-gurgle', 0.8, 0.5] },
  necromancer: { hurt: ['zombie-hurt', 1.2, 0.6], windup: ['necro-chant', 1, 0.9], strike: [['shadow-step', 0.7, 0.7]], spot: ['necro-chant', 0.8, 0.7], idle: ['ghost-moan', 0.6, 0.4] },
  werewolf: { hurt: ['werewolf-snarl', 1.2, 0.7], windup: ['werewolf-snarl', 1.1, 0.8], strike: [['bite', 0.8, 1], ['swing', 0.9, 0.6]], spot: ['werewolf-howl', 1, 0.9], idle: ['werewolf-snarl', 0.85, 0.45], growl: ['werewolf-snarl', 0.9, 0.6], swipe: { windup: ['werewolf-snarl', 0.8, 1], strike: [['bite', 0.7, 1]], time: WEREWOLF_POUNCE_WINDUP } },
};
