// Local Imports
import { BotTask } from './bot-task';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Step } from '../../pathing/types/path';
import type { BotControl, BotView } from '../types/bot';

/**
 * Aims at a tile and swings until the tile changes.
 */
export class SwingTask extends BotTask {
  /**
   * Starts swinging.
   * @param goal The tile to swing at.
   * @param tile What's on it now.
   * @param until Game clock seconds to give up at.
   */
  constructor(readonly goal: Step, readonly tile: Tile, until: number) {
    super(until);
  }

  /**
   * Aims, swings, and stops once the tile is something else.
   * @param v What the test player knows.
   * @param bot The test player running it.
   */
  act(v: BotView, bot: BotControl): void {
    const { hands } = bot;
    hands.input(0, 0);
    hands.aim(this.goal.tx + 0.5 - v.x, this.goal.ty + 0.5 - v.y);
    hands.action(true);
    if (v.map.get(this.goal.tx, this.goal.ty) !== this.tile) {
      bot.setTask(null);
    }
  }
}
