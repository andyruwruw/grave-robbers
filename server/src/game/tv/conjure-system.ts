// Packages
import { isMonsterKind } from '@halloween/shared/monsters/monster-kinds';
import { SPAWN_KINDS } from '@halloween/shared/protocol/tv-tools';

// Local Imports
import { NO_TREE } from '../config/loot';
import { GameSystem } from '../core/game-system';
import { randomLoot } from '../helpers/loot-rolls';

// Types
import type { SpawnKind } from '@halloween/shared/protocol/tv-tools';
import type { Player } from '../players/player';

/**
 * The TV's Game tab conjuring things onto the map, or killing every
 * monster.
 */
export class ConjureSystem extends GameSystem {
  /**
   * Conjures something at a random spot anywhere on the map: a tree,
   * pumpkin, chest, or rock, a piece of loot, or a monster (kept a few
   * tiles from every living player).
   * @param kind What to conjure.
   */
  spawn(kind: SpawnKind): void {
    if (!SPAWN_KINDS.includes(kind)) {
      return;
    }
    const living = [...this.players.values()].filter((p: Player): boolean => !p.dead && p.connected);
    if (isMonsterKind(kind)) {
      this.horde.summon(kind, this.world, living);
      return;
    }
    if (kind === 'loot') {
      for (let tries = 0; tries < 400; tries++) {
        const tx = 1 + Math.floor(Math.random() * (this.world.map.width - 2));
        const ty = 1 + Math.floor(Math.random() * (this.world.map.height - 2));
        if (this.world.inView(tx, ty) && !this.world.map.isSolid(tx, ty) && !living.some((p: Player): boolean => Math.floor(p.x) === tx && Math.floor(p.y) === ty)) {
          this.world.items.addHeld(tx + 0.5, ty + 0.5, randomLoot(NO_TREE), null);
          return;
        }
      }
      return;
    }
    const bodies = [...living, ...this.horde.bodies()];
    const at = this.world.growth.spawnTile(kind, (tx: number, ty: number): boolean =>
      bodies.some((o: { x: number; y: number }): boolean => Math.abs(o.x - (tx + 0.5)) < 1.2 && Math.abs(o.y - (ty + 0.5)) < 1.2));
    if (at && kind !== 'rock') {
      this.outbox.events.push({ t: 'grow', ...at, tile: kind });
    }
  }

  /**
   * Kills every monster on the map (the TV's Game tab).
   */
  killMonsters(): void {
    this.horde.killAll();
  }
}
