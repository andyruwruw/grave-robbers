// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Bundle, Inventory } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { BotTask } from '../tasks/bot-task';

/**
 * What the test player knows each tick.
 */
export interface BotView {
  /**
   * Where it stands (tiles).
   */
  x: number;

  /**
   * Where it stands (tiles, down the map).
   */
  y: number;

  /**
   * Whether it's dead.
   */
  dead: boolean;

  /**
   * The resources it carries.
   */
  inventory: Inventory;

  /**
   * Its bag slots.
   */
  bag: (BagItem | null)[];

  /**
   * Whether its skill tree lets it build a kind of structure.
   */
  canBuild: (kind: StructureKind) => boolean;

  /**
   * Whether it can afford a cost.
   */
  canPay: (cost: Bundle) => boolean;

  /**
   * Whether it stands by a research table.
   */
  research: boolean;

  /**
   * The world's skill tree.
   */
  tree: TreeState;

  /**
   * The world map.
   */
  map: WorldMap;

  /**
   * The game clock (seconds).
   */
  time: number;

  /**
   * Where every monster is.
   */
  monsters: { x: number; y: number }[];
}

/**
 * The test player's controls: the same intents a phone sends.
 */
export interface BotHands {
  /**
   * Sets the move stick.
   */
  input: (x: number, y: number) => void;

  /**
   * Sets the aim stick.
   */
  aim: (x: number, y: number) => void;

  /**
   * Presses or releases the action button.
   */
  action: (down: boolean) => void;

  /**
   * Crafts one of a recipe.
   */
  craft: (recipe: RecipeId) => void;

  /**
   * Picks a bag slot to build from (null puts it away).
   */
  select: (slot: number | null) => void;

  /**
   * Builds the selected item on the aimed tile; returns why not, or null.
   */
  place: () => string | null;

  /**
   * Buys an upgrade.
   */
  upgrade: (node: NodeId) => void;
}

/**
 * What a task may do to the test player running it.
 */
export interface BotControl {
  /**
   * The test player's controls.
   */
  readonly hands: BotHands;

  /**
   * When it last moved (game clock seconds).
   */
  readonly movedAt: number;

  /**
   * Replaces its current task (null to pick a new one next tick).
   * @param task The new task.
   */
  setTask(task: BotTask | null): void;

  /**
   * Has it ignore monsters for a while.
   * @param until Game clock seconds to ignore them until.
   */
  ignoreFoes(until: number): void;
}
