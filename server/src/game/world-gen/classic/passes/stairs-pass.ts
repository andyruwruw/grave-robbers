// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { DIRS, EXTRA_STAIRS_CHANCE, RAMP_GROUND, SCENERY } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Point } from '../../types/geometry';

/**
 * Stairs across level changes: enough to reach (and leave) every open
 * area, extras when asked, mended after scenery lands, and trees where
 * nothing can reach.
 */
export class StairsPass extends ClassicPass {
  /**
   * Adds stairs until every open tile can be reached from the spawns and
   * left again: at the foot of a level change between a reachable tile and
   * an unreachable one (or one that can't get back and one that can). The
   * tiles at either end of new stairs become dirt, so nothing grows there.
   * @param spawns Where the round trips start.
   */
  connect(spawns: Point[]): void {
    const starts = spawns.map(([x, y]): { x: number; y: number } => ({ x, y }));
    for (let round = 0; round < 60; round++) {
      const ok = this.map.roundTrip(starts);
      const fixes: [Point, Point][] = [];
      for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
        for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
          if (!RAMP_GROUND.has(this.map.get(tx, ty))) {
            continue;
          }
          for (const [dx, dy] of DIRS) {
            const ux = tx + dx;
            const uy = ty + dy;
            const back: Point = [tx - dx, ty - dy];
            if (
              this.map.level(ux, uy) === this.map.level(tx, ty) + 1
              && !this.map.isSolid(ux, uy)
              && ok[ty * MAP_WIDTH + tx] !== ok[uy * MAP_WIDTH + ux]
              && this.map.isFoot(...back, this.map.base(tx, ty))
              && this.fitsStairs(tx, ty, [dx, dy])
            ) {
              fixes.push([[tx, ty], [ux, uy]]);
            }
          }
        }
      }
      if (fixes.length === 0) {
        return;
      }
      const [[tx, ty], [ux, uy]] = fixes[Math.floor(this.rand() * fixes.length)];
      this.map.set(tx, ty, 'stairs');
      for (const [px, py] of [[ux, uy], [tx * 2 - ux, ty * 2 - uy]]) {
        if (this.map.get(px, py) === 'grass') {
          this.map.set(px, py, 'path');
        }
      }
    }
  }

  /**
   * More stairs than reaching everything needs, so level changes can be
   * crossed in more places: each spot where stairs would fit gets them with
   * a chance set by the `stairs` knob, never right beside other stairs.
   */
  extraStairs(): void {
    if (this.gen.stairs <= 0) {
      return;
    }
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (!RAMP_GROUND.has(this.map.get(tx, ty)) || this.rand() >= this.gen.stairs * EXTRA_STAIRS_CHANCE) {
          continue;
        }
        const crowded = [...DIRS, [1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]): boolean => this.map.get(tx + dx, ty + dy) === 'stairs');
        const dir = DIRS.find(([dx, dy]): boolean =>
          this.map.level(tx + dx, ty + dy) === this.map.level(tx, ty) + 1
          && !this.map.isSolid(tx + dx, ty + dy)
          && this.map.isFoot(tx - dx, ty - dy, this.map.base(tx, ty))
          && this.fitsStairs(tx, ty, [dx, dy]));
        if (!crowded && dir) {
          this.map.set(tx, ty, 'stairs');
          for (const [px, py] of [[tx + dir[0], ty + dir[1]], [tx - dir[0], ty - dir[1]]]) {
            if (this.map.get(px, py) === 'grass') {
              this.map.set(px, py, 'path');
            }
          }
        }
      }
    }
  }

  /**
   * Whether stairs here would climb that way with open floor at their foot,
   * without spoiling the foot of any stairs beside them.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param dir The way the stairs should climb.
   * @returns Whether they fit.
   */
  private fitsStairs(tx: number, ty: number, dir: Point): boolean {
    const was = this.map.get(tx, ty);
    this.map.set(tx, ty, 'stairs');
    const up = this.map.rampUp(tx, ty);
    const fits = up !== null && up[0] === dir[0] && up[1] === dir[1]
      && DIRS.every(([dx, dy]): boolean => this.map.get(tx + dx, ty + dy) !== 'stairs' || this.stairsOk(tx + dx, ty + dy));
    this.map.set(tx, ty, was);
    return fits;
  }

  /**
   * Whether stairs climb exactly one level with open, flat floor at their
   * foot (not a wall, a drop, or more stairs).
   * @param tx The stairs' column.
   * @param ty The stairs' row.
   * @returns Whether they work.
   */
  private stairsOk(tx: number, ty: number): boolean {
    const up = this.map.rampUp(tx, ty);
    return up !== null
      && this.map.level(tx + up[0], ty + up[1]) === this.map.level(tx, ty) + 1
      && this.map.isFoot(tx - up[0], ty - up[1], this.map.base(tx, ty));
  }

  /**
   * Mends stairs that lost their head or foot to scenery (clearing it), and
   * turns stairs that still have no open floor below them back into path,
   * until all of them do.
   */
  tidyStairs(): void {
    for (let changed = true; changed;) {
      changed = false;
      for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
        for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
          if (this.map.get(tx, ty) !== 'stairs' || this.stairsOk(tx, ty)) {
            continue;
          }
          if (!this.mendStairs(tx, ty)) {
            this.map.set(tx, ty, 'path');
          }
          changed = true;
        }
      }
    }
  }

  /**
   * Clears scenery from the tile above and the tile below stairs, in the
   * first direction where that leaves them climbing one level from open
   * floor.
   * @param tx The stairs' column.
   * @param ty The stairs' row.
   * @returns Whether the stairs work now.
   */
  private mendStairs(tx: number, ty: number): boolean {
    const level = this.map.level(tx, ty);
    const clearable = ([px, py]: Point): boolean => !this.map.isSolid(px, py) || SCENERY.has(this.map.get(px, py));
    for (const [dx, dy] of DIRS) {
      const head: Point = [tx + dx, ty + dy];
      const foot: Point = [tx - dx, ty - dy];
      if (
        this.map.level(...head) !== level + 1 || this.map.level(...foot) !== level
        || this.map.get(...foot) === 'stairs' || !clearable(head) || !clearable(foot)
      ) {
        continue;
      }
      for (const p of [head, foot]) {
        if (SCENERY.has(this.map.get(...p))) {
          this.map.set(...p, 'path');
        }
      }
      if (this.stairsOk(tx, ty)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Turns every open tile that can't be reached from the spawns and left
   * again into a tree.
   * @param spawns Where the round trips start.
   */
  fillUnreachable(spawns: Point[]): void {
    const ok = this.map.roundTrip(spawns.map(([x, y]): { x: number; y: number } => ({ x, y })));
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (!this.map.isSolid(tx, ty) && !ok[ty * MAP_WIDTH + tx]) {
          this.map.set(tx, ty, 'tree');
        }
      }
    }
  }
}
