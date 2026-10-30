// Packages
import { weaponStats } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';
import { facingTile } from '@halloween/shared/world/targeting';

// Local Imports
import { GameSystem } from '../core/game-system';
import { DRAWN_SHOWN } from './config/combat';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Player } from '../players/player';

/**
 * What a player's Action button and combat timers set off each tick.
 */
export class ActionSystem extends GameSystem {
  /**
   * What a player's buttons and timers set off this tick: a new action, a
   * bow let go, a crossbow aiming or reloading, a swing landing.
   * @param p The player.
   * @param time The game clock (seconds).
   */
  tick(p: Player, time: number): void {
    if (p.actionHeld && time >= p.nextActionAt) {
      this.act(p);
    }
    if (p.drawFrom !== null && (!p.actionHeld || time - p.drawFrom >= (p.weapon().draw ?? 0))) {
      this._game.ranged.loose(p);
    }
    if (p.aimUntil !== null) {
      this._game.aiming.takeAim(p);
    }
    if (p.reloadUntil !== null) {
      this._game.ranged.reloading(p);
    }
    if (p.strikeAt !== null && time >= p.strikeAt) {
      p.strikeAt = null;
      this._game.melee.strike(p);
    }
  }

  /**
   * Starts a swing (landing STRIKE_DELAY later, see `strike`) or fires a
   * ranged weapon, which does nothing without its ammo (arrows or bolts in
   * the bag, or blood). A bow starts drawing instead (see `loose`), a
   * crossbow takes aim first (see `takeAim`), and a repeating crossbow
   * reloads after its burst. A weapon that feeds on health takes it only
   * when the swing lands on something (see `strike`), and won't swing on
   * the wielder's last.
   * @param p The player.
   */
  private act(p: Player): void {
    if (p.blocking || p.reloadUntil !== null) {
      return;
    }
    const weapon = p.weapon();
    const hammer = p.hammer();
    const stake = weaponStats('stake', p.tree);
    if (p.spareStake() >= 0 && this._game.melee.meleeTargets(p, stake).monsters.some((m): boolean => m.kind === 'vampire')) {
      this._game.melee.swing(p, stake, 'stake');
      return;
    }
    const near = this._game.melee.meleeTargets(p, weapon.ranged ? hammer : weapon);
    if (this._game.jobs.jobAhead(p) && near.players.length === 0 && near.monsters.length === 0) {
      this._game.melee.swing(p, hammer, 'hammer');
      const { tx, ty } = facingTile(p.x, p.y, p.facing);
      const tile = this.world.map.get(tx, ty);
      if (tile === 'tombstone' || tile === 'cross') {
        p.digUntil = p.drawnUntil;
      }
      return;
    }
    if (weapon.ranged) {
      if (weapon.reload && p.bag.equipped.weapon?.empty) {
        this._game.ranged.startReload(p, weapon);
      } else if (!this._game.ranged.hasAmmo(p, weapon)) {
        p.nextActionAt = this.world.time + weapon.cooldown;
        this.outbox.sound(p, 'error');
      } else if (weapon.draw) {
        p.drawFrom ??= this.world.time;
      } else if (weapon.sight) {
        if (p.aimUntil === null) {
          p.aimUntil = this.world.time + weapon.sight;
          p.aimTarget = this._game.aiming.lockOn(p, weapon.reach);
        }
      } else {
        p.nextActionAt = this.world.time + weapon.cooldown;
        p.swings++;
        this._game.ranged.shoot(p, weapon, weapon.damage);
        this._game.ranged.spend(p, weapon);
      }
      return;
    }
    if (weapon.hpCost && p.hp <= weapon.hpCost) {
      p.nextActionAt = this.world.time + weapon.cooldown;
      this.outbox.sound(p, 'error');
      return;
    }
    this._game.melee.swing(p, weapon, null);
  }

  /**
   * Takes something out in place of the weapon for a moment.
   * @param p The player.
   * @param kind What comes out.
   */
  draw(p: Player, kind: GearKind): void {
    p.drawn = kind;
    p.drawnUntil = this.world.time + DRAWN_SHOWN;
  }
}
