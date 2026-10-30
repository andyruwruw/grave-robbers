// Packages
import { GEAR, wearsOut } from '@halloween/shared/gear/gear-catalog';
import { isGearItem } from '@halloween/shared/inventory/bag-items';
import { KNOCKBACK_DISTANCE, KNOCKBACK_TIME } from '@halloween/shared/players/combat';
import { gearGuard } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Player } from '../players/player';

/**
 * Hits landing on players: shields, armor and wear, knockback, and the
 * horde's hits.
 */
export class DamageSystem extends GameSystem {
  /**
   * Damages a player unless they're protected or already dead, killing
   * them at zero.
   * @param p The player.
   * @param amount The damage before guarding.
   * @param by Who or what did it (a player, or a name for the kill feed).
   * @param fromX Where the hit came from (tiles across).
   * @param fromY Where the hit came from (tiles down).
   * @param crush Whether the hit crushes through a raised shield.
   * @returns Whether it landed.
   */
  hurt(p: Player, amount: number, by: Player | string, fromX?: number, fromY?: number, crush = false): boolean {
    if (p.dead || p.protected) {
      return false;
    }
    if (fromX !== undefined && fromY !== undefined) {
      amount = this.guard(p, amount, fromX, fromY, crush);
    }
    const before = Math.ceil(p.hp);
    p.hp -= amount;
    const last = p.wounds.at(-1);
    if (last && this.world.time - last.at < 0.5) {
      last.amount += amount;
      last.at = this.world.time;
    } else {
      p.wounds.push({ at: this.world.time, amount });
    }
    if (Math.ceil(p.hp) !== before) {
      p.hurts++;
    }
    if (p.hp <= 0) {
      this._game.life.kill(p, by);
    }
    return true;
  }

  /**
   * Shoves a player away from (fromX, fromY).
   * @param p The player.
   * @param fromX Where the hit came from (tiles across).
   * @param fromY Where the hit came from (tiles down).
   * @param distance How far (tiles).
   */
  knock(p: Player, fromX: number, fromY: number, distance = KNOCKBACK_DISTANCE): void {
    const dist = Math.hypot(p.x - fromX, p.y - fromY);
    const armor = p.bag.equipped.armor;
    distance *= armor ? GEAR[armor.kind].steady ?? 1 : 1;
    if (dist === 0 || distance <= 0) {
      return;
    }
    const speed = distance / KNOCKBACK_TIME;
    p.knockX = ((p.x - fromX) / dist) * speed;
    p.knockY = ((p.y - fromY) / dist) * speed;
    p.knockUntil = this.world.time + KNOCKBACK_TIME;
  }

  /**
   * Uses up some of an equipped piece (a hit, a block, or seconds of
   * burning); it breaks at zero. The phone only hears about whole units.
   * @param p The player.
   * @param slot The equipped slot.
   * @param amount How much wear to use up.
   */
  wear(p: Player, slot: GearSlot, amount = 1): void {
    const item = p.bag.equipped[slot];
    if (!item || !wearsOut(item.kind)) {
      return;
    }
    const before = Math.ceil(item.wear);
    item.wear -= amount;
    if (item.wear <= 0) {
      p.bag.equipped[slot] = null;
      this.outbox.sound(p, 'break');
    }
    if (Math.ceil(item.wear) !== before) {
      this.outbox.inventoryChanged.add(p.token);
    }
  }

  /**
   * Wears down the stake in the bag that was just swung.
   * @param p The player.
   */
  wearStake(p: Player): void {
    const index = p.spareStake();
    const item = index >= 0 ? p.bag.bag[index] : null;
    if (!item || !isGearItem(item)) {
      return;
    }
    item.wear -= 1;
    if (item.wear <= 0) {
      p.bag.bag[index] = null;
      this.outbox.sound(p, 'break');
    }
    this.outbox.inventoryChanged.add(p.token);
  }

  /**
   * Softens a hit from (fromX, fromY): a raised shield (unless the hit
   * `crush`es) or a quarterstaff takes the edge off hits from the front,
   * armor off every hit. Each block wears the shield and armor down.
   * @param p The player.
   * @param amount The damage before guarding.
   * @param fromX Where the hit came from (tiles across).
   * @param fromY Where the hit came from (tiles down).
   * @param crush Whether the hit crushes through a raised shield.
   * @returns The damage left.
   */
  private guard(p: Player, amount: number, fromX: number, fromY: number, crush = false): number {
    const dx = fromX - p.x;
    const dy = fromY - p.y;
    const d = Math.hypot(dx, dy);
    const front = d === 0 || (dx * Math.cos(p.facing) + dy * Math.sin(p.facing)) / d >= 0;
    if (p.blocking && front && !crush) {
      amount *= gearGuard('shield', p.tree);
      this.wear(p, 'offhand');
    }
    const deflect = p.weapon().deflect;
    if (deflect && front) {
      amount *= deflect;
    }
    const armor = p.bag.equipped.armor;
    if (armor) {
      amount *= gearGuard(armor.kind, p.tree);
      this.wear(p, 'armor');
    }
    return amount;
  }

  /**
   * A monster hit a player (the horde's `hurt` hook): the hit, its
   * knockback and slow.
   * @param p The player.
   * @param amount The damage before guarding.
   * @param by The monster's name for the kill feed.
   * @param fromX Where the hit came from (tiles across).
   * @param fromY Where the hit came from (tiles down).
   * @param knockback How far it knocks them back (tiles), or the default.
   * @param slow Seconds it slows them, if it does.
   * @returns The thorns damage their armor hits back with.
   */
  hurtByMonster(p: Player, amount: number, by: string, fromX: number, fromY: number, knockback?: number, slow?: number): number {
    if (!this.hurt(p, amount, by, fromX, fromY)) {
      return 0;
    }
    this.knock(p, fromX, fromY, knockback);
    if (slow) {
      p.slowUntil = Math.max(p.slowUntil, this.world.time + slow);
    }
    const armor = p.bag.equipped.armor;
    return armor ? GEAR[armor.kind].thorns ?? 0 : 0;
  }
}
