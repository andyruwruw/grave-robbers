// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Essence, InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { Resource } from '@halloween/shared/goods/goods';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { SpawnTile } from '@halloween/shared/protocol/tv-tools';
import type { StyledWall } from '@halloween/shared/structures/wall-styles';

/**
 * The phone's own buttons and hearts, drawn as models like everything else
 * (see `uiModel`).
 */
export type UiIcon = 'bag' | 'craft' | 'tree' | 'armory' | 'heart' | 'heart-wound' | 'heart-empty' | 'heart-over' | 'hand-main' | 'hand-off' | 'armor'
  | 'settings' | 'gameplay' | 'graphics' | 'controls' | 'audio';

/**
 * An infused piece of gear's icon: its kind, essence, and level, as in
 * `gear:short-sword@ecto2` (see `gearIconKey`).
 */
export type InfusedIconKey = `gear:${GearKind}@${Essence}${InfusionLevel}`;

/**
 * One look of a wall (see `WALL_STYLES`), as in `style:palisade:2`.
 */
export type StyleIconKey = `style:${StyledWall}:${number}`;

/**
 * Anything the phone shows an icon for: bag items (infused gear too),
 * recipes, what an empty hand falls back to, its own buttons, and the
 * looks a wall can be built in; and what the admin's Spawn page conjures
 * (map tiles and monsters).
 */
export type IconKey = RecipeId | ItemKey | InfusedIconKey | StyleIconKey | 'hammer' | 'lantern' | `res:${Resource}` | `ui:${UiIcon}` | `tile:${SpawnTile}` | `monster:${MonsterKind}`;
