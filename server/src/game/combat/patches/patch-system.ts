// Local Imports
import { GameSystem } from '../../core/game-system';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { PatchState } from '@halloween/shared/protocol/state/world-state';
import type { Player } from '../../players/player';
import type { Patch } from './types/patch';

/**
 * Patches of ground infused weapons leave (see `docs/infusions.md`):
 * scorched ground that keeps listed kinds burning (Hellfire Hammer), fire
 * trails that set anything with a body burning (Pyre Bow), and incense
 * that ghosts won't enter, hurts demons, and can heal players (Censer
 * Flail, Thurible of Judgment). Overlapping patches never stack.
 */
export class PatchSystem extends GameSystem {
  /**
   * Every patch on the ground, oldest first.
   */
  patches: Patch[] = [];

  /**
   * The next patch id.
   */
  private _nextId = 1;

  /**
   * Scorches the ground under a monster a hit landed on (the weapon's
   * `scorch`, burning with its `burn`). Nothing without both.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param by The wielder.
   * @param stats The weapon's stats (`p.weapon()`).
   */
  scorch(x: number, y: number, by: Player, stats: WeaponStats): void {
    if (stats.scorch && stats.burn) {
      this.lay({ kind: 'scorch', x, y, radius: stats.scorch.radius, by, burn: stats.burn, kinds: stats.scorch.kinds, rate: 0, heal: 0 }, stats.scorch.seconds);
    }
  }

  /**
   * Leaves a bit of fire trail where an arrow is (the weapon's
   * `fireTrail`, burning with its `burn`); call it once per tile flown.
   * Nothing without both.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param by The archer.
   * @param stats The weapon's stats (`p.weapon()`).
   */
  fireTrail(x: number, y: number, by: Player, stats: WeaponStats): void {
    if (stats.fireTrail && stats.burn) {
      this.lay({ kind: 'fire', x, y, radius: stats.fireTrail.radius, by, burn: stats.burn, kinds: null, rate: 0, heal: 0 }, stats.fireTrail.seconds);
    }
  }

  /**
   * Leaves a cloud of incense where a swing lands (the weapon's
   * `incense`); past its `max` clouds for this player, the oldest goes.
   * @param x Where (tiles).
   * @param y Where (tiles).
   * @param by The wielder.
   * @param stats The weapon's stats (`p.weapon()`).
   */
  incense(x: number, y: number, by: Player, stats: WeaponStats): void {
    const incense = stats.incense;
    if (!incense) {
      return;
    }
    this.patches.push({ id: this._nextId++, kind: 'incense', x, y, radius: incense.radius, at: this.world.time, until: this.world.time + incense.seconds, by, burn: null, kinds: null, rate: incense.rate, heal: incense.heal });
    const mine = this.patches.filter((q: Patch): boolean => q.kind === 'incense' && q.by === by);
    const gone = new Set(mine.slice(0, Math.max(0, mine.length - incense.max)));
    this.patches = this.patches.filter((q: Patch): boolean => !gone.has(q));
  }

  /**
   * Lays a burning patch, or refreshes the same player's patch of the same
   * kind that's already about there.
   * @param patch The patch, but for its id and times.
   * @param seconds How long it lasts.
   */
  private lay(patch: Omit<Patch, 'id' | 'at' | 'until'>, seconds: number): void {
    const now = this.world.time;
    const near = this.patches.find((q: Patch): boolean => q.kind === patch.kind && q.by === patch.by && Math.hypot(q.x - patch.x, q.y - patch.y) < q.radius * 0.5);
    if (near) {
      near.at = now;
      near.until = now + seconds;
      return;
    }
    this.patches.push({ ...patch, id: this._nextId++, at: now, until: now + seconds });
  }

  /**
   * Patches at work: monsters in a burning patch keep burning, demons in
   * incense take its damage and players in it heal (once each, however
   * many clouds overlap), and ghosts are told where the incense is.
   * @param dt Seconds since the last step.
   */
  stepPatches(dt: number): void {
    const now = this.world.time;
    this.patches = this.patches.filter((q: Patch): boolean => now < q.until);
    const afflictions = this.horde.afflictions;
    for (const m of this.horde.targets()) {
      let incense: Patch | null = null;
      for (const q of this.patches) {
        if (Math.hypot(m.x - q.x, m.y - q.y) > q.radius) {
          continue;
        }
        if (q.burn && (!q.kinds || q.kinds.includes(m.kind))) {
          afflictions.afflict(m.id, { burn: q.burn, by: q.by }, this.world);
        }
        if (m.kind === 'demon' && q.rate > (incense?.rate ?? 0)) {
          incense = q;
        }
      }
      if (incense) {
        afflictions.drain(m.id, incense.rate * dt, incense.by);
      }
    }
    for (const p of this.players.values()) {
      const heal = p.dead ? 0 : Math.max(0, ...this.patches.filter((q: Patch): boolean => q.heal > 0 && Math.hypot(p.x - q.x, p.y - q.y) <= q.radius).map((q: Patch): number => q.heal));
      if (heal > 0) {
        p.hp += Math.max(0, Math.min(heal * dt, p.healCap() - p.hp));
      }
    }
    afflictions.setIncense(this.patches.filter((q: Patch): boolean => q.kind === 'incense').map(({ x, y, radius }): { x: number; y: number; radius: number } => ({ x, y, radius })));
  }

  /**
   * Every patch, as broadcast.
   * @returns Each patch as broadcast.
   */
  patchStates(): PatchState[] {
    const now = this.world.time;
    return this.patches.map(({ id, kind, x, y, radius, at, until }): PatchState => ({ id, kind, x, y, radius, life: Math.round(((until - now) / (until - at)) * 100) / 100 }));
  }

  /**
   * Clears every patch (a new world).
   */
  reset(): void {
    this.patches = [];
    this.horde.afflictions.setIncense([]);
  }
}
