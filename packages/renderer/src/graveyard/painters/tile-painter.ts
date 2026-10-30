// Packages
import {
  Euler,
  Quaternion,
  Vector3,
} from 'three';

// Local Imports
import { CANDLE, WAX } from '../config/palette/props';
import { SOCKET } from '../config/palette/structures';

// Types
import type { Batch, Paint, StaticLight, Vec } from '../../types/terrain';

/**
 * Straight up, the rest direction `stick` turns from.
 */
const UP = new Vector3(0, 1, 0);

/**
 * Paints whatever stands on one kind of tile, seeded per tile so a rebuild
 * looks the same. Subclasses share the bone, skull and candle builders.
 */
export abstract class TilePainter {
  /**
   * Paints the tile's contents (not its ground).
   * @param p The tile being painted.
   */
  abstract paint(p: Paint): void;

  /**
   * Adds the permanent lights the tile gives off (none unless overridden).
   * @param _p The tile being painted.
   * @param _lights Where its lights go.
   */
  staticLights(_p: Paint, _lights: StaticLight[]): void {}

  /**
   * Maps points in a frame turned `yaw` about the tile's middle (dx east, y
   * up from its base, dz toward the camera) to world space.
   * @param x World-space x of the frame's middle.
   * @param z World-space z of the frame's middle.
   * @param base Height of the frame's floor.
   * @param yaw How far the frame is turned.
   * @returns The mapping.
   */
  protected turned(x: number, z: number, base: number, yaw: number): (dx: number, y: number, dz: number) => Vec {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return (dx: number, y: number, dz: number): Vec => [x + dx * c + dz * s, base + y, z - dx * s + dz * c];
  }

  /**
   * A square rod `w` thick from one point to another.
   * @param b Where the rod goes.
   * @param from One end.
   * @param to The other end.
   * @param w Its thickness.
   * @param color Its color.
   * @returns The rod's rotation, for parts that share it.
   */
  protected stick(b: Batch, from: Vec, to: Vec, w: number, color: string): Euler {
    const dir = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = dir.length();
    const rot = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, dir.normalize()));
    b.add([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], [w, length, w], color, rot);
    return rot;
  }

  /**
   * A bone from one point to another: a shaft with a knobbly end at each.
   * @param b Where the bone goes.
   * @param from One end.
   * @param to The other end.
   * @param w The shaft's thickness.
   * @param color Its color.
   */
  protected bone(b: Batch, from: Vec, to: Vec, w: number, color: string): void {
    const rot = this.stick(b, from, to, w, color);
    for (const end of [from, to]) {
      b.add(end, [w * 2.1, w * 1.3, w * 1.5], color, rot);
    }
  }

  /**
   * A skull `s` across centered on local (cx, cy, cz) of a turned frame,
   * facing the frame's +z: cranium, jaw, eye sockets (in `eyes`, so they can
   * glow), nose, and a dark line of teeth.
   * @param b Where the skull goes.
   * @param at The turned frame (see `turned`).
   * @param rot The skull's rotation.
   * @param cx Local x of its middle.
   * @param cy Local y of its middle.
   * @param cz Local z of its middle.
   * @param s How wide it is.
   * @param color The bone color.
   * @param eyes Where the eye sockets go.
   * @param eyeColor The eye sockets' color.
   */
  protected skull(b: Batch, at: (dx: number, y: number, dz: number) => Vec, rot: Euler, cx: number, cy: number, cz: number, s: number, color: string, eyes: Batch = b, eyeColor = SOCKET): void {
    const face = cz + s * 0.45 + 0.006;
    b.add(at(cx, cy, cz), [s, s * 0.8, s * 0.9], color, rot);
    b.add(at(cx, cy - s * 0.48, cz + s * 0.12), [s * 0.7, s * 0.24, s * 0.62], color, rot);
    for (const side of [-1, 1]) {
      eyes.add(at(cx + side * s * 0.22, cy - s * 0.04, face), [s * 0.24, s * 0.22, 0.012], eyeColor, rot);
    }
    b.add(at(cx, cy - s * 0.25, face), [s * 0.1, s * 0.1, 0.012], SOCKET, rot);
    b.add(at(cx, cy - s * 0.4, cz + s * 0.43 + 0.006), [s * 0.5, 0.014, 0.012], SOCKET, rot);
  }

  /**
   * A wax candle with a glowing flame on top.
   * @param lit Where the wax goes.
   * @param glow Where the flame goes.
   * @param pos The candle's foot.
   * @param h Its height.
   */
  protected candle(lit: Batch, glow: Batch, pos: Vec, h: number): void {
    lit.add([pos[0], pos[1] + h / 2, pos[2]], [0.05, h, 0.05], WAX);
    lit.add([pos[0] + 0.02, pos[1] + 0.012, pos[2] + 0.01], [0.07, 0.024, 0.07], WAX);
    glow.add([pos[0], pos[1] + h + 0.025, pos[2]], [0.03, 0.05, 0.03], CANDLE);
  }
}
