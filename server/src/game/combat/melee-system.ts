// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import {
  COMBO_WINDOW,
  HEAVY_FOLLOW_THROUGH,
  SUPER_COMBO,
  SUPER_DAMAGE,
  SUPER_KNOCKBACK,
  TIP_FROM,
} from '@halloween/shared/gear/melee-rules';
import {
  HIGH_GROUND,
  HIGH_GROUND_BONUS,
  MELEE_REACH_DOWN,
  MELEE_REACH_UP,
  PVP_DAMAGE,
  STRIKE_DELAY,
} from '@halloween/shared/players/combat';
import { INTERP_DELAY, INTERP_PING_MS } from '@halloween/shared/protocol/network';
import { weaponStats } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { GameSystem } from '../core/game-system';
import { SCREEN_EASE_LAG } from './config/combat';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { Player } from '../players/player';

/**
 * Melee: starting a swing, what it reaches, and the blow landing on the
 * players and monsters in front (or on the tile, see `TileJobSystem`).
 */
export class MeleeSystem extends GameSystem {
  /**
   * Every living player and monster (not risen allies) within the
   * weapon's reach and arc in front, and not too far above or below (see
   * MELEE_REACH_UP): one swing cleaves them all.
   * @param p The player.
   * @param weapon The weapon's stats.
   * @param rewind How far back (seconds) to judge where monsters were.
   * @returns The players and monsters it would hit.
   */
  meleeTargets(p: Player, weapon: WeaponStats, rewind = 0): { players: Player[]; monsters: { id: number; kind: MonsterKind; x: number; y: number }[] } {
    const fx = Math.cos(p.facing);
    const fy = Math.sin(p.facing);
    const height = this.world.map.elevationAt(p.x, p.y);
    const inArc = (x: number, y: number): boolean => {
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      const ahead = dx * fx + dy * fy;
      const aimed = weapon.line !== undefined ? ahead > 0 && Math.abs(dx * fy - dy * fx) <= weapon.line : ahead / dist >= weapon.arcCos;
      return dist <= weapon.reach && dist > 0 && aimed
        && this.world.map.elevationAt(x, y) - height <= MELEE_REACH_UP
        && height - this.world.map.elevationAt(x, y) <= MELEE_REACH_DOWN;
    };
    return {
      players: [...this.players.values()].filter((o: Player): boolean => o !== p && !o.dead && inArc(o.x, o.y)),
      monsters: (rewind > 0 ? this.horde.targetsAt(rewind, this.world.time) : this.horde.targets()).filter((m): boolean => inArc(m.x, m.y)),
    };
  }

  /**
   * How far behind the server a player's screen shows monsters (seconds):
   * their round trip, plus the 100ms their screen draws everyone in the
   * past when its ping is high (`INTERP_PING_MS`), or the easing toward
   * new snapshots otherwise. Melee is judged that far back so a swing
   * lands on what they saw.
   * @param p The player.
   * @returns The lag (seconds).
   */
  private lagOf(p: Player): number {
    if (p.ping === null) {
      return 0;
    }
    return p.ping / 1000 + (p.ping > INTERP_PING_MS ? INTERP_DELAY : SCREEN_EASE_LAG);
  }

  /**
   * Extra damage for swinging down at a target well below.
   * @param p The player.
   * @param x Where the target is (tiles across).
   * @param y Where the target is (tiles down).
   * @returns The bonus damage.
   */
  private highGround(p: Player, x: number, y: number): number {
    return this.world.map.elevationAt(p.x, p.y) - this.world.map.elevationAt(x, y) >= HIGH_GROUND ? HIGH_GROUND_BONUS : 0;
  }

  /**
   * Starts a melee swing with `kind` (null: the weapon), landing after its
   * windup (none for a Headsman's Axe swing after its multi-kill; any
   * other weapon's swing spends the skip unused); a heavy one slows the
   * swinger until it lands.
   * @param p The player.
   * @param stats The swing's weapon stats.
   * @param kind What the swing is made with (null: the weapon).
   */
  swing(p: Player, stats: WeaponStats, kind: GearKind | null): void {
    const skip = !kind && p.skipWindup && !!stats.multiKillSkip;
    const windup = skip ? 0 : stats.windup ?? STRIKE_DELAY;
    if (!kind) {
      p.skipWindup = false;
    }
    p.quickSwing = skip;
    p.nextActionAt = this.world.time + stats.cooldown;
    p.swings++;
    p.combo = -1;
    if (!kind && stats.combo) {
      if (this.world.time - p.comboAt > COMBO_WINDOW) {
        p.comboNext = 0;
      }
      p.combo = p.comboNext;
      p.comboNext = (p.comboNext + 1) % stats.combo.length;
      p.comboAt = this.world.time;
      if (stats.charge && p.charge >= stats.charge) {
        p.combo = SUPER_COMBO;
        p.charge = 0;
        p.comboNext = 0;
      }
    }
    p.swingWith = kind;
    p.digUntil = 0;
    p.strikeAt = this.world.time + windup;
    p.braceUntil = stats.windup && !skip ? p.strikeAt + HEAVY_FOLLOW_THROUGH : 0;
    if (kind) {
      this._game.actions.draw(p, kind);
    }
  }

  /**
   * A combo weapon's stats for the step the swing in progress is on (a
   * gauntlet's super uppercut hits far harder and always stuns).
   * @param p The player.
   * @param weapon The weapon's stats.
   * @returns The swing's stats.
   */
  private comboStats(p: Player, weapon: WeaponStats): WeaponStats {
    if (!weapon.combo || p.swingWith || p.combo < 0) {
      return weapon;
    }
    if (p.combo === SUPER_COMBO) {
      return { ...weapon, damage: weapon.damage * SUPER_DAMAGE, knockback: weapon.knockback * SUPER_KNOCKBACK, stun: 1 };
    }
    const step = weapon.combo[p.combo];
    return { ...weapon, damage: weapon.damage * step.mult, line: step.line ?? weapon.line, reach: weapon.reach + (step.reach ?? 0) };
  }

  /**
   * A swing landing with the equipped weapon. Players and monsters in
   * front take the hit first (all of them); otherwise it hits the facing
   * tile: refuels a light that's burning low (if carrying wood), damages
   * any other structure (full lights too), smashes a pumpkin, breaks a
   * chest open, or gathers if there's room to carry it. Jobs on the tile
   * always go by the hammer (`chop`); a hit on a player or monster wears
   * down a weapon that breaks, unless it was the hammer's swing. Hitting a player ends spawn
   * protection. A glaive hits harder with its tip, and the weapon's other
   * tricks ride along with the hit (see `HitEffects`); an infused weapon's
   * swing tricks go off around it (see `MeleeTricksSystem`), and kills
   * during it go through `InfusionSystem`.
   * @param p The player.
   */
  strike(p: Player): void {
    const tricks = this._game.meleeTricks;
    const weapon = tricks.wail(p, this.comboStats(p, p.swingWith ? weaponStats(p.swingWith, p.tree) : p.weapon()));
    const chop = p.hammer().chop!;
    const targets = this.meleeTargets(p, weapon, this.lagOf(p));
    const struck = targets.monsters.length;
    const cleave = 1 + (weapon.cleave ?? 0) * Math.max(0, struck - 1);
    const boost = weapon.overhealDamage && p.overheal > 0 ? weapon.overhealDamage : 1;
    const blow = (x: number, y: number): number => (weapon.damage + this.highGround(p, x, y)) * cleave * boost * (weapon.tip && Math.hypot(x - p.x, y - p.y) > weapon.reach * TIP_FROM ? weapon.tip : 1);
    const stun = weapon.stunPerExtra ? (weapon.stun ?? 0) + weapon.stunPerExtra * Math.max(0, struck - 1) : weapon.stun;
    const hit = new Set<number>();
    this._game.infusions.begin(p, weapon);
    tricks.nova(p, weapon);
    tricks.incense(p, weapon, targets.monsters);
    if (targets.players.length > 0 || struck > 0) {
      if (targets.players.length > 0) {
        p.protectedUntil = 0;
        p.protected = false;
      }
      for (const o of targets.players) {
        if (this._game.damage.hurt(o, blow(o.x, o.y) * PVP_DAMAGE, p, p.x, p.y, weapon.crush)) {
          this._game.damage.knock(o, p.x, p.y, weapon.knockback);
        }
      }
      for (const m of targets.monsters) {
        hit.add(m.id);
        this._game.infusions.before(m.id);
        this._game.spoils.killer = p;
        const tipped = Math.hypot(m.x - p.x, m.y - p.y) > weapon.reach * TIP_FROM;
        const amount = tricks.slays(p, weapon, m) ? Infinity : damageTo(m.kind, weapon, blow(m.x, m.y));
        const killed = this.horde.hit(m.id, amount, p.x, p.y, this.world, weapon.knockback, { ...weapon, stun, tipped, by: p });
        this._game.infusions.after(m.id);
        if (killed && weapon.harvest) {
          this._game.bag.take(p, 'blood', weapon.harvest);
        }
        if (!p.swingWith) {
          this._game.patches.scorch(m.x, m.y, p, weapon);
        }
      }
      if (struck > 0) {
        tricks.chain(p, weapon, targets.monsters, hit);
        tricks.fissure(p, weapon, blow);
        tricks.finish(p, weapon);
      }
      tricks.slam(p, weapon, hit, blow);
      this._game.spoils.killer = null;
      this.settle(p, weapon);
      if (weapon.charge && p.combo !== SUPER_COMBO && targets.monsters.length > 0) {
        p.charge = Math.min(weapon.charge, p.charge + 1);
      }
      if (weapon.hpCost && !p.swingWith && p.hp > weapon.hpCost) {
        p.hp -= weapon.hpCost;
        p.hurts++;
      }
      this.outbox.sound(p, 'hit');
      if (p.swingWith === 'stake') {
        this._game.damage.wearStake(p);
      } else if (!p.swingWith) {
        this._game.damage.wear(p, 'weapon');
      }
      return;
    }
    tricks.slam(p, weapon, hit, blow);
    this.settle(p, weapon);
    this._game.jobs.strikeTile(p, chop);
  }

  /**
   * Ends the strike's kill count: a swing that killed `multiKillSkip` or
   * more makes the next one skip its windup (Headsman's Axe).
   * @param p The player.
   * @param weapon The swing's stats.
   */
  private settle(p: Player, weapon: WeaponStats): void {
    const kills = this._game.infusions.end();
    if (weapon.multiKillSkip && !p.swingWith && kills >= weapon.multiKillSkip) {
      p.skipWindup = true;
    }
  }
}
