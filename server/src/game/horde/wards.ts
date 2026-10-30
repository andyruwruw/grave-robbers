// Packages
import {
  EFFIGY_RADIUS,
  EFFIGY_SLOW,
  OBELISK_RADIUS,
  SOUL_CAGE_COOLDOWN,
  SOUL_CAGE_RADIUS,
} from '@halloween/shared/structures/occult';
import { BARBED_SLOW } from '@halloween/shared/structures/traps';

// Local Imports
import { HordePart } from './horde-part';

// Types
import type { World } from '../world/world';
import type { Monster } from './monsters/monster';
import type { Target } from './types/hooks';

/**
 * Where a ward reaches: its center and radius (tiles).
 */
interface WardReach {
  /**
   * Center (tiles).
   */
  x: number;

  /**
   * Center (tiles).
   */
  y: number;

  /**
   * How far its curse reaches (tiles).
   */
  radius: number;
}

/**
 * What players build against the horde that isn't a wall: effigies slow
 * walkers, obelisks curse them, soul cages catch ghosts, and barbed wire
 * holds walkers back.
 */
export class Wards<P extends Target> extends HordePart<P> {
  /**
   * This tick's effigies: where, and how far their curse reaches.
   */
  private _effigies: WardReach[] = [];

  /**
   * This tick's obelisks: where, and how far their curse reaches.
   */
  private _obelisks: WardReach[] = [];

  /**
   * When each soul cage (by tile index) may catch its next ghost.
   */
  private readonly _cageReady = new Map<number, number>();

  /**
   * Finds this tick's effigies and obelisks.
   * @param world The world.
   */
  update(world: World): void {
    this._effigies = world.structureQueries.structuresOf('effigy').map(({ tx, ty }): WardReach => ({ x: tx + 0.5, y: ty + 0.5, radius: EFFIGY_RADIUS + 0.5 * world.structureQueries.level(tx, ty) }));
    this._obelisks = world.structureQueries.structuresOf('obelisk').map(({ tx, ty }): WardReach => ({ x: tx + 0.5, y: ty + 0.5, radius: OBELISK_RADIUS + 0.5 * world.structureQueries.level(tx, ty) }));
  }

  /**
   * Soul cages pull in and destroy a ghost that drifts close enough, each
   * one every SOUL_CAGE_COOLDOWN seconds.
   * @param world The world.
   */
  catchGhosts(world: World): void {
    for (const { tx, ty } of world.structureQueries.structuresOf('soul-cage')) {
      const i = ty * world.map.width + tx;
      if (world.time < (this._cageReady.get(i) ?? 0)) {
        continue;
      }
      const reach = SOUL_CAGE_RADIUS + 0.5 * world.structureQueries.level(tx, ty);
      const ghost = [...this.roster.values()].find((m: Monster<P>): boolean => !m.hasBody && Math.hypot(m.x - (tx + 0.5), m.y - (ty + 0.5)) <= reach);
      if (ghost) {
        this._cageReady.set(i, world.time + SOUL_CAGE_COOLDOWN);
        this._horde.kill(ghost, Math.atan2(ty + 0.5 - ghost.y, tx + 0.5 - ghost.x));
      }
    }
  }

  /**
   * How much the ground holds a walker back: barbed wire under it, and
   * the curse of any effigy close by.
   * @param m The walker.
   * @param world The world.
   * @returns The speed multiplier.
   */
  drag(m: { x: number; y: number }, world: World): number {
    let slow = world.map.get(Math.floor(m.x), Math.floor(m.y)) === 'barbed-wire' ? BARBED_SLOW : 1;
    if (this._effigies.some((e): boolean => Math.hypot(e.x - m.x, e.y - m.y) <= e.radius)) {
      slow *= EFFIGY_SLOW;
    }
    return slow;
  }

  /**
   * Whether a monster stands inside an obelisk's curse.
   * @param m The monster.
   * @returns True when cursed.
   */
  cursed(m: { x: number; y: number }): boolean {
    return this._obelisks.some((o): boolean => Math.hypot(o.x - m.x, o.y - m.y) <= o.radius);
  }
}
