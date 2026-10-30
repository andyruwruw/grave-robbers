// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { CHASM_DEATH, FALL_DAMAGE, FALL_MIN } from '@halloween/shared/players/health';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';
import { walk, walkSpeed } from '@halloween/shared/players/walk';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { GameSystem } from '../core/game-system';
import { MONSTER_SHOVE_SHARE } from './config/movement';

// Types
import type { Player } from '../players/player';

/**
 * Players walking, being knocked about, and keeping out of each other
 * and of monsters.
 */
export class MovementSystem extends GameSystem {
  /**
   * Walks a player along their joystick (or their panic), turns them to
   * their aim, and carries out knockback, into a chasm or off a ledge.
   * @param p The player.
   * @param dt Seconds since the last step.
   * @param time The game clock (seconds).
   */
  walk(p: Player, dt: number, time: number): void {
    const steer = p.panic ? this._game.panics.panicSteer(p) : { x: p.inputX, y: p.inputY };
    p.moving = steer.x !== 0 || steer.y !== 0;
    if (p.moving) {
      p.facing = Math.atan2(steer.y, steer.x);
      const speed = walkSpeed(this.world.map, p.x, p.y, { slowed: time < p.slowUntil, blocking: p.blocking, bracing: time < p.braceUntil, reloading: p.reloadUntil !== null, armor: p.bag.equipped.armor?.kind ?? null });
      this.move(p, steer.x * speed * dt, steer.y * speed * dt);
    }
    if (p.aimX !== 0 || p.aimY !== 0) {
      p.facing = Math.atan2(p.aimY, p.aimX);
    }
    if (time < p.knockUntil) {
      const before = this.world.map.elevationAt(p.x, p.y);
      this.move(p, p.knockX * dt, p.knockY * dt, true);
      const drop = before - this.world.map.elevationAt(p.x, p.y);
      if (this.world.map.get(Math.floor(p.x), Math.floor(p.y)) === 'chasm') {
        this._game.life.kill(p, CHASM_DEATH);
      } else if (drop >= FALL_MIN) {
        this._game.damage.hurt(p, FALL_DAMAGE * Math.round(drop / LEVEL_HEIGHT), 'a fall');
      }
    }
  }

  /**
   * Walks a player by (dx, dy), stopping at walls and ledges (see `walk`).
   * @param p The player.
   * @param dx How far across (tiles).
   * @param dy How far down (tiles).
   * @param intoChasm Whether it may carry them into a chasm (knockback
   *   does).
   */
  private move(p: Player, dx: number, dy: number, intoChasm = false): void {
    const next = walk(this.world.map, p.x, p.y, dx, dy, intoChasm);
    p.x = next.x;
    p.y = next.y;
  }

  /**
   * Keeps bodies from overlapping. A player and a zombie or vampire that
   * touch are pushed apart with the monster taking most of it (so walking
   * into one shoves it along); two players split it evenly. Ghosts and the
   * dead pass through.
   */
  separateBodies(): void {
    const living = [...this.players.values()].filter((p: Player): boolean => !p.dead);
    const apart = (ax: number, ay: number, bx: number, by: number, min: number): { nx: number; ny: number; overlap: number } | null => {
      const dx = bx - ax;
      const dy = by - ay;
      const d = Math.hypot(dx, dy);
      if (d >= min) {
        return null;
      }
      const angle = d > 0 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
      return { nx: Math.cos(angle), ny: Math.sin(angle), overlap: min - d };
    };
    for (const p of living) {
      for (const m of this.horde.bodies()) {
        const hit = apart(p.x, p.y, m.x, m.y, PLAYER_RADIUS + MONSTER_RADIUS);
        if (hit) {
          this.horde.shove(m.id, hit.nx * hit.overlap * MONSTER_SHOVE_SHARE, hit.ny * hit.overlap * MONSTER_SHOVE_SHARE, this.world);
          this.move(p, -hit.nx * hit.overlap * (1 - MONSTER_SHOVE_SHARE), -hit.ny * hit.overlap * (1 - MONSTER_SHOVE_SHARE));
        }
      }
    }
    for (let i = 0; i < living.length; i++) {
      for (let j = i + 1; j < living.length; j++) {
        const a = living[i];
        const b = living[j];
        const hit = apart(a.x, a.y, b.x, b.y, PLAYER_RADIUS * 2);
        if (hit) {
          this.move(a, -hit.nx * hit.overlap / 2, -hit.ny * hit.overlap / 2);
          this.move(b, hit.nx * hit.overlap / 2, hit.ny * hit.overlap / 2);
        }
      }
    }
  }
}
