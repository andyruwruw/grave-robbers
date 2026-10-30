// Packages
import { RESOURCES } from '@halloween/shared/goods/goods';
import { TREE } from '@halloween/shared/skill-tree/nodes';
import { nodeUnlocked } from '@halloween/shared/skill-tree/progress';
import { upgradeCost } from '@halloween/shared/skill-tree/upgrade-cost';

// Local Imports
import { findPath } from '../pathing/find-path';
import {
  CHASE_GIVE_UP,
  CHASE_REPATH,
  FIGHT_RANGE,
  STRIKE_RANGE,
  UPGRADE_EVERY,
} from './config/bot';
import { botTile, isOpen, stepCost } from './helpers/bot-terrain';
import { TaskPicker } from './task-picker';
import { WalkTask } from './tasks/walk-task';

// Types
import type { Resource } from '@halloween/shared/goods/goods';
import type { TreeNode } from '@halloween/shared/skill-tree/types/skill-tree';
import type { BotTask } from './tasks/bot-task';
import type { BotControl, BotHands, BotView } from './types/bot';

/**
 * A server-run player for testing from the TV: paths to and fights any
 * monster that comes close (giving up on ones it can't reach), otherwise
 * runs across the map to chop a random tree, mine a rock or grave, or open
 * a chest, every so often builds something next to itself (never where it
 * would wall itself in), spends its candy on a random upgrade whenever it
 * passes a research table, and walks somewhere random when there's nothing
 * to gather.
 */
export class TestPlayer implements BotControl {
  /**
   * What it's busy with, or null to pick something.
   */
  private _task: BotTask | null = null;

  /**
   * Where it was when it last moved.
   */
  private _lastX = 0;

  /**
   * Where it was when it last moved (down the map).
   */
  private _lastY = 0;

  /**
   * When it last moved (game clock seconds).
   */
  private _movedAt = 0;

  /**
   * Monsters are ignored until this time (after one couldn't be reached).
   */
  private _ignoreFoesUntil = 0;

  /**
   * When it may next buy an upgrade.
   */
  private _nextUpgradeAt = 0;

  /**
   * Picks its next task.
   */
  private readonly _picker = new TaskPicker();

  /**
   * Starts a test player.
   * @param token The player's token in the game.
   * @param hands Its controls.
   */
  constructor(readonly token: string, readonly hands: BotHands) {}

  /**
   * When it last moved (game clock seconds).
   * @returns The time.
   */
  get movedAt(): number {
    return this._movedAt;
  }

  /**
   * Replaces its current task.
   * @param task The new task, or null to pick one next tick.
   */
  setTask(task: BotTask | null): void {
    this._task = task;
  }

  /**
   * Has it ignore monsters for a while.
   * @param until Game clock seconds to ignore them until.
   */
  ignoreFoes(until: number): void {
    this._ignoreFoesUntil = until;
  }

  /**
   * Decides what to do this tick and works the controls.
   * @param v What it knows.
   */
  think(v: BotView): void {
    const { hands } = this;
    if (v.dead) {
      this._task = null;
      hands.input(0, 0);
      hands.aim(0, 0);
      hands.action(false);
      return;
    }
    if (Math.hypot(v.x - this._lastX, v.y - this._lastY) > 0.05) {
      this._lastX = v.x;
      this._lastY = v.y;
      this._movedAt = v.time;
    }
    if (v.research && v.time >= this._nextUpgradeAt) {
      this._nextUpgradeAt = v.time + UPGRADE_EVERY;
      const options = TREE.filter((n: TreeNode): boolean => {
        const cost = upgradeCost(n.id, v.tree);
        return nodeUnlocked(n.id, v.tree) && cost !== null && RESOURCES.every((r: Resource): boolean => v.inventory[r] >= cost[r]);
      });
      if (options.length > 0) {
        hands.upgrade(options[Math.floor(Math.random() * options.length)].id);
      }
    }
    const foe = v.time >= this._ignoreFoesUntil ? this.nearestFoe(v) : null;
    if (foe && Math.hypot(foe.x - v.x, foe.y - v.y) <= STRIKE_RANGE) {
      this._task = null;
      hands.input(0, 0);
      hands.aim(foe.x - v.x, foe.y - v.y);
      hands.action(true);
      return;
    }
    if (foe && !(this._task instanceof WalkTask && this._task.chase && v.time <= this._task.until)) {
      hands.action(false);
      const path = findPath({ width: v.map.width, height: v.map.height, from: botTile(v), to: { tx: Math.floor(foe.x), ty: Math.floor(foe.y) }, cost: stepCost(v.map), open: isOpen(v.map) });
      if (path && path.length > 0) {
        if (!(this._task instanceof WalkTask) || !this._task.chase) {
          this._movedAt = v.time;
        }
        this._task = new WalkTask(path, null, v.time + CHASE_REPATH, true);
      } else {
        this._ignoreFoesUntil = v.time + CHASE_GIVE_UP;
      }
    }
    if (!this._task || v.time > this._task.until) {
      hands.aim(0, 0);
      hands.action(false);
      this._task = this._picker.choose(v);
      this._movedAt = v.time;
    }
    this._task.act(v, this);
  }

  /**
   * The nearest monster within FIGHT_RANGE.
   * @param v What it knows.
   * @returns Where that monster is, or null.
   */
  private nearestFoe(v: BotView): { x: number; y: number } | null {
    let best: { x: number; y: number } | null = null;
    let bestD = FIGHT_RANGE;
    for (const m of v.monsters) {
      const d = Math.hypot(m.x - v.x, m.y - v.y);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }
}
