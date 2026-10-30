// Packages
import { RESOURCES } from '@halloween/shared/goods/goods';
import { emptyGear, isMaterialItem } from '@halloween/shared/inventory/bag-items';
import {
  CAMPFIRE_HEAL_PER_SECOND,
  CAMPFIRE_HEAL_RADIUS,
  DEATH_TOLL,
  FEAST_HEAL_PER_SECOND,
  FRESH_WOUND_SECONDS,
  MAX_HP,
  RESPAWN_DELAY,
  SPAWN_PROTECTION,
  TONIC_HEAL,
} from '@halloween/shared/players/health';
import { isTrap } from '@halloween/shared/structures/traps';
import { isSolidTile } from '@halloween/shared/world/tiles';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Player } from './player';

/**
 * Dying, coming back, and healing.
 */
export class LifeSystem extends GameSystem {
  /**
   * Drinks one tonic from a bag slot, unless there's nothing it could heal
   * (full health, or only fresh wounds).
   * @param token The player's token.
   * @param index The bag slot.
   */
  drink(token: string, index: number): void {
    const p = this.players.get(token);
    const item = p && !p.dead && Number.isInteger(index) ? p.bag.bag[index] : null;
    if (!p || !item || !isMaterialItem(item) || item.material !== 'tonic') {
      return;
    }
    if (p.hp >= p.healCap()) {
      this.outbox.sound(p, 'error');
      return;
    }
    this.heal(p, TONIC_HEAL);
    item.count--;
    if (item.count === 0) {
      p.bag.bag[index] = null;
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'drink');
  }

  /**
   * Spills the player's bag where they fell (what they wear stays on
   * them), takes a share of their candy and blood for good, and starts the
   * respawn timer.
   * @param p The player.
   * @param by Who or what did it (a player, or a name for the kill feed).
   */
  kill(p: Player, by: Player | string): void {
    this._game.drops.spill(p);
    const blood = p.inventory.blood;
    for (const r of RESOURCES) {
      p.inventory[r] = Math.floor(p.inventory[r] * (1 - DEATH_TOLL));
    }
    if (typeof by !== 'string' && by !== p) {
      this.outbox.naughty.set(by.token, by.inventory.candy);
      by.inventory.candy = 0;
      this._game.bag.take(by, 'blood', blood - p.inventory.blood);
    }
    p.bag.bag = emptyGear().bag;
    this.outbox.inventoryChanged.add(p.token);
    p.hp = 0;
    p.dead = true;
    p.moving = false;
    p.building = null;
    p.buildSlot = null;
    p.respawnAt = this.world.time + RESPAWN_DELAY;
    p.killedBy = typeof by === 'string' ? by : by.name;
    this.outbox.events.push({
      t: 'kill',
      killer: p.killedBy,
      killerColor: typeof by === 'string' ? null : by.color,
      victim: p.name,
      victimColor: p.color,
    });
  }

  /**
   * Brings a player back at their coffin or a random spawn: full health
   * and spawn protection.
   * @param p The player.
   */
  respawn(p: Player): void {
    Object.assign(p, this.coffinSpawn(p) ?? this._game.roster.randomSpawn());
    p.hp = MAX_HP;
    p.wounds = [];
    p.feast = 0;
    p.dead = false;
    p.strikeAt = null;
    p.drawFrom = null;
    p.protected = true;
    p.protectedUntil = this.world.time + SPAWN_PROTECTION;
    p.aliveSince = this.world.time;
    p.knockUntil = 0;
    p.panic = null;
    p.slowUntil = 0;
  }

  /**
   * Mends a player resting beside a burning campfire, and pays out what
   * their kills with a feeding weapon are owed (held back by fresh wounds,
   * wasted at full health). Health comes back no other way on its own.
   * @param p The player.
   * @param dt Seconds since the last step.
   */
  rest(p: Player, dt: number): void {
    const time = this.world.time;
    p.wounds = p.wounds.filter((w): boolean => time - w.at < FRESH_WOUND_SECONDS);
    if (p.dead) {
      return;
    }
    if (this.world.lights.nearLitCampfire(p.x, p.y, CAMPFIRE_HEAL_RADIUS)) {
      this.heal(p, CAMPFIRE_HEAL_PER_SECOND * dt);
    }
    if (p.feast > 0) {
      const due = Math.min(p.feast, FEAST_HEAL_PER_SECOND * dt);
      p.feast -= p.hp >= MAX_HP ? due : this.heal(p, due);
    }
  }

  /**
   * Heals up to `amount`, never into fresh wounds.
   * @param p The player.
   * @param amount The most to heal.
   * @returns How much it healed.
   */
  private heal(p: Player, amount: number): number {
    const healed = Math.max(0, Math.min(amount, p.healCap() - p.hp));
    p.hp += healed;
    return healed;
  }

  /**
   * Beside the player's own coffin, if they built one and there's room
   * next to it.
   * @param p The player.
   * @returns The spot, or null.
   */
  private coffinSpawn(p: Player): { x: number; y: number } | null {
    const coffin = this.world.structureQueries.coffinOf(p.id);
    if (!coffin) {
      return null;
    }
    const sides: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    const side = sides.find(([dx, dy]): boolean => !isSolidTile(this.world.map.get(coffin.tx + dx, coffin.ty + dy)) && !isTrap(this.world.map.get(coffin.tx + dx, coffin.ty + dy)));
    return side ? { x: coffin.tx + side[0] + 0.5, y: coffin.ty + side[1] + 0.5 } : null;
  }
}
