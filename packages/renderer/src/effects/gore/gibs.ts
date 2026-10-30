// Packages
import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Vector3,
} from 'three';

// Local Imports
import {
  DEBRIS_LIFE,
  DEBRIS_SPEED,
  GIB_LIFE,
  GIB_LIFT,
  GIB_SINK,
  GIB_SPEED,
  GIB_SPIN,
  GRAVITY,
} from '../config/gore';

// Types
import type { Object3D, Scene } from 'three';

/**
 * One flying chunk of a dead body.
 */
interface Gib {
  /**
   * The pivot the piece tumbles on.
   */
  part: Object3D;

  /**
   * Height of its middle above the ground when lying flat.
   */
  rest: number;

  /**
   * Seconds it lies there before it sinks.
   */
  life: number;

  /**
   * How fast it's flying.
   */
  velocity: Vector3;

  /**
   * How fast it tumbles about each axis.
   */
  spin: Vector3;

  /**
   * Ground height it lands on.
   */
  ground: number;

  /**
   * Seconds since it was thrown.
   */
  age: number;

  /**
   * Whether it has stopped bouncing.
   */
  resting: boolean;
}

/**
 * A body being torn apart; disposed once its last piece has sunk.
 */
interface Corpse {
  /**
   * Its flying pieces.
   */
  gibs: Gib[];

  /**
   * Runs once the last piece has sunk.
   */
  dispose: () => void;
}

/**
 * Bodies and broken things bursting into their parts: the parts fly the
 * way the blow pushed, tumble, bounce, lie in the grass for a few seconds,
 * then sink away.
 */
export class Gibs {
  /**
   * Bodies still being torn apart.
   */
  private _corpses: Corpse[] = [];

  /**
   * Starts with nothing in pieces.
   * @param _scene Where torn-off parts live while they fly.
   */
  constructor(private _scene: Scene) {}

  /**
   * Bursts a body apart. Its parts (legs, arms, head, and each box of the
   * torso) are moved into the scene where they stand (each on a pivot at
   * its middle, so it tumbles about its center) and thrown along
   * `angle`; glowing bits (eyes) go dark and the hit flash is cleared.
   * `dispose` runs once they're gone.
   * @param root The body's root group.
   * @param body The torso group, whose boxes fly apart one by one.
   * @param angle Direction of the killing blow, in radians.
   * @param dispose Runs once the last piece has sunk.
   */
  tearApart(root: Group, body: Object3D, angle: number, dispose: () => void): void {
    const parts: Object3D[] = [];
    for (const child of [...root.children]) {
      parts.push(...(child === body ? [...body.children] : [child]));
    }
    this.fling(root, parts, root.position.y, angle, 1, GIB_LIFE, dispose);
  }

  /**
   * Throws loose world-space pieces of something broken (see
   * `buildTilePieces`) along `angle`, from ground height `ground`.
   * @param pieces The loose pieces.
   * @param ground Ground height they land on.
   * @param angle Direction they're thrown, in radians.
   */
  shatter(pieces: Object3D[], ground: number, angle: number): void {
    const root = new Group();
    root.add(...pieces);
    this.fling(root, pieces, ground, angle, DEBRIS_SPEED, DEBRIS_LIFE, (): void => {});
  }

  /**
   * Moves pieces into the scene on pivots and throws them.
   * @param root The group they were in.
   * @param parts The pieces.
   * @param ground Ground height they land on.
   * @param angle Direction they're thrown, in radians.
   * @param speedScale How fast and high they fly, relative to a body's.
   * @param life Seconds they lie there before they sink.
   * @param dispose Runs once the last piece has sunk.
   */
  private fling(root: Group, parts: Object3D[], ground: number, angle: number, speedScale: number, life: number, dispose: () => void): void {
    root.updateMatrixWorld(true);
    const gibs = parts.map((part: Object3D): Gib => {
      const bounds = new Box3().setFromObject(part);
      const size = bounds.getSize(new Vector3());
      const pivot = new Group();
      bounds.getCenter(pivot.position);
      this._scene.add(pivot);
      pivot.attach(part);
      part.traverse((obj: Object3D): void => {
        if (obj instanceof Mesh && obj.material instanceof MeshBasicMaterial) {
          obj.visible = false;
        } else if (obj instanceof Mesh && obj.material instanceof MeshLambertMaterial) {
          obj.material.emissive.setRGB(0, 0, 0);
        }
      });
      const a = angle + (Math.random() - 0.5) * 1.8;
      const speed = (GIB_SPEED[0] + Math.random() * (GIB_SPEED[1] - GIB_SPEED[0])) * speedScale;
      return {
        part: pivot,
        rest: Math.max(0.02, Math.min(size.x, size.y, size.z) / 2),
        life: life * (0.8 + Math.random() * 0.4),
        velocity: new Vector3(Math.cos(a) * speed, (GIB_LIFT[0] + Math.random() * (GIB_LIFT[1] - GIB_LIFT[0])) * speedScale, Math.sin(a) * speed),
        spin: new Vector3((Math.random() - 0.5) * GIB_SPIN, (Math.random() - 0.5) * GIB_SPIN, (Math.random() - 0.5) * GIB_SPIN),
        ground,
        age: 0,
        resting: false,
      };
    });
    this._scene.remove(root);
    this._corpses.push({ gibs, dispose });
  }

  /**
   * Moves, settles and sinks the flying pieces.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    this._corpses = this._corpses.filter((corpse: Corpse): boolean => {
      let alive = false;
      for (const gib of corpse.gibs) {
        gib.age += dt;
        if (gib.age > gib.life) {
          gib.part.position.y -= (0.4 / GIB_SINK) * dt;
          gib.part.visible = gib.age < gib.life + GIB_SINK;
        } else if (!gib.resting) {
          gib.velocity.y -= GRAVITY * dt;
          gib.part.position.addScaledVector(gib.velocity, dt);
          gib.part.rotation.x += gib.spin.x * dt;
          gib.part.rotation.y += gib.spin.y * dt;
          gib.part.rotation.z += gib.spin.z * dt;
          const floor = gib.ground + gib.rest;
          if (gib.part.position.y < floor) {
            gib.part.position.y = floor;
            gib.velocity.set(gib.velocity.x * 0.5, -gib.velocity.y * 0.3, gib.velocity.z * 0.5);
            gib.spin.multiplyScalar(0.5);
            if (gib.velocity.y < 0.6) {
              gib.resting = true;
              gib.part.rotation.x = Math.round(gib.part.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
              gib.part.rotation.z = Math.round(gib.part.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
            }
          }
        }
        alive ||= gib.part.visible;
      }
      if (!alive) {
        corpse.gibs.forEach((gib: Gib): void => {
          this._scene.remove(gib.part);
        });
        corpse.dispose();
      }
      return alive;
    });
  }

  /**
   * Frees every body still in pieces.
   */
  dispose(): void {
    this._corpses.forEach((corpse: Corpse): void => {
      corpse.gibs.forEach((gib: Gib): void => {
        this._scene.remove(gib.part);
      });
      corpse.dispose();
    });
  }
}
