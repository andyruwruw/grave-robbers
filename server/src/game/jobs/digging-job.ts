// Packages
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { BLUEPRINTS } from '@halloween/shared/skill-tree/nodes';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { NodeId } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Player } from '../players/player';

/**
 * A job that digs something up, `hits` at a time, for rolled loot and
 * maybe a blueprint.
 */
export abstract class DiggingJob extends TileJob {
  /**
   * A random whole number from min to max.
   * @param range The lowest and highest roll.
   * @returns The roll.
   */
  protected roll([min, max]: [number, number]): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * Maybe finds a blueprint the player hasn't found yet, which unlocks a
   * node of their skill tree.
   * @param p The player.
   * @param chance The chance of finding one.
   */
  protected findBlueprint(p: Player, chance: number): void {
    const missing = BLUEPRINTS.filter((id: NodeId): boolean => !p.tree.found.includes(id));
    if (missing.length > 0 && Math.random() < chance) {
      const found = missing[Math.floor(Math.random() * missing.length)];
      p.tree.found.push(found);
      this.outbox.events.push({ t: 'blueprint', finder: p.name, finderColor: p.color, label: itemLabel(found) });
      this.outbox.inventoryChanged.add(p.token);
    }
  }
}
