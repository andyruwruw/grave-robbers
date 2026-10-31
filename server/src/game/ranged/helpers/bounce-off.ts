/**
 * Where a shot that just flew `step` tiles into a wall ends up when it
 * bounces (Bone Choir): stepped back out, turned off whichever side it
 * crossed (both at a corner).
 * @param x Where it is now, in the wall (tiles).
 * @param y Where it is now, in the wall (tiles).
 * @param angle Which way it was flying (radians).
 * @param step How far it just moved (tiles).
 * @param blocked Whether a point stops it.
 * @returns Where it is and which way it flies after the bounce.
 */
export const bounceOff = (x: number, y: number, angle: number, step: number, blocked: (x: number, y: number) => boolean): { x: number; y: number; angle: number } => {
  let vx = Math.cos(angle);
  let vy = Math.sin(angle);
  const px = x - vx * step;
  const py = y - vy * step;
  const acrossX = Math.floor(px) !== Math.floor(x) && blocked(x, py);
  const acrossY = Math.floor(py) !== Math.floor(y) && blocked(px, y);
  if (acrossX || !acrossY) {
    vx = -vx;
  }
  if (acrossY || !acrossX) {
    vy = -vy;
  }
  return { x: px, y: py, angle: Math.atan2(vy, vx) };
};
