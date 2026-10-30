// Packages
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { PLAYER_RADIUS } from '@halloween/shared/players/movement';

// Local Imports
import { GameSystem } from '../core/game-system';
import { LIFT_TIMEOUT } from './config/tv-hand';

// Types
import type { LiftTarget } from '@halloween/shared/protocol/tv-tools';
import type { Player } from '../players/player';

/**
 * The TV's mouse: lifting players and monsters, and the light its right
 * button carries.
 */
export class TvHandSystem extends GameSystem {
  /**
   * What the TV's mouse holds, and when it last moved it.
   */
  private _liftHeld: { target: LiftTarget; at: number } | null = null;

  /**
   * The light the TV's right mouse button carries, or null.
   */
  cursorLight: { x: number; y: number } | null = null;

  /**
   * The TV's mouse holding a player or monster up at (x, y), or letting go
   * of it there. Dropped somewhere it can't stand (inside a wall, off the
   * map), it lands on the nearest spot that works.
   * @param target What the mouse holds.
   * @param x Where the mouse is (tiles across).
   * @param y Where the mouse is (tiles down).
   * @param drop Whether the mouse let go.
   */
  lift(target: LiftTarget, x: number, y: number, drop: boolean): void {
    if (!this.settings.tvDrag || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    const held = this._liftHeld?.target;
    if (held && (held.kind !== target.kind || held.id !== target.id)) {
      this.release();
    }
    const px = Math.min(this.world.map.width - 0.01, Math.max(0, x));
    const py = Math.min(this.world.map.height - 0.01, Math.max(0, y));
    if (target.kind === 'player') {
      const p = [...this.players.values()].find((q: Player): boolean => q.id === target.id);
      if (!p || p.dead) {
        this._liftHeld = null;
        return;
      }
      p.x = px;
      p.y = py;
      p.lifted = true;
      p.panic = null;
      p.knockUntil = 0;
    } else {
      if (!this.horde.place(target.id, px, py)) {
        this._liftHeld = null;
        this.horde.liftedId = null;
        return;
      }
      this.horde.liftedId = target.id;
    }
    this._liftHeld = { target, at: this.world.time };
    if (drop) {
      this.release();
    }
  }

  /**
   * Lets go of whatever the TV's mouse holds, landing it on the nearest
   * spot it can stand.
   */
  release(): void {
    const held = this._liftHeld?.target;
    this._liftHeld = null;
    this.horde.liftedId = null;
    if (!held) {
      return;
    }
    if (held.kind === 'player') {
      const p = [...this.players.values()].find((q: Player): boolean => q.id === held.id);
      if (p) {
        p.lifted = false;
        Object.assign(p, this.landing(p.x, p.y, PLAYER_RADIUS, false));
      }
    } else {
      const m = this.horde.find(held.id);
      if (m) {
        const spot = this.landing(m.x, m.y, MONSTER_RADIUS, m.kind !== 'ghost');
        this.horde.place(held.id, spot.x, spot.y);
      }
    }
  }

  /**
   * The nearest place to (x, y) a walker of half-size `r` can stand: right
   * there if nothing solid overlaps it, else the closest open tile's
   * center (never a door for monsters, which can't open them).
   * @param x Where it was let go (tiles across).
   * @param y Where it was let go (tiles down).
   * @param r The walker's half-size (tiles).
   * @param monster Whether a monster lands (it never lands on a door).
   * @returns The spot.
   */
  private landing(x: number, y: number, r: number, monster: boolean): { x: number; y: number } {
    const map = this.world.map;
    const open = (tx: number, ty: number): boolean =>
      tx >= 0 && ty >= 0 && tx < this.world.map.width && ty < this.world.map.height && !map.isSolid(tx, ty) && !(monster && map.get(tx, ty) === 'door');
    const fits = [Math.floor(x - r), Math.floor(x + r)].every((tx: number): boolean =>
      [Math.floor(y - r), Math.floor(y + r)].every((ty: number): boolean => open(tx, ty) && map.base(tx, ty) === map.base(Math.floor(x), Math.floor(y))));
    if (fits) {
      return { x, y };
    }
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (let ty = 0; ty < this.world.map.height; ty++) {
      for (let tx = 0; tx < this.world.map.width; tx++) {
        const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
        if (d < bestD && open(tx, ty)) {
          best = { x: tx + 0.5, y: ty + 0.5 };
          bestD = d;
        }
      }
    }
    return best ?? { x, y };
  }

  /**
   * Where the light carried by the TV's right mouse button is, or null once
   * it's let go.
   * @param at Where it is (tiles), or null once it's let go.
   */
  setCursorLight(at: { x: number; y: number } | null): void {
    const ok = at && this.settings.tvLight && Number.isFinite(at.x) && Number.isFinite(at.y);
    this.cursorLight = ok ? { x: Math.min(this.world.map.width, Math.max(0, at.x)), y: Math.min(this.world.map.height, Math.max(0, at.y)) } : null;
    this.horde.cursorLight = this.cursorLight;
  }

  /**
   * Drops whatever the TV's mouse holds once it's gone quiet too long.
   */
  checkTimeout(): void {
    if (this._liftHeld && this.world.time - this._liftHeld.at > LIFT_TIMEOUT) {
      this.release();
    }
  }

  /**
   * Whether the TV's mouse holds something.
   * @returns True while it holds something.
   */
  get holding(): boolean {
    return this._liftHeld !== null;
  }
}
