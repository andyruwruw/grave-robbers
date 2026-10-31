// Packages
import { itemVariant } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { SPLASH_RADIUS } from '@halloween/shared/monsters/kinds/witch';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';

// Local Imports
import { GameSystem } from '../core/game-system';
import { MIRROR_SHIELD_REACH, REFLECT_RANGE } from './config/ranged';

// Types
import type { Player } from '../players/player';
import type { Shot } from '../types/shot';

/**
 * The Mirror Shield: a raised block with it sends skeleton arrows and
 * ghost ectoplasm that reach it from the front back the way they came,
 * and catches witch potions in the air and lobs them back. What it sends
 * back is the blocker's: it hurts monsters and its kills are theirs.
 */
export class MirrorShieldSystem extends GameSystem {
  /**
   * Whether a hostile shot at a player bounces off their Mirror Shield:
   * they're blocking with it and it came from in front.
   * @param p The player it reached.
   * @param s The shot.
   * @returns True when it's sent back.
   */
  guards(p: Player, s: Shot): boolean {
    return this.raised(p) && this.inFront(p, s.x, s.y);
  }

  /**
   * Sends a hostile shot back the way it came, as the blocker's.
   * @param s The shot.
   * @param p Whose shield it bounced off.
   */
  reflect(s: Shot, p: Player): void {
    s.angle += Math.PI;
    s.left = Math.max(s.left, REFLECT_RANGE);
    s.height = Infinity;
    this.claim(s, p);
  }

  /**
   * Catches a hostile potion in the air in front of a player blocking with
   * a Mirror Shield, and lobs it back as far as it came.
   * @param s The potion.
   * @returns Whether one caught it.
   */
  catchPotion(s: Shot): boolean {
    const p = [...this.players.values()].find((o: Player): boolean =>
      this.raised(o) && Math.hypot(o.x - s.x, o.y - s.y) <= PLAYER_RADIUS + MIRROR_SHIELD_REACH && this.inFront(o, s.x, s.y));
    if (!p) {
      return false;
    }
    const flown = Math.max(1, (s.land ?? s.left) - s.left);
    s.angle += Math.PI;
    s.land = flown;
    s.left = flown;
    this.claim(s, p);
    return true;
  }

  /**
   * A potion a Mirror Shield sent back bursts: every monster within
   * SPLASH_RADIUS takes its damage. It leaves no puddle (puddles only hurt
   * players).
   * @param s The potion.
   */
  splashBack(s: Shot): void {
    this.outbox.events.push({ t: 'splash', x: s.x, y: s.y });
    for (const m of this.horde.targets()) {
      if (Math.hypot(m.x - s.x, m.y - s.y) <= SPLASH_RADIUS) {
        this._game.shots.hitMonster(s, m, s.x, s.y);
      }
    }
  }

  /**
   * Whether a player is blocking with a Mirror Shield.
   * @param p The player.
   * @returns True when it's raised.
   */
  private raised(p: Player): boolean {
    return p.blocking && !p.dead && itemVariant(p.bag.equipped.offhand)?.twist.reflect === true;
  }

  /**
   * Whether a point is in front of a player (the side their shield faces).
   * @param p The player.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @returns True when it is.
   */
  private inFront(p: Player, x: number, y: number): boolean {
    return (x - p.x) * Math.cos(p.facing) + (y - p.y) * Math.sin(p.facing) >= 0;
  }

  /**
   * Makes a sent-back shot the blocker's (it hits monsters, not players,
   * and is judged as a plain bow's), wears their shield, and shows the
   * flash.
   * @param s The shot.
   * @param p The blocker.
   */
  private claim(s: Shot, p: Player): void {
    s.hostile = false;
    s.reflected = true;
    s.owner = p;
    s.by = p.name;
    s.weapon = 'bow';
    s.stats = undefined;
    s.pierce = 0;
    s.struck = [];
    this._game.damage.wear(p, 'offhand');
    this.outbox.events.push({ t: 'reflect', x: s.x, y: s.y });
  }
}
