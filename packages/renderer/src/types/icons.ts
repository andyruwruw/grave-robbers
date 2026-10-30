// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Resource } from '@halloween/shared/goods/goods';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';

/**
 * The phone's own buttons and hearts, drawn as models like everything else
 * (see `uiModel`).
 */
export type UiIcon = 'bag' | 'craft' | 'tree' | 'heart' | 'heart-wound' | 'heart-empty' | 'hand-main' | 'hand-off' | 'armor';

/**
 * Anything the phone shows an icon for: bag items, recipes, what an empty
 * hand falls back to, and its own buttons.
 */
export type IconKey = RecipeId | ItemKey | 'hammer' | 'lantern' | `res:${Resource}` | `ui:${UiIcon}`;
