// Packages
import { clampDifficulty, difficultyOf } from '@halloween/shared/difficulty/difficulty';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Player } from '../players/player';

/**
 * The TV's Game tab switches, and what they do to players' trees.
 */
export class GameTabSystem extends GameSystem {
  /**
   * Applies switches from the TV's Game tab. Turning the test player on
   * joins it like a phone would; turning it off removes it.
   * @param next The switches the TV changed.
   */
  configure(next: Partial<GameSettings>): void {
    if (typeof next.aggressive === 'boolean') {
      this.settings.aggressive = next.aggressive;
    }
    for (const key of ['lightsOff', 'daytime', 'tvDrag', 'tvLight', 'threads'] as const) {
      if (typeof next[key] === 'boolean') {
        this.settings[key] = next[key];
      }
    }
    if (typeof next.spawning === 'boolean') {
      this.settings.spawning = next.spawning;
    }
    for (const key of ['allUnlocks', 'freeCrafting'] as const) {
      if (typeof next[key] === 'boolean' && next[key] !== this.settings[key]) {
        this.settings[key] = next[key];
        for (const p of this.players.values()) {
          this.outbox.inventoryChanged.add(p.token);
        }
      }
    }
    if (typeof next.difficulty === 'number') {
      this.settings.difficulty = clampDifficulty(next.difficulty);
    }
    this.horde.setDealt(difficultyOf(this.settings.difficulty).dealt);
    if (typeof next.levelBoost === 'number' && Number.isFinite(next.levelBoost)) {
      this._game.levels.applyBoost(next.levelBoost);
    }
    if (!this.settings.tvDrag && this._game.tvHand.holding) {
      this._game.tvHand.release();
    }
    if (!this.settings.tvLight) {
      this._game.tvHand.setCursorLight(null);
    }
    this._game.testBot.toggle(next.testPlayer);
    this.settings.testPlayer = this._game.testBot.active;
    this.horde.passive = !this.settings.aggressive;
    this.horde.dark = this.settings.lightsOff;
    this.horde.spawning = this.settings.spawning;
    this.world.growth.restock = this.settings.spawning;
  }

  /**
   * A player's tree with the Game tab's testing switches applied.
   * @param p The player.
   * @returns The tree to judge unlocks by.
   */
  treeOf(p: Player): TreeState {
    return this.settings.allUnlocks || this.settings.freeCrafting ? { ...p.tree, all: this.settings.allUnlocks, free: this.settings.freeCrafting } : p.tree;
  }
}
