// Packages
import { ammoMade, isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { MAX_CRAFT, RECIPES, craftCost, needsAnvil, recipeParts } from '@halloween/shared/crafting/recipes';
import { GEAR, GEAR_SLOTS } from '@halloween/shared/gear/gear-catalog';
import { ESSENCES } from '@halloween/shared/gear/infusions/config/essences';
import { infusionCost } from '@halloween/shared/gear/infusions/helpers/infusion-cost';
import { infusedItem, nextInfusion } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { RESOURCES } from '@halloween/shared/goods/goods';
import { partsCount } from '@halloween/shared/inventory/affordability';
import { isBuildItem, isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemLabel, itemNames } from '@halloween/shared/inventory/item-keys';
import { TREE, TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { levelOf, nodeUnlocked, recipeUnlocked } from '@halloween/shared/skill-tree/progress';
import { upgradeCost } from '@halloween/shared/skill-tree/upgrade-cost';
import { ANVIL_RADIUS } from '@halloween/shared/structures/stations';

// Local Imports
import { GameSystem } from '../core/game-system';
import { freshItem } from './helpers/fresh-item';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Essence } from '@halloween/shared/gear/types/infusion';
import type { Resource } from '@halloween/shared/goods/goods';
import type { BagItem, GearItem } from '@halloween/shared/inventory/bag-items';
import type { NodeId, TreeNode } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Player } from '../players/player';

/**
 * Crafting from carried materials, infusing gear at an anvil, and buying
 * skill tree upgrades.
 */
export class CraftSystem extends GameSystem {
  /**
   * Makes a stack of a material, a fresh piece of gear, or one structure
   * from carried materials (late gear and parts only beside an anvil, for
   * less the better it is), using up any gear it builds in (`recipeParts`,
   * plain pieces from the bag). Gear and structures go where Grab would
   * put them, or at the player's feet when the bag is full.
   * @param token The player's token.
   * @param recipe What to make.
   * @param count How many to make.
   */
  craft(token: string, recipe: RecipeId, count = 1): void {
    const p = this.players.get(token);
    if (!p || p.dead || !RECIPES.includes(recipe) || !Number.isFinite(count)) {
      return;
    }
    const parts = this.settings.freeCrafting ? [] : recipeParts(recipe);
    let made = 0;
    for (; made < Math.min(MAX_CRAFT, Math.max(1, Math.floor(count))); made++) {
      if (!recipeUnlocked(recipe, this._game.gameTab.treeOf(p)) || (needsAnvil(recipe) && p.anvil === null && !this.settings.freeCrafting) || partsCount(parts, p.bag.bag) < 1 || (!this.settings.freeCrafting && !this._game.bag.pay(p, craftCost(recipe, p.anvil)))) {
        break;
      }
      for (const kind of parts) {
        const i = p.bag.bag.findIndex((it: BagItem | null): boolean => !!it && isGearItem(it) && it.kind === kind && !it.infusion);
        p.bag.bag[i] = null;
      }
      const item: BagItem = isMatRecipe(recipe) ? { material: recipe, count: ammoMade(recipe) } : freshItem(recipe, p.tree);
      const left = this._game.bag.takeIn(p, item, true);
      if (left) {
        this._game.drops.dropAt(p.x, p.y, left);
      }
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, made > 0 ? 'craft' : 'error');
  }

  /**
   * Infuses a piece of gear with an essence beside an anvil: the next level
   * of that essence's path (the first infusion locks it into the path for
   * good), paid in silver and essence less the anvil's discount. The hammer
   * everyone has becomes a new infused hammer, put in hand; a torch from a
   * stack in the bag comes off it as its own item. The TV feed says who
   * made what.
   * @param token The player's token.
   * @param from An equipped slot, a bag index, or 'hammer'.
   * @param essence The essence.
   */
  infuse(token: string, from: GearSlot | number | 'hammer', essence: Essence): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    const anvil = this.world.structureQueries.levelNear('anvil', p.x, p.y, ANVIL_RADIUS) ?? (this.settings.freeCrafting ? 0 : null);
    const item = anvil !== null && ESSENCES.includes(essence) ? this.infusable(p, from) : null;
    const next = item && nextInfusion(item, essence);
    const cost = item && next && infusionCost(item.kind, essence, next.level, anvil);
    if (!item || !next || !cost || (!this.settings.freeCrafting && !this._game.bag.pay(p, cost))) {
      this.outbox.sound(p, 'error');
      return;
    }
    const made = infusedItem(item, essence)!;
    this.putInfused(p, from, made);
    this._game.building.syncBuilding(p);
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'craft');
    this.outbox.events.push({ t: 'infused', x: p.x, y: p.y, finder: p.name, finderColor: p.color, kind: made.kind, infusion: next });
  }

  /**
   * The gear a phone asked to infuse: what's in an equipped slot or a bag
   * slot (one torch off a stack of them), or the hammer everyone has.
   * @param p The player.
   * @param from An equipped slot, a bag index, or 'hammer'.
   * @returns The item, or null when there's nothing there to infuse.
   */
  private infusable(p: Player, from: GearSlot | number | 'hammer'): GearItem | null {
    if (from === 'hammer') {
      return { kind: 'hammer', wear: GEAR.hammer.wear };
    }
    if (typeof from === 'string') {
      return GEAR_SLOTS.includes(from) ? p.bag.equipped[from] : null;
    }
    const item = Number.isInteger(from) ? p.bag.bag[from] ?? null : null;
    if (item && isBuildItem(item) && item.build === 'torch') {
      return { kind: 'torch', wear: GEAR.torch.wear };
    }
    return item && isGearItem(item) ? item : null;
  }

  /**
   * Puts an infused item where it came from: back in its slot, in hand for
   * a new infused hammer (the weapon there goes into the bag, and it's held
   * with neither shield nor torch), or into the bag beside the torch stack
   * it came off.
   * @param p The player.
   * @param from Where it came from.
   * @param made The infused item.
   */
  private putInfused(p: Player, from: GearSlot | number | 'hammer', made: GearItem): void {
    if (from === 'hammer') {
      const old = p.bag.equipped.weapon;
      p.bag.equipped.weapon = made;
      const left = old && this._game.bag.store(p, old, false);
      if (left) {
        this._game.drops.dropAt(p.x, p.y, left);
      }
      this._game.hands.settleHands(p, 'weapon');
      return;
    }
    if (typeof from === 'string') {
      p.bag.equipped[from] = made;
      return;
    }
    const stack = p.bag.bag[from];
    if (stack && isBuildItem(stack)) {
      stack.count--;
      if (stack.count === 0) {
        p.bag.bag[from] = null;
      }
      const left = this._game.bag.store(p, made, false);
      if (left) {
        this._game.drops.dropAt(p.x, p.y, left);
      }
      return;
    }
    p.bag.bag[from] = made;
  }

  /**
   * Raises one of a player's skill tree nodes a level, paid for in candy
   * and blood (less by a research table, `research`). The TV feed says who did it
   * and anything it opened up for them.
   * @param token The player's token.
   * @param node The skill tree node.
   */
  upgrade(token: string, node: NodeId): void {
    const p = this.players.get(token);
    if (!p || p.dead || !TREE_NODE[node]) {
      return;
    }
    const cost = upgradeCost(node, p.tree, p.research);
    if (cost === null || !nodeUnlocked(node, this._game.gameTab.treeOf(p)) || RESOURCES.some((r: Resource): boolean => !this._game.bag.has(p, r, cost[r]))) {
      this.outbox.sound(p, 'error');
      return;
    }
    if (!this._game.bag.unlimited) {
      for (const r of RESOURCES) {
        p.inventory[r] -= cost[r];
      }
    }
    const before = TREE.filter((n: TreeNode): boolean => nodeUnlocked(n.id, p.tree));
    p.tree.levels[node] = levelOf(node, p.tree) + 1;
    const opened = TREE.filter((n: TreeNode): boolean => nodeUnlocked(n.id, p.tree) && !before.includes(n)).map((n: TreeNode): NodeId => n.id);
    this.outbox.sound(p, 'unlock');
    this.outbox.events.push({ t: 'research', finder: p.name, finderColor: p.color, label: itemLabel(node), level: levelOf(node, p.tree), opens: itemNames(opened) });
    this.outbox.inventoryChanged.add(p.token);
  }
}
