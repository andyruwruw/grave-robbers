// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { GHOST_SLOW_SECONDS } from '@halloween/shared/monsters/kinds/ghost';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { PVP_DAMAGE } from '@halloween/shared/players/combat';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { GameSystem } from '../core/game-system';
import { SHOT_STEP } from './config/ranged';
import { GlaiveSystem } from './glaive-system';
import { bounceOff } from './helpers/bounce-off';
import { MirrorShieldSystem } from './mirror-shield-system';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { ShotState } from '@halloween/shared/protocol/state/world-state';
import type { HitEffects, HostileShot } from '../horde/types/hooks';
import type { Player } from '../players/player';
import type { Shot } from '../types/shot';

/**
 * Every bolt, arrow, gob, and monster shot in flight: firing, flying,
 * and hitting.
 */
export class ShotSystem extends GameSystem {
  /**
   * Thrown glaives on their way out and back.
   */
  readonly glaives = new GlaiveSystem(this._game);

  /**
   * Mirror Shields sending monster shots back.
   */
  readonly shields = new MirrorShieldSystem(this._game);

  /**
   * Every shot in flight.
   */
  private _shots: Shot[] = [];

  /**
   * The next shot id.
   */
  private _nextShotId = 1;

  /**
   * The next shot id.
   * @returns A new id.
   */
  nextId(): number {
    return this._nextShotId++;
  }

  /**
   * Puts a shot in flight.
   * @param shot What flies.
   */
  add(shot: Shot): void {
    this._shots.push(shot);
  }

  /**
   * A monster loosed something hostile (the horde's `shoot` hook).
   * @param x Where it is fired from (tiles across).
   * @param y Where it is fired from (tiles down).
   * @param angle Which way it flies (radians).
   * @param shot What flies.
   */
  fireHostile(x: number, y: number, angle: number, shot: HostileShot): void {
    this._shots.push({
      id: this._nextShotId++,
      x: x + Math.cos(angle) * 0.3,
      y: y + Math.sin(angle) * 0.3,
      angle,
      kind: shot.kind,
      left: shot.reach,
      height: shot.kind === 'arrow' ? this.world.map.elevationAt(x, y) + LEVEL_HEIGHT * 0.5 : Infinity,
      owner: null,
      damage: shot.damage,
      knockback: 0,
      speed: shot.speed,
      hostile: true,
      weapon: null,
      by: shot.by,
      land: shot.land,
    });
  }

  /**
   * Flies every bolt forward in small steps; it stops at the first solid
   * tile, rise in the ground above it, monster, or player (never its
   * shooter) it meets, or at the end of its range (see `fly`; glaives
   * see `GlaiveSystem.fly`).
   * @param dt Seconds since the last step.
   */
  stepShots(dt: number): void {
    this._shots = this._shots.filter((s: Shot): boolean => {
      if (s.glaive) {
        return this.glaives.fly(s, dt);
      }
      return this.fly(s, dt);
    });
  }

  /**
   * Flies one shot this step (see `stepShots`). A potion hits nothing on
   * the way (but a raised Mirror Shield can catch it); anything else
   * stops at walls and rising ground unless it phases through them or
   * bounces off, leaves fire behind if its weapon does, and hits the
   * first monster or player it meets (a Mirror Shield's sent-back shot
   * passes players by).
   * @param s The shot.
   * @param dt Seconds since the last step.
   * @returns Whether it's still in flight.
   */
  private fly(s: Shot, dt: number): boolean {
    let dx = Math.cos(s.angle);
    let dy = Math.sin(s.angle);
    for (let travel = s.speed * dt; travel > 0; travel -= SHOT_STEP) {
      const step = Math.min(SHOT_STEP, travel);
      s.x += dx * step;
      s.y += dy * step;
      s.left -= step;
      if (s.kind === 'potion') {
        if (s.hostile && this.shields.catchPotion(s)) {
          return true;
        }
        if (s.left <= 0) {
          if (s.hostile) {
            this._game.puddles.splash(s);
          } else {
            this.shields.splashBack(s);
          }
          return false;
        }
        continue;
      }
      if (s.left <= 0) {
        return false;
      }
      if ((!s.hostile || s.kind === 'arrow') && !s.phasing && this.blocked(s.x, s.y, s.height)) {
        if (!s.bounces) {
          return false;
        }
        s.bounces--;
        Object.assign(s, bounceOff(s.x, s.y, s.angle, step, (x: number, y: number): boolean => this.blocked(x, y, s.height)));
        dx = Math.cos(s.angle);
        dy = Math.sin(s.angle);
        continue;
      }
      this.leaveFire(s, step);
      const monster = !s.hostile && this.horde.targets().find((m): boolean => !s.struck?.includes(m.id) && Math.hypot(m.x - s.x, m.y - s.y) < MONSTER_RADIUS + 0.12);
      if (monster) {
        this.hitMonster(s, monster, s.x - dx, s.y - dy);
        if (!s.pierce) {
          return false;
        }
        s.pierce--;
        s.struck!.push(monster.id);
        continue;
      }
      const owner = s.reflected ? null : s.owner;
      const target = (owner || s.hostile) && [...this.players.values()].find((o: Player): boolean => o !== owner && !o.dead && Math.hypot(o.x - s.x, o.y - s.y) < PLAYER_RADIUS + 0.12);
      if (s.hostile && target) {
        if (this.shields.guards(target, s)) {
          this.shields.reflect(s, target);
          return true;
        }
        if (this._game.damage.hurt(target, s.damage, s.by, s.x - dx, s.y - dy) && s.kind === 'ecto') {
          target.slowUntil = this.world.time + GHOST_SLOW_SECONDS;
        }
        return false;
      }
      const player = owner && target;
      if (owner && player) {
        owner.protectedUntil = 0;
        if (this._game.damage.hurt(player, s.damage * PVP_DAMAGE, owner, s.x - dx, s.y - dy)) {
          this._game.damage.knock(player, s.x - dx, s.y - dy, s.knockback);
        }
        return false;
      }
    }
    return true;
  }

  /**
   * A player's (or turret's) shot lands on a monster: damage by kind
   * through the stats it was fired with, and every trick those stats
   * carry (a burn, a slow, a pin, a curse), credited to its shooter. A
   * kill with a weapon that banks a quick reload (Bone Rattler) banks one.
   * @param s The shot.
   * @param m The monster.
   * @param m.id Its id.
   * @param m.kind What it is.
   * @param fromX Where the hit comes from (tiles).
   * @param fromY Where the hit comes from (tiles).
   * @param extra More the hit does (a thrown glaive always hits on its tip).
   * @returns Whether it killed it.
   */
  hitMonster(s: Shot, m: { id: number; kind: MonsterKind }, fromX: number, fromY: number, extra: HitEffects<Player> = {}): boolean {
    const stats = s.stats ?? GEAR[s.weapon ?? 'blood-gun'].weapon!;
    this._game.spoils.killer = s.owner;
    const killed = this.horde.hit(m.id, damageTo(m.kind, stats, s.damage), fromX, fromY, this.world, s.knockback, { ...s.stats, ...extra, by: s.owner });
    this._game.spoils.killer = null;
    if (killed && s.owner && s.stats?.reloadOnKill) {
      s.owner.reloadBanked = true;
    }
    return killed;
  }

  /**
   * Whether a shot at (x, y) flying at `height` is stopped there: a solid
   * tile, or ground rising above it.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param height How high it flies.
   * @returns True when it can't go on.
   */
  blocked(x: number, y: number, height: number): boolean {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    return this.world.map.isSolid(tx, ty) || this.world.map.base(tx, ty) > height;
  }

  /**
   * Leaves a bit of fire on the ground every tile a Pyre Bow's arrow
   * flies (see `PatchSystem.fireTrail`).
   * @param s The shot.
   * @param step How far it just moved (tiles).
   */
  private leaveFire(s: Shot, step: number): void {
    if (!s.stats?.fireTrail || !s.owner) {
      return;
    }
    s.trail = (s.trail ?? 1) + step;
    if (s.trail >= 1) {
      s.trail = 0;
      this._game.patches.fireTrail(s.x, s.y, s.owner, s.stats);
    }
  }

  /**
   * Every shot in flight, as broadcast.
   * @returns Each shot as broadcast.
   */
  shotStates(): ShotState[] {
    return this._shots.map(({ id, x, y, angle, kind, left, land }: Shot): ShotState => ({
      id,
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      angle,
      kind,
      ...(land ? { lob: Math.round(Math.min(1, Math.max(0, 1 - left / land)) * 100) / 100 } : {}),
    }));
  }

  /**
   * Clears every shot in flight (shot ids keep counting).
   */
  reset(): void {
    this._shots = [];
    for (const p of this.players.values()) {
      p.thrown = false;
    }
  }
}
