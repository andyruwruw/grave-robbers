// Packages
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Vector3,
} from 'three';

// Local Imports
import { toWorld } from './build-graveyard';

// Types
import type { Object3D, Scene } from 'three';

const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * Blood on the ground: how many splats exist at once (the oldest is reused),
 * how long one stays before it starts drying away, and how long that takes.
 */
const SPLAT_POOL = 700;
const SPLAT_LIFE = 40;
const SPLAT_FADE = 6;

/**
 * Pumpkin seeds: their color and how long they lie there (plus a quick
 * fade).
 */
const SEED = '#efe2b8';
const SEED_LIFE = [1.2, 2.2];
const SEED_FADE = 0.6;

/**
 * Pieces of a dead monster: gravity (world units per second squared), how
 * fast they're thrown, how long they lie there, and how long they take to
 * sink into the ground.
 */
const GRAVITY = 16;
const GIB_SPEED = [1.6, 4.2];
const GIB_LIFT = [2.4, 5];
const GIB_SPIN = 14;
const GIB_LIFE = 9;
const GIB_SINK = 1.5;

/**
 * Broken things (walls, pumpkins, trees) fly a little less far than bodies
 * and are cleared sooner.
 */
const DEBRIS_SPEED = 0.7;
const DEBRIS_LIFE = 5;

/**
 * A spatter of blood lying on the ground.
 */
interface Splat {
  mesh: Mesh;
  material: MeshLambertMaterial;
  age: number;
  size: number;
  life: number;
  fade: number;
  opacity: number;
}

/**
 * One flying chunk of a dead body.
 */
interface Gib {
  part: Object3D;
  rest: number;
  life: number;
  velocity: Vector3;
  spin: Vector3;
  ground: number;
  age: number;
  resting: boolean;
}

/**
 * A body being torn apart; disposed once its last piece has sunk.
 */
interface Corpse {
  gibs: Gib[];
  dispose: () => void;
}

/**
 * Blood and bodies: flat splats of blood that stain the ground and dry up
 * after a while, and monsters that burst into their parts on death. The
 * parts fly the way the killing blow pushed, tumble, bounce, lie in the
 * grass for a few seconds, then sink away.
 */
export class Gore {
  readonly group = new Group();
  private splats: Splat[] = [];
  private nextSplat = 0;
  private corpses: Corpse[] = [];

  /**
   * @param scene - Where torn-off parts live while they fly.
   * @param groundHeight - Ground height at a tile-space point.
   */
  constructor(private scene: Scene, private groundHeight: (x: number, y: number) => number) {
    for (let i = 0; i < SPLAT_POOL; i++) {
      const material = new MeshLambertMaterial({ color: '#000000', transparent: true });
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.visible = false;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.splats.push({ mesh, material, age: SPLAT_LIFE + SPLAT_FADE, size: 0, life: SPLAT_LIFE, fade: SPLAT_FADE, opacity: 0 });
    }
  }

  /**
   * Spatters `count` splats around tile-space (x, y), flung mostly along
   * `angle` (or all around when it's null).
   */
  spatter(x: number, y: number, color: string, count: number, angle: number | null, reach = 0.7): void {
    for (let i = 0; i < count; i++) {
      const splat = this.next();
      const a = angle === null ? Math.random() * Math.PI * 2 : angle + (Math.random() - 0.5) * 1.4;
      const d = Math.random() * reach * (i === 0 ? 0.3 : 1);
      const sx = x + Math.cos(a) * d;
      const sy = y + Math.sin(a) * d;
      const { x: wx, z: wz } = toWorld(sx, sy);
      splat.size = (i === 0 ? 0.42 : 0.14 + Math.random() * 0.22) * (angle === null ? 1 : 0.9);
      splat.mesh.position.set(wx, this.groundHeight(sx, sy) + 0.012 + Math.random() * 0.004, wz);
      splat.mesh.rotation.y = -a + (Math.random() - 0.5) * 0.6;
      splat.mesh.scale.set(splat.size * (1.2 + Math.random() * 0.8), 0.01, splat.size);
      splat.material.color.set(color).multiplyScalar(0.75 + Math.random() * 0.4);
      this.show(splat, 1, SPLAT_LIFE, SPLAT_FADE);
    }
  }

  /**
   * Scatters pumpkin seeds around tile-space (x, y) that lie there for a
   * second or two.
   */
  seeds(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const splat = this.next();
      const a = Math.random() * Math.PI * 2;
      const d = 0.1 + Math.random() * 0.7;
      const sx = x + Math.cos(a) * d;
      const sy = y + Math.sin(a) * d;
      const { x: wx, z: wz } = toWorld(sx, sy);
      splat.mesh.position.set(wx, this.groundHeight(sx, sy) + 0.02, wz);
      splat.mesh.rotation.y = Math.random() * Math.PI;
      splat.mesh.scale.set(0.07, 0.02, 0.04);
      splat.material.color.set(SEED);
      this.show(splat, 1, SEED_LIFE[0] + Math.random() * (SEED_LIFE[1] - SEED_LIFE[0]), SEED_FADE);
    }
  }

  private next(): Splat {
    const splat = this.splats[this.nextSplat];
    this.nextSplat = (this.nextSplat + 1) % SPLAT_POOL;
    return splat;
  }

  private show(splat: Splat, opacity: number, life: number, fade: number): void {
    splat.material.opacity = opacity;
    splat.opacity = opacity;
    splat.life = life;
    splat.fade = fade;
    splat.mesh.visible = true;
    splat.age = 0;
  }

  /**
   * Bursts a body apart. Its parts (legs, arms, head, and each box of the
   * torso) are moved into the scene where they stand (each on a pivot at
   * its middle, so it tumbles about its center) and thrown along
   * `angle`; glowing bits (eyes) go dark and the hit flash is cleared.
   * `dispose` runs once they're gone.
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
   */
  shatter(pieces: Object3D[], ground: number, angle: number): void {
    const root = new Group();
    root.add(...pieces);
    this.fling(root, pieces, ground, angle, DEBRIS_SPEED, DEBRIS_LIFE, (): void => {});
  }

  private fling(root: Group, parts: Object3D[], ground: number, angle: number, speedScale: number, life: number, dispose: () => void): void {
    root.updateMatrixWorld(true);
    const gibs = parts.map((part: Object3D): Gib => {
      const bounds = new Box3().setFromObject(part);
      const size = bounds.getSize(new Vector3());
      const pivot = new Group();
      bounds.getCenter(pivot.position);
      this.scene.add(pivot);
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
    this.scene.remove(root);
    this.corpses.push({ gibs, dispose });
  }

  update(dt: number): void {
    for (const splat of this.splats) {
      if (!splat.mesh.visible) {
        continue;
      }
      splat.age += dt;
      if (splat.age > splat.life) {
        const k = Math.min(1, (splat.age - splat.life) / splat.fade);
        splat.material.opacity = splat.opacity * (1 - k);
        splat.mesh.visible = k < 1;
      }
    }
    this.corpses = this.corpses.filter((corpse: Corpse): boolean => {
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
          this.scene.remove(gib.part);
        });
        corpse.dispose();
      }
      return alive;
    });
  }

  dispose(): void {
    this.splats.forEach(({ material }): void => material.dispose());
    this.corpses.forEach((corpse: Corpse): void => {
      corpse.gibs.forEach((gib: Gib): void => {
        this.scene.remove(gib.part);
      });
      corpse.dispose();
    });
  }
}
