// Packages
import { isBuildItem } from '@halloween/shared/inventory/bag-items';

// Local Imports
import { BotTask } from './bot-task';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Step } from '../../pathing/types/path';
import type { BotControl, BotView } from '../types/bot';

/**
 * Faces a tile beside the test player, then crafts and places a structure
 * on it.
 */
export class BuildTask extends BotTask {
  /**
   * Starts a build.
   * @param goal The tile to build on.
   * @param build What to build.
   * @param at Game clock seconds to place it at.
   * @param until Game clock seconds to give up at.
   */
  constructor(readonly goal: Step, readonly build: StructureKind, readonly at: number, until: number) {
    super(until);
  }

  /**
   * Aims at the tile, and once it's time crafts, selects and places the
   * structure, then finishes.
   * @param v What the test player knows.
   * @param bot The test player running it.
   */
  act(v: BotView, bot: BotControl): void {
    const { hands } = bot;
    hands.input(0, 0);
    hands.aim(this.goal.tx + 0.5 - v.x, this.goal.ty + 0.5 - v.y);
    if (v.time >= this.at) {
      hands.craft(`build:${this.build}`);
      const slot = v.bag.findIndex((item: BagItem | null): boolean => !!item && isBuildItem(item) && item.build === this.build);
      if (slot >= 0) {
        hands.select(slot);
        hands.place();
        hands.select(null);
      }
      bot.setTask(null);
    }
  }
}
