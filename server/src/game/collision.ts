// Packages
import { PASSABLE, STEP_UP } from '@halloween/shared/world';

// Types
import type { WorldMap } from '@halloween/shared/world';

/**
 * Whether a tile stops this mover.
 */
export type Blocked = (tx: number, ty: number) => boolean;

/**
 * Tiles that stop a walker of half-size `r` standing at (x, y): solid ones
 * (except trees, which only slow it down), and ones whose floor is more than a step above it (it can always drop
 * down). It stands as high as the highest ground under any part of it, so
 * it only drops off a ledge once it has stepped clear of it. `extra`
 * blocks more (doors, for monsters).
 */
export function walkerBlocked(map: WorldMap, x: number, y: number, r: number, extra?: Blocked): Blocked {
  const e = r - 0.002;
  const stand = Math.max(
    map.elevationAt(x, y),
    map.elevationAt(x - e, y - e),
    map.elevationAt(x + e, y - e),
    map.elevationAt(x - e, y + e),
    map.elevationAt(x + e, y + e),
  );
  const reach = stand + STEP_UP;
  return (tx: number, ty: number): boolean =>
    (map.isSolid(tx, ty) && !PASSABLE.has(map.get(tx, ty))) || map.base(tx, ty) > reach || (extra?.(tx, ty) ?? false);
}

/**
 * Whether a square hitbox of half-size `r` centered at (x, y) overlaps any
 * blocked tile.
 */
function overlapsSolid(blocked: Blocked, x: number, y: number, r: number): boolean {
  for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
    for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (blocked(tx, ty)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Moves along one axis, clamping flush against the first solid tile hit so
 * players slide along walls instead of stopping short of them.
 */
function moveAxis(blocked: Blocked, pos: number, other: number, delta: number, r: number, axis: 'x' | 'y'): number {
  const next = pos + delta;
  const hit = axis === 'x' ? overlapsSolid(blocked, next, other, r) : overlapsSolid(blocked, other, next, r);
  if (!hit) {
    return next;
  }
  const EPSILON = 0.001;
  return delta > 0 ? Math.floor(next + r) - r - EPSILON : Math.floor(next - r) + 1 + r + EPSILON;
}

/**
 * How far off a corner (in tiles) a mover heading straight past it is
 * slid around it instead of stopping.
 */
const CORNER_NUDGE = 0.3;

/**
 * Slides a mover heading straight along one axis sideways around a corner
 * it just clips, by up to `speed`. Says the new sideways position.
 */
function nudge(blocked: Blocked, main: number, other: number, ahead: number, r: number, speed: number, axis: 'x' | 'y'): number {
  const free = (m: number, o: number): boolean => !(axis === 'x' ? overlapsSolid(blocked, m, o, r) : overlapsSolid(blocked, o, m, r));
  const EPSILON = 0.001;
  for (const side of [1, -1]) {
    const target = side > 0 ? Math.floor(other - r) + 1 + r + EPSILON : Math.ceil(other + r) - 1 - r - EPSILON;
    const need = Math.abs(target - other);
    if (need > 0 && need <= CORNER_NUDGE && free(ahead, target) && free(main, target)) {
      return other + side * Math.min(speed, need);
    }
  }
  return other;
}

/**
 * Applies a movement delta with axis-separated tile collision, sliding a
 * mover that heads straight into a corner it only clips around it.
 */
export function moveWithCollision(blocked: Blocked, x: number, y: number, dx: number, dy: number, r: number): { x: number; y: number } {
  let nx = dx === 0 ? x : moveAxis(blocked, x, y, dx, r, 'x');
  let ny = dy === 0 ? y : moveAxis(blocked, y, nx, dy, r, 'y');
  if (dy === 0 && dx !== 0 && nx !== x + dx) {
    ny = nudge(blocked, nx, y, x + dx, r, Math.abs(dx), 'x');
  } else if (dx === 0 && dy !== 0 && ny !== y + dy) {
    nx = nudge(blocked, ny, x, y + dy, r, Math.abs(dy), 'y');
  }
  return { x: nx, y: ny };
}
