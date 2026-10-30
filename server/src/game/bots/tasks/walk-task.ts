// Local Imports
import { CHASE_GIVE_UP, STUCK_TIME, SWING_TIME } from '../config/bot';
import { BotTask } from './bot-task';
import { SwingTask } from './swing-task';

// Types
import type { Step } from '../../pathing/types/path';
import type { BotControl, BotView } from '../types/bot';

/**
 * Follows a path, then swings at its goal if it has one.
 */
export class WalkTask extends BotTask {
  /**
   * Starts a walk.
   * @param path The steps left to walk (eaten as they're reached).
   * @param goal The tile to swing at on arrival, or null.
   * @param until Game clock seconds to give up at.
   * @param chase Whether it's chasing a monster.
   */
  constructor(readonly path: Step[], readonly goal: Step | null, until: number, readonly chase = false) {
    super(until);
  }

  /**
   * Follows the path one tile center at a time; gives up when stuck.
   * @param v What the test player knows.
   * @param bot The test player running it.
   */
  act(v: BotView, bot: BotControl): void {
    if (v.time - bot.movedAt > STUCK_TIME) {
      if (this.chase) {
        bot.ignoreFoes(v.time + CHASE_GIVE_UP);
      }
      bot.setTask(null);
      return;
    }
    while (this.path.length > 0 && Math.hypot(this.path[0].tx + 0.5 - v.x, this.path[0].ty + 0.5 - v.y) < 0.2) {
      this.path.shift();
    }
    const next = this.path[0];
    if (!next) {
      bot.hands.input(0, 0);
      bot.setTask(this.goal ? new SwingTask(this.goal, v.map.get(this.goal.tx, this.goal.ty), v.time + SWING_TIME) : null);
      return;
    }
    const dx = next.tx + 0.5 - v.x;
    const dy = next.ty + 0.5 - v.y;
    const d = Math.hypot(dx, dy);
    const speed = Math.min(1, 0.4 + d * 2);
    bot.hands.input((dx / d) * speed, (dy / d) * speed);
  }
}
