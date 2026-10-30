// Local Imports
import { EffectLayer } from '../effect-layer';
import { BloodSplats } from './blood-splats';
import { Gibs } from './gibs';

// Types
import type { Group, Object3D, Scene } from 'three';

/**
 * Blood and bodies: flat splats of blood that stain the ground and dry up
 * after a while, and monsters that burst into their parts on death. The
 * parts fly the way the killing blow pushed, tumble, bounce, lie in the
 * grass for a few seconds, then sink away.
 */
export class Gore extends EffectLayer {
  /**
   * The blood on the ground.
   */
  private _splats: BloodSplats;

  /**
   * The flying parts.
   */
  private _gibs: Gibs;

  /**
   * Fills the pool with hidden splats.
   * @param scene Where torn-off parts live while they fly.
   * @param groundHeight Ground height at a tile-space point.
   */
  constructor(scene: Scene, groundHeight: (x: number, y: number) => number) {
    super();
    this._splats = new BloodSplats(this.group, groundHeight);
    this._gibs = new Gibs(scene);
  }

  /**
   * Spatters `count` splats around tile-space (x, y), flung mostly along
   * `angle` (or all around when it's null).
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param color The blood's color.
   * @param count How many splats.
   * @param angle Direction they're flung, in radians, or null for all around.
   * @param reach How far they spread, in tiles.
   */
  spatter(x: number, y: number, color: string, count: number, angle: number | null, reach = 0.7): void {
    this._splats.spatter(x, y, color, count, angle, reach);
  }

  /**
   * Scatters pumpkin seeds around tile-space (x, y) that lie there for a
   * second or two.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param count How many seeds.
   */
  seeds(x: number, y: number, count: number): void {
    this._splats.seeds(x, y, count);
  }

  /**
   * Bursts a body apart (see `Gibs.tearApart`).
   * @param root The body's root group.
   * @param body The torso group, whose boxes fly apart one by one.
   * @param angle Direction of the killing blow, in radians.
   * @param dispose Runs once the last piece has sunk.
   */
  tearApart(root: Group, body: Object3D, angle: number, dispose: () => void): void {
    this._gibs.tearApart(root, body, angle, dispose);
  }

  /**
   * Throws loose world-space pieces of something broken (see
   * `buildTilePieces`) along `angle`, from ground height `ground`.
   * @param pieces The loose pieces.
   * @param ground Ground height they land on.
   * @param angle Direction they're thrown, in radians.
   */
  shatter(pieces: Object3D[], ground: number, angle: number): void {
    this._gibs.shatter(pieces, ground, angle);
  }

  /**
   * Dries splats and moves, settles and sinks the flying pieces.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    this._splats.update(dt);
    this._gibs.update(dt);
  }

  /**
   * Frees the splat materials and every body still in pieces.
   */
  dispose(): void {
    this._splats.dispose();
    this._gibs.dispose();
  }
}
