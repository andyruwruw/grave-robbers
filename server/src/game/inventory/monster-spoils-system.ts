// Packages
import { monsterReward } from '@halloween/shared/difficulty/horde-scaling';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { stock } from '@halloween/shared/goods/goods';
import { LOOT_MIN_WEAR, MONSTER_LOOT_CHANCE } from '@halloween/shared/loot/found-gear';
import { MONSTER_BLOOD, MONSTER_BONES, MONSTER_ECTOPLASM, MONSTER_ESSENCE } from '@halloween/shared/loot/monster-drops';
import { ARMOR_SCRAP } from '@halloween/shared/monsters/armor';
import { altarBleed } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { ALTAR_RADIUS } from '@halloween/shared/structures/occult';

// Local Imports
import { NO_TREE } from '../config/loot';
import { GameSystem } from '../core/game-system';
import { randomLoot } from '../helpers/loot-rolls';
import { DROP_CLAIM_RADIUS } from './config/loot';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { Player } from '../players/player';

/**
 * What a dead monster leaves and who it goes to.
 */
export class MonsterSpoilsSystem extends GameSystem {
  /**
   * Whoever's hit is landing on a monster right now, so what it drops goes
   * straight to them if it dies.
   */
  killer: Player | null = null;

  /**
   * Who a monster's drops go to: whoever killed it, or (for kills by
   * traps, sentries, and the like) the nearest living player within
   * DROP_CLAIM_RADIUS. Null leaves them on the ground.
   * @param killer Whose blow killed it, if anyone's.
   * @param x Where it died (tiles across).
   * @param y Where it died (tiles down).
   * @returns Who gets them, or null.
   */
  private claimer(killer: Player | null, x: number, y: number): Player | null {
    if (killer && !killer.dead) {
      return killer;
    }
    let best: Player | null = null;
    let bestDist = DROP_CLAIM_RADIUS;
    for (const p of this.players.values()) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (!p.dead && d <= bestDist) {
        best = p;
        bestDist = d;
      }
    }
    return best;
  }

  /**
   * Something happened in the horde (its `event` hook): a monster's death
   * drops its loot and spoils to whoever claims them (nothing from one a
   * necromancer raised).
   * @param e The event.
   * @param bled Who gets a bleed's kill, when it wasn't a hit landing now.
   */
  onEvent(e: GameEvent, bled?: Player): void {
    this.outbox.events.push(e);
    if (e.t !== 'monster-death' || e.raised) {
      return;
    }
    const killer = this.claimer(bled ?? this.killer, e.x, e.y);
    const give = (item: BagItem): void => {
      if (killer) {
        this._game.pickups.pocket(killer, item, e.x, e.y);
      } else {
        this.world.items.addHeld(e.x, e.y, item, null);
      }
    };
    if (Math.random() < MONSTER_LOOT_CHANCE[e.kind]) {
      give(randomLoot(NO_TREE));
    }
    if (e.held) {
      give({ kind: e.held, wear: Math.ceil(GEAR[e.held].wear * (LOOT_MIN_WEAR + Math.random() * (1 - LOOT_MIN_WEAR))) });
    }
    const essence = MONSTER_ESSENCE[e.kind];
    const essences = essence && Math.random() < essence.chance ? { [essence.goods]: 1 } : {};
    if (MONSTER_BLOOD[e.kind] + MONSTER_BONES[e.kind] + MONSTER_ECTOPLASM[e.kind] > 0 || essence) {
      const altar = this.world.structureQueries.awakeAltarNear(e.x, e.y, ALTAR_RADIUS);
      const offered = altar === null ? 1 : altarBleed(altar);
      const scrap = e.armor && Math.random() < ARMOR_SCRAP[e.armor] ? 1 : 0;
      const spoils = stock({ blood: Math.round(MONSTER_BLOOD[e.kind] * offered * monsterReward(this._game.levels.worldLevel)), bone: MONSTER_BONES[e.kind], ectoplasm: MONSTER_ECTOPLASM[e.kind], iron: scrap, ...essences });
      const x = e.x - Math.cos(e.angle) * 0.2;
      const y = e.y - Math.sin(e.angle) * 0.2;
      if (killer) {
        this._game.pickups.award(killer, spoils, x, y);
      } else {
        this.world.items.addItem(x, y, spoils, null);
      }
    }
  }
}
