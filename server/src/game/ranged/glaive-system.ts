// Packages
import { COMBO_WINDOW } from '@halloween/shared/gear/melee-rules';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';

// Local Imports
import { BOLT_HEIGHT } from '../config/shots';
import { GameSystem } from '../core/game-system';
import { GLAIVE_CATCH, GLAIVE_REACH, GLAIVE_SPARE, SHOT_STEP } from './config/ranged';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { Player } from '../players/player';
import type { Shot } from '../types/shot';

/**
 * The thrown glaive (Soulbound and Wraith Glaive, the weapon's
 * `throwStab`): the combo's stab step throws it instead, it flies out
 * cutting through every monster on the way and comes back to the thrower
 * the same way, and they can't act until they catch it.
 */
export class GlaiveSystem extends GameSystem {
  /**
   * Whether the swing the player is about to make is a glaive's stab that
   * becomes a throw.
   * @param p The player.
   * @param weapon The weapon's stats.
   * @returns True when it's thrown instead.
   */
  throwsNext(p: Player, weapon: WeaponStats): boolean {
    if (!weapon.throwStab || !weapon.combo) {
      return false;
    }
    return weapon.combo[this.nextStep(p)]?.line !== undefined;
  }

  /**
   * Throws the glaive in place of its stab: the combo moves on as if it
   * had swung, it turns toward the nearest monster ahead when it
   * auto-aims, and the blade hits as hard as a stab on its tip.
   * @param p The player.
   * @param weapon The weapon's stats.
   */
  throw(p: Player, weapon: WeaponStats): void {
    const trick = weapon.throwStab!;
    const time = this.world.time;
    const step = this.nextStep(p);
    p.nextActionAt = time + weapon.cooldown;
    p.swings++;
    p.combo = step;
    p.comboNext = (step + 1) % (weapon.combo?.length ?? 1);
    p.comboAt = time;
    p.swingWith = null;
    p.strikeAt = null;
    p.digUntil = 0;
    p.thrown = true;
    const lock = trick.autoAim ? this._game.aiming.lockOn(p, trick.range + 1) : null;
    const target = lock === null ? undefined : this.horde.targets().find((m): boolean => m.id === lock);
    const angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : this._game.aiming.aim(p, trick.range + 1);
    p.facing = angle;
    this.outbox.sound(p, 'shoot');
    this._game.shots.add({
      id: this._game.shots.nextId(),
      x: p.x + Math.cos(angle) * 0.4,
      y: p.y + Math.sin(angle) * 0.4,
      angle,
      kind: 'glaive',
      weapon: p.bag.equipped.weapon?.kind ?? null,
      stats: weapon,
      left: trick.range,
      height: this.world.map.elevationAt(p.x, p.y) + BOLT_HEIGHT,
      owner: p,
      damage: weapon.damage * (weapon.combo?.[step]?.mult ?? 1) * (weapon.tip ?? 1),
      knockback: weapon.knockback,
      speed: trick.speed,
      hostile: false,
      by: p.name,
      struck: [],
      glaive: { returning: false, fromX: 0, fromY: 0, sideX: 0, sideY: 0, t: 0, arc: trick.arc, until: time + (trick.range * 2) / trick.speed + GLAIVE_SPARE },
    });
  }

  /**
   * Flies a thrown glaive on: straight out until its range runs out or it
   * meets a wall, then back to its thrower (through anything in the way),
   * cutting every monster it passes once each way. It's caught when it
   * gets back, or when its thrower dies or it takes too long.
   * @param s The glaive.
   * @param dt Seconds since the last step.
   * @returns Whether it's still out.
   */
  fly(s: Shot, dt: number): boolean {
    const owner = s.owner;
    const flight = s.glaive!;
    if (!owner || owner.dead || this.world.time >= flight.until) {
      return this.catch(s);
    }
    const steps = Math.max(1, Math.ceil((s.speed * dt) / SHOT_STEP));
    const step = (s.speed * dt) / steps;
    for (let i = 0; i < steps; i++) {
      if (flight.returning) {
        if (this.comeBack(s, owner, step)) {
          return this.catch(s);
        }
      } else {
        s.x += Math.cos(s.angle) * step;
        s.y += Math.sin(s.angle) * step;
        s.left -= step;
        if (s.left <= 0 || this._game.shots.blocked(s.x, s.y, s.height)) {
          this.turn(s);
        }
      }
      this.cut(s);
    }
    return true;
  }

  /**
   * Turns a glaive back, picking the side to swing out to that has more
   * monsters, and lets it hit everything again on the way.
   * @param s The glaive.
   */
  private turn(s: Shot): void {
    const flight = s.glaive!;
    const owner = s.owner!;
    flight.returning = true;
    flight.fromX = s.x;
    flight.fromY = s.y;
    flight.t = 0;
    s.struck = [];
    if (flight.arc <= 0) {
      return;
    }
    const nx = -Math.sin(s.angle);
    const ny = Math.cos(s.angle);
    const midX = (s.x + owner.x) / 2;
    const midY = (s.y + owner.y) / 2;
    const near = (side: number): number => this.horde.targets()
      .filter((m): boolean => Math.hypot(m.x - (midX + nx * flight.arc * side), m.y - (midY + ny * flight.arc * side)) <= flight.arc + 0.5).length;
    const side = near(-1) > near(1) ? -1 : 1;
    flight.sideX = nx * flight.arc * 2 * side;
    flight.sideY = ny * flight.arc * 2 * side;
  }

  /**
   * Moves a returning glaive `step` tiles along its curve back to the
   * thrower (who may have moved): a quadratic from where it turned, bent
   * out by its side offset, to where they stand now.
   * @param s The glaive.
   * @param owner Its thrower.
   * @param step How far it moves (tiles).
   * @returns Whether it's back.
   */
  private comeBack(s: Shot, owner: Player, step: number): boolean {
    const flight = s.glaive!;
    const midX = (flight.fromX + owner.x) / 2 + flight.sideX;
    const midY = (flight.fromY + owner.y) / 2 + flight.sideY;
    const length = Math.max(0.5, Math.hypot(owner.x - flight.fromX, owner.y - flight.fromY) + Math.hypot(flight.sideX, flight.sideY) / 2);
    flight.t = Math.min(1, flight.t + step / length);
    const t = flight.t;
    const x = (1 - t) * (1 - t) * flight.fromX + 2 * (1 - t) * t * midX + t * t * owner.x;
    const y = (1 - t) * (1 - t) * flight.fromY + 2 * (1 - t) * t * midY + t * t * owner.y;
    s.angle = Math.atan2(y - s.y, x - s.x);
    s.x = x;
    s.y = y;
    return t >= 1 || Math.hypot(owner.x - x, owner.y - y) <= GLAIVE_CATCH;
  }

  /**
   * The blade cuts every monster it passes that it hasn't this way yet.
   * @param s The glaive.
   */
  private cut(s: Shot): void {
    const back = 0.3;
    const fromX = s.x - Math.cos(s.angle) * back;
    const fromY = s.y - Math.sin(s.angle) * back;
    for (const m of this.horde.targets()) {
      if (!s.struck!.includes(m.id) && Math.hypot(m.x - s.x, m.y - s.y) < MONSTER_RADIUS + GLAIVE_REACH) {
        s.struck!.push(m.id);
        this._game.shots.hitMonster(s, m, fromX, fromY, { tipped: true });
      }
    }
  }

  /**
   * Its thrower has it back.
   * @param s The glaive.
   * @returns False: it's no longer out.
   */
  private catch(s: Shot): false {
    if (s.owner) {
      s.owner.thrown = false;
    }
    return false;
  }

  /**
   * Which combo step the player's next swing is on (back to the first
   * once COMBO_WINDOW has passed).
   * @param p The player.
   * @returns The step.
   */
  private nextStep(p: Player): number {
    return this.world.time - p.comboAt > COMBO_WINDOW ? 0 : p.comboNext;
  }
}
