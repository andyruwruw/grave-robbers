// Packages
import { GATHERABLE } from '@halloween/shared/loot/gathering';
import {
  DIG_HITS,
  MOUND_REFILL_MIN,
  MOUND_REFILL_SPREAD,
  ROBBABLE,
  ROB_HITS,
  ROB_REFILL,
} from '@halloween/shared/loot/graves';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { structureHp } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { STUMP_ROT_MIN, STUMP_ROT_SPREAD } from '../config/growth';
import { CRYPT_SPAN, PUMPKIN_HITS } from '../config/loot';
import { WorldFeature } from '../world-feature';

/**
 * The map's natural resources being worn down: trees, rocks, and hedges
 * gathered, graves dug, landmarks robbed, pumpkins burst, lamps broken,
 * and chests opened.
 */
export class ResourceNodes extends WorldFeature {
  /**
   * One hit on a gatherable tile. Returns true when that was the last and
   * the tile comes down (the caller hands out all of it at once).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether the tile came down.
   */
  gather(tx: number, ty: number): boolean {
    const g = GATHERABLE[this.map.get(tx, ty)];
    if (!g) {
      return false;
    }
    const i = ty * this.map.width + tx;
    const remaining = (this.timers.nodes.get(i) ?? g.hits) - 1;
    if (remaining > 0) {
      this.timers.nodes.set(i, remaining);
    } else {
      this.timers.nodes.delete(i);
      this.map.set(tx, ty, g.leaves);
      if (g.leaves === 'stump') {
        this.timers.regrow.set(i, this.clock.now + STUMP_ROT_MIN + Math.random() * STUMP_ROT_SPREAD);
      }
      return true;
    }
    return false;
  }

  /**
   * One dig at a robbable landmark (a statue, crypt, or mausoleum). A
   * crypt's walls have gaps, so every crypt tile within CRYPT_SPAN counts as
   * the same crypt; a mausoleum is its own joined walls. Returns
   * 'done' on the dig that robs it (a crypt or mausoleum is marked robbed as
   * a whole), 'robbed' if there's nothing left to take yet, else 'dug'.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns 'done', 'robbed', or 'dug'.
   */
  rob(tx: number, ty: number): 'dug' | 'done' | 'robbed' {
    const i = ty * this.map.width + tx;
    if ((this.timers.robbed.get(i) ?? -Infinity) > this.clock.now) {
      return 'robbed';
    }
    const left = (this.timers.nodes.get(i) ?? ROB_HITS) - 1;
    if (left > 0) {
      this.timers.nodes.set(i, left);
      return 'dug';
    }
    this.timers.nodes.delete(i);
    const tile = this.map.get(tx, ty);
    const until = this.clock.now + ROB_REFILL;
    const stack = [i];
    this.timers.robbed.set(i, until);
    if (tile === 'crypt') {
      for (let y = Math.max(0, ty - CRYPT_SPAN); y <= Math.min(this.map.height - 1, ty + CRYPT_SPAN); y++) {
        for (let x = Math.max(0, tx - CRYPT_SPAN); x <= Math.min(this.map.width - 1, tx + CRYPT_SPAN); x++) {
          if (this.map.get(x, y) === 'crypt') {
            this.timers.robbed.set(y * this.map.width + x, until);
            this.timers.nodes.delete(y * this.map.width + x);
          }
        }
      }
      stack.length = 0;
    }
    while (stack.length > 0 && tile !== 'statue') {
      const at = stack.pop()!;
      const ax = at % this.map.width;
      const ay = Math.floor(at / this.map.width);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = (ay + dy) * this.map.width + ax + dx;
        if (this.map.get(ax + dx, ay + dy) === tile && (this.timers.robbed.get(n) ?? -Infinity) < until) {
          this.timers.robbed.set(n, until);
          this.timers.nodes.delete(n);
          stack.push(n);
        }
      }
    }
    return 'done';
  }

  /**
   * Knocks down a lamp post (a landmark), leaving the floor most of its
   * neighbors have.
   * @param tx The lamp's tile column.
   * @param ty The lamp's tile row.
   */
  breakLamp(tx: number, ty: number): void {
    const floors = ['path', 'cobble', 'flagstone', 'grass'] as const;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => this.map.get(tx + dx, ty + dy));
    const floor = floors.reduce((best, f) => (near.filter((n) => n === f).length > near.filter((n) => n === best).length ? f : best), 'grass' as (typeof floors)[number]);
    this.map.set(tx, ty, floor);
  }

  /**
   * One dig at a grave. On the last one the stone sinks away and leaves a
   * mound, which a new gravestone rises from in a few minutes. Returns
   * whether it was dug up.
   * @param tx The grave's tile column.
   * @param ty The grave's tile row.
   * @returns Whether it was dug up.
   */
  dig(tx: number, ty: number): boolean {
    const i = ty * this.map.width + tx;
    const left = (this.timers.nodes.get(i) ?? DIG_HITS) - 1;
    if (left > 0) {
      this.timers.nodes.set(i, left);
      return false;
    }
    this.timers.nodes.delete(i);
    this.map.set(tx, ty, 'mound');
    this.timers.mounds.set(i, this.clock.now + MOUND_REFILL_MIN + Math.random() * MOUND_REFILL_SPREAD);
    return true;
  }

  /**
   * One hit on a pumpkin. Returns whether it burst (leaving grass).
   * @param tx The pumpkin's tile column.
   * @param ty The pumpkin's tile row.
   * @returns Whether it burst.
   */
  hitPumpkin(tx: number, ty: number): boolean {
    const i = ty * this.map.width + tx;
    const left = (this.timers.nodes.get(i) ?? PUMPKIN_HITS) - 1;
    if (left > 0) {
      this.timers.nodes.set(i, left);
      return false;
    }
    this.timers.nodes.delete(i);
    this.map.set(tx, ty, 'grass');
    return true;
  }

  /**
   * How much of a tile is left before it breaks, 0 to 1: a structure's hp,
   * what's left of a tree, rock, or hedge, a grave's digs, or a pumpkin's
   * hits. 0 when there's nothing there to break.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns What is left, 0 to 1.
   */
  health(tx: number, ty: number): number {
    const i = ty * this.map.width + tx;
    const tile = this.map.get(tx, ty);
    const s = this.structures.get(i);
    const full = s && isStructure(tile) ? Math.max(s.hp, structureHp(tile, s.level ?? 0))
      : GATHERABLE[tile]?.hits ?? (tile === 'tombstone' || tile === 'cross' ? DIG_HITS : tile === 'pumpkin' ? PUMPKIN_HITS : ROBBABLE.has(tile) ? ROB_HITS : 0);
    if (ROBBABLE.has(tile) && (this.timers.robbed.get(i) ?? -Infinity) > this.clock.now) {
      return 0;
    }
    if (!full) {
      return 0;
    }
    return Math.round(Math.max(0, (s ? s.hp : this.timers.nodes.get(i) ?? full) / full) * 100) / 100;
  }

  /**
   * Breaks a chest open, leaving grass; the caller spills what was inside.
   * @param tx The chest's tile column.
   * @param ty The chest's tile row.
   */
  openChest(tx: number, ty: number): void {
    this.map.set(tx, ty, 'grass');
  }
}
