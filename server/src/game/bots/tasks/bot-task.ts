// Types
import type { BotControl, BotView } from '../types/bot';

/**
 * Something the test player is busy with until it's done or runs out of
 * time.
 */
export abstract class BotTask {
  /**
   * Sets the task's deadline.
   * @param until Game clock seconds after which a new task is picked.
   */
  constructor(readonly until: number) {}

  /**
   * Works on the task for one tick.
   * @param v What the test player knows.
   * @param bot The test player running it.
   */
  abstract act(v: BotView, bot: BotControl): void;
}
