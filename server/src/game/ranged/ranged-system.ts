// Packages
import { BOLT_SPEED, DRAW_BONUS } from '@halloween/shared/gear/ranged-rules';
import { stock } from '@halloween/shared/goods/goods';
import { BOLT_RANGE_PER_LEVEL } from '@halloween/shared/players/combat';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { BOLT_HEIGHT } from '../config/shots';
import { GameSystem } from '../core/game-system';
import { FlameSpraySystem } from './flame-spray-system';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Player } from '../players/player';

/**
 * Ranged weapons: ammo, shooting, drawing bows, and reloading crossbows.
 */
export class RangedSystem extends GameSystem {
  /**
   * The Hellmouth's flamethrower.
   */
  readonly spray = new FlameSpraySystem(this._game);

  /**
   * Whether a player carries what a ranged weapon fires.
   * @param p The player.
   * @param weapon The weapon's stats.
   * @returns True if it can fire.
   */
  hasAmmo(p: Player, weapon: WeaponStats): boolean {
    return weapon.ammo === 'blood' ? this._game.bag.has(p, 'blood', 1) : p.count(weapon.ammo ?? 'bolts') > 0;
  }

  /**
   * Looses a bolt, arrow, or gob of blood the way the player faces, at
   * chest height (a blunderbuss fans out its pellets). It carries further
   * from higher up. Each shot carries the weapon's stats (tree and
   * infusion) for what its hits do, flies as the weapon's `shotKind` if it
   * has one, and phases through walls, bounces, or pierces everything as
   * its infusion says.
   * @param p The player.
   * @param weapon The weapon's stats.
   * @param damage Damage on a hit (a drawn bow's is higher).
   * @param angle Which way to fire (radians; default: aimed with assist).
   * @param full Whether a bow was fully drawn (Wraithstring's arrows then
   * pass through walls).
   */
  shoot(p: Player, weapon: WeaponStats, damage: number, angle?: number, full = false): void {
    const height = this.world.map.elevationAt(p.x, p.y);
    if (Math.random() >= (weapon.thrift ?? 0)) {
      this._game.bag.pay(p, stock({ [weapon.ammo ?? 'bolts']: 1 }));
    }
    this.outbox.sound(p, 'shoot');
    this._game.damage.wear(p, 'weapon');
    const pellets = weapon.pellets ?? 1;
    const aim = angle ?? this._game.aiming.aim(p, weapon.reach + 1);
    for (let i = 0; i < pellets; i++) {
      const angle = aim + (pellets > 1 ? (i / (pellets - 1) - 0.5) * weapon.spread! : 0);
      this._game.shots.add({
        id: this._game.shots.nextId(),
        x: p.x + Math.cos(angle) * 0.4,
        y: p.y + Math.sin(angle) * 0.4,
        angle,
        kind: weapon.shotKind ?? (weapon.ammo === 'blood' ? 'blood' : weapon.ammo === 'arrows' ? 'arrow' : 'bolt'),
        weapon: p.bag.equipped.weapon?.kind ?? null,
        stats: weapon,
        left: weapon.reach + BOLT_RANGE_PER_LEVEL * Math.max(0, height) / LEVEL_HEIGHT,
        height: height + BOLT_HEIGHT,
        owner: p,
        damage,
        knockback: weapon.knockback,
        speed: BOLT_SPEED,
        hostile: false,
        by: p.name,
        pierce: weapon.pierceAll ? Infinity : weapon.pierce ?? 0,
        struck: [],
        phasing: weapon.wallPass === 'always' || (weapon.wallPass === 'drawn' && full),
        bounces: weapon.bounces ?? 0,
      });
    }
  }

  /**
   * Lets a drawn bow go (Action let go, or fully drawn): the further it was
   * drawn, the harder it hits, up to DRAW_BONUS times.
   * @param p The player.
   */
  loose(p: Player): void {
    const weapon = p.weapon();
    const drawn = weapon.draw ? Math.min(1, (this.world.time - p.drawFrom!) / weapon.draw) : 0;
    p.drawFrom = null;
    if (!weapon.draw || !this.hasAmmo(p, weapon)) {
      return;
    }
    p.nextActionAt = this.world.time + weapon.cooldown;
    p.swings++;
    this.shoot(p, weapon, weapon.damage * (1 + (DRAW_BONUS - 1) * drawn), undefined, drawn >= 1);
  }

  /**
   * Counts a bolt against a crossbow's load; once it's spent it needs a
   * reload, which starts right away.
   * @param p The player.
   * @param weapon The weapon's stats.
   */
  spend(p: Player, weapon: WeaponStats): void {
    const item = p.bag.equipped.weapon;
    if (!weapon.reload || !item) {
      return;
    }
    item.fired = (item.fired ?? 0) + 1;
    if (item.fired >= (weapon.burst ?? 1)) {
      item.fired = 0;
      item.empty = true;
      this.startReload(p, weapon);
    }
  }

  /**
   * Starts a crossbow's reload; a quick one a kill banked (Bone Rattler)
   * takes only the weapon's `reloadOnKill` share of the time, and is spent.
   * @param p The player.
   * @param weapon The weapon's stats.
   */
  startReload(p: Player, weapon: WeaponStats): void {
    const quick = weapon.reloadOnKill && p.reloadBanked ? weapon.reloadOnKill : 1;
    if (quick < 1) {
      p.reloadBanked = false;
    }
    p.reloadUntil = this.world.time + weapon.reload! * quick;
  }

  /**
   * A crossbow reloading: done once the time's up (loaded again), or
   * dropped if it left the player's hands (it stays empty).
   * @param p The player.
   */
  reloading(p: Player): void {
    const item = p.bag.equipped.weapon;
    const weapon = p.weapon();
    if (!item || !weapon.reload || p.dead) {
      p.reloadUntil = null;
      return;
    }
    if (this.world.time >= p.reloadUntil!) {
      item.empty = false;
      p.reloadUntil = null;
      this.outbox.inventoryChanged.add(p.token);
      this.outbox.sound(p, 'equip');
    }
  }
}
