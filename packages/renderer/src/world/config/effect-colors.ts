// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * Puff colors when a monster dies.
 */
export const DEATH_PUFF: Record<MonsterKind, string> = { zombie: '#7fa36a', vampire: '#8a1022', ghost: '#cfe3ff', brute: '#6f7f62', skeleton: '#e6e0cc', witch: '#5a3a7a', ghoul: '#8a8a7a', demon: '#24141c' };

/**
 * Smoke from a snuffed light.
 */
export const SMOKE = '#55565c';

/**
 * Flesh flying off a smashed pumpkin.
 */
export const PUMPKIN_FLESH = '#d9661e';

/**
 * Candle sparks when a pumpkin bursts.
 */
export const CANDLE_SPARK = '#ffb347';

/**
 * Splinters from a chest breaking open.
 */
export const CHEST_SPLINTER = '#6b4527';

/**
 * The glint of gold from a chest breaking open.
 */
export const GOLD_SPARK = '#f5d76e';

/**
 * Earth thrown up by things growing, sinking, digging, and slamming.
 */
export const DIRT = '#3a2e24';

/**
 * Blood: dark and old for zombies, bright for vampires.
 */
export const BLOOD: Record<MonsterKind, string> = { zombie: '#b0221a', vampire: '#e8142c', ghost: '#9fb8d8', brute: '#8f1a14', skeleton: '#cfc8b0', witch: '#4f8a2a', ghoul: '#6a7a3a', demon: '#8a0a1e' };

/**
 * A witch's potion bursting.
 */
export const POTION_SPLASH = '#b04aff';

/**
 * Earth a brute's fists throw up when they hit the ground.
 */
export const SLAM_DIRT = '#5a4430';

/**
 * The darker scuff a brute's fists leave on the ground for a while.
 */
export const SLAM_MARK = '#2a1f16';

/**
 * The smoke a demon leaves and arrives in when it steps through the
 * shadows.
 */
export const SHADOW_SMOKE = '#1a1020';

/**
 * A player's blood.
 */
export const PLAYER_BLOOD = '#e41c24';

/**
 * A flamethrower's fire.
 */
export const FLAME_COLORS = ['#ff7a1a', '#ffb347', '#ff4a1a', '#fff0a8'];

/**
 * The glint of a sword swiper's blades.
 */
export const BLADE_GLINT = '#dfe6ee';

/**
 * A demon bursts in a ring of bright blood when it dies.
 */
export const DEMON_BURST = '#c4102a';

/**
 * Dust kicked up where something breaks apart.
 */
export const DUST = '#6b6052';
