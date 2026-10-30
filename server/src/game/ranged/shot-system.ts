// Packages
import { damageTo } from '@halloween/shared/gear/damage-to';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { GHOST_SLOW_SECONDS } from '@halloween/shared/monsters/kinds/ghost';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { PVP_DAMAGE } from '@halloween/shared/players/combat';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';
import { MIRROR_RADIUS } from '@halloween/shared/structures/occult';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { GameSystem } from '../core/game-system';
import { SHOT_STEP } from './config/ranged';

// Types
import type { ShotState } from '@halloween/shared/protocol/state/world-state';
import type { HostileShot } from '../horde/types/hooks';
import type { Player } from '../players/player';
import type { Shot } from '../types/shot';

/**
 * Every bolt, arrow, gob, and monster shot in flight: firing, flying,
 * and hitting.
 */
export class ShotSystem extends GameSystem {
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
   * shooter) it meets, or at the end of its range.
   * @param dt Seconds since the last step.
   */
  stepShots(dt: number): void {
    const mirrors = this.world.structureQueries.structuresOf('mirror').map(({ tx, ty }): { x: number; y: number } => ({ x: tx + 0.5, y: ty + 0.5 }));
    this._shots = this._shots.filter((s: Shot): boolean => {
      if (s.hostile && mirrors.some((m): boolean => Math.hypot(m.x - s.x, m.y - s.y) <= MIRROR_RADIUS)) {
        if (s.kind === 'potion') {
          this.outbox.events.push({ t: 'splash', x: s.x, y: s.y });
          return false;
        }
        s.hostile = false;
        s.angle += Math.PI;
        s.left = Math.max(s.left, 8);
        s.height = Infinity;
      }
      const dx = Math.cos(s.angle);
      const dy = Math.sin(s.angle);
      for (let travel = s.speed * dt; travel > 0; travel -= SHOT_STEP) {
        const step = Math.min(SHOT_STEP, travel);
        s.x += dx * step;
        s.y += dy * step;
        s.left -= step;
        if (s.kind === 'potion') {
          if (s.left <= 0) {
            this._game.puddles.splash(s);
            return false;
          }
          continue;
        }
        const walled = !s.hostile || s.kind === 'arrow';
        if (s.left <= 0 || (walled && (this.world.map.isSolid(Math.floor(s.x), Math.floor(s.y)) || this.world.map.base(Math.floor(s.x), Math.floor(s.y)) > s.height))) {
          return false;
        }
        const monster = !s.hostile && this.horde.targets().find((m): boolean => !s.struck?.includes(m.id) && Math.hypot(m.x - s.x, m.y - s.y) < MONSTER_RADIUS + 0.12);
        if (monster) {
          this._game.spoils.killer = s.owner;
          this.horde.hit(monster.id, damageTo(monster.kind, GEAR[s.weapon ?? 'blood-gun'].weapon!, s.damage), s.x - dx, s.y - dy, this.world, s.knockback);
          this._game.spoils.killer = null;
          if (!s.pierce) {
            return false;
          }
          s.pierce--;
          s.struck!.push(monster.id);
          continue;
        }
        const owner = s.owner;
        const target = (owner || s.hostile) && [...this.players.values()].find((o: Player): boolean => o !== owner && !o.dead && Math.hypot(o.x - s.x, o.y - s.y) < PLAYER_RADIUS + 0.12);
        if (s.hostile && target) {
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
    });
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
  }
}
