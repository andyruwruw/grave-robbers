// Packages
import { PLAYER_COLORS } from '@halloween/shared/players/roster';
import { recipeUnlocked } from '@halloween/shared/skill-tree/progress';

// Local Imports
import { GameSystem } from '../core/game-system';
import { TestPlayer } from './test-player';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Bundle } from '@halloween/shared/goods/goods';
import type { NodeId } from '@halloween/shared/skill-tree/types/skill-tree';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Player } from '../players/player';
import type { BotHands } from './types/bot';

/**
 * The Game tab's test player: joining it, letting it think, and removing
 * it. It presses buttons through the same calls a phone does.
 */
export class TestBotSystem extends GameSystem {
  /**
   * The test player, while it plays.
   */
  private _testPlayer: TestPlayer | null = null;

  /**
   * Lets the test player think and press its buttons.
   */
  think(): void {
    if (this._testPlayer) {
      const bot = this.players.get(this._testPlayer.token)!;
      this._testPlayer.think({ x: bot.x, y: bot.y, dead: bot.dead, inventory: bot.inventory, bag: bot.bag.bag, canBuild: (kind: StructureKind): boolean => recipeUnlocked(`build:${kind}`, this._game.gameTab.treeOf(bot)), canPay: (cost: Bundle): boolean => bot.canPay(cost), research: bot.research > 0, tree: bot.tree, map: this.world.map, time: this.world.time, monsters: this.horde.bodies() });
    }
  }

  /**
   * Whether the test player is in the game.
   * @returns True while it plays.
   */
  get active(): boolean {
    return this._testPlayer !== null;
  }

  /**
   * Turns the test player on (joining it like a phone would) or off
   * (removing it); anything else leaves it be.
   * @param on True to turn it on, false off, undefined to leave it.
   */
  toggle(on: boolean | undefined): void {
    if (on === true && !this._testPlayer) {
      const used = new Set([...this.players.values()].map((p: Player): string => p.color));
      const joined = this._game.joining.join('Test Player', PLAYER_COLORS.find((c: string): boolean => !used.has(c)) ?? PLAYER_COLORS[0]);
      if (joined.ok) {
        const { token } = joined.identity;
        const hands: BotHands = {
          input: (x: number, y: number): void => this._game.controls.setInput(token, x, y),
          aim: (x: number, y: number): void => this._game.controls.setAim(token, x, y),
          action: (down: boolean): void => this._game.controls.setAction(token, down),
          craft: (recipe: RecipeId): void => this._game.crafting.craft(token, recipe),
          select: (slot: number | null): void => this._game.building.selectBuild(token, slot),
          place: (): string | null => this._game.building.placeBuild(token),
          upgrade: (node: NodeId): void => this._game.crafting.upgrade(token, node),
        };
        this._testPlayer = new TestPlayer(token, hands);
      }
    } else if (on === false && this._testPlayer) {
      this._game.joining.leave(this._testPlayer.token);
      this._testPlayer = null;
    }
  }
}
