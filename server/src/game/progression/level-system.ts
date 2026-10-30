// Packages
import { playerLevel } from '@halloween/shared/difficulty/player-level';
import {
  WORLD_LEVEL_BOOST_MAX,
  WORLD_LEVEL_FALL,
  WORLD_LEVEL_RISE,
  worldLevelTarget,
} from '@halloween/shared/difficulty/world-level';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Player } from '../players/player';

/**
 * The hidden player and world levels (see shared `difficulty/`).
 */
export class LevelSystem extends GameSystem {
  /**
   * The hidden world level (see `shared/src/difficulty/world-level.ts`), in memory only.
   */
  worldLevel = 0;

  /**
   * Each player's hidden level (see `shared/src/difficulty/player-level.ts`), by id.
   * @returns Each level, rounded to a tenth.
   */
  playerLevels(): Record<string, number> {
    return Object.fromEntries([...this.players.values()].map((p: Player): [string, number] => [p.id, Math.round(playerLevel(p.bag, p.tree, p.onlineSeconds).total * 10) / 10]));
  }

  /**
   * Counts connected players' time online, and eases the world level
   * toward what the players online call for plus the Game tab's boost:
   * quickly up, slowly down, and not at all while nobody is connected
   * (a change to the boost moves it at once).
   * @param dt Seconds since the last step.
   */
  advanceLevels(dt: number): void {
    const online = [...this.players.values()].filter((p: Player): boolean => p.connected);
    for (const p of online) {
      p.onlineSeconds += dt;
    }
    const players = worldLevelTarget(online.map((p: Player): number => playerLevel(p.bag, p.tree, p.onlineSeconds).total));
    const target = players === null ? null : players + this.settings.levelBoost;
    if (target !== null) {
      this.worldLevel = target > this.worldLevel
        ? Math.min(target, this.worldLevel + WORLD_LEVEL_RISE * dt)
        : Math.max(target, this.worldLevel - WORLD_LEVEL_FALL * dt);
    }
    this.horde.level = this.worldLevel;
  }

  /**
   * Applies the Game tab's world level boost: the level moves by the
   * change at once.
   * @param levelBoost The Game tab's boost.
   */
  applyBoost(levelBoost: number): void {
    const boost = Math.min(WORLD_LEVEL_BOOST_MAX, Math.max(0, Math.round(levelBoost)));
    this.worldLevel = Math.max(0, this.worldLevel + boost - this.settings.levelBoost);
    this.settings.levelBoost = boost;
  }
}
