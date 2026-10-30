// Local Imports
import { MONSTER_RECIPES } from './monster-recipes';
import { PLAYER_RECIPES } from './player-recipes';
import { WORLD_RECIPES } from './world-recipes';

// Types
import type { SfxName, SfxRecipe } from '../../../types/sfx';

/**
 * Retro, slightly crunchy recipes for every sound.
 */
export const RECIPES = { ...PLAYER_RECIPES, ...MONSTER_RECIPES, ...WORLD_RECIPES } satisfies Record<SfxName, SfxRecipe>;
