// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import { RESOURCE_COLORS } from '@halloween/shared/items';

// Local Imports
import { toWorld } from './build-graveyard';

// Types
import type { Material } from 'three';

const POOL_SIZE = 240;
const CHIPS_PER_HIT = 7;
const LIFETIME = 0.7;
const SPARK_LIFETIME = 0.28;
const GRAVITY = 9;
const CHIP_COLORS = { wood: RESOURCE_COLORS.wood, stone: '#80848d' };

/**
 * One flying chip in the pool.
 */
interface Chip {
  mesh: Mesh;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  life: number;
}

/**
 * Wood and stone chips that fly off a gathered tile, puffs when a monster
 * dies or a light is snuffed, and bright hit sparks. A fixed pool of meshes
 * is reused; idle chips are hidden. Chips and puffs are lit by the light
 * map; sparks glow on their own, so hits read even in the dark.
 */
export class ChipBursts {
  readonly group = new Group();
  private materials = new Map<string, Material>();
  private chips: Chip[] = [];
  private next = 0;

  constructor() {
    const geometry = new BoxGeometry(0.07, 0.07, 0.07);
    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = new Mesh(geometry, this.material(RESOURCE_COLORS.wood, false));
      mesh.visible = false;
      this.group.add(mesh);
      this.chips.push({ mesh, vx: 0, vy: 0, vz: 0, age: LIFETIME, life: LIFETIME });
    }
  }

  burst(tx: number, ty: number, chip: 'wood' | 'stone'): void {
    this.puff(tx + 0.5, ty + 0.5, CHIP_COLORS[chip], CHIPS_PER_HIT);
  }

  /**
   * Throws `count` chips of `color` from tile-space point (tx, ty).
   */
  puff(tx: number, ty: number, color: string, count: number): void {
    this.throw(tx, ty, color, count, false);
  }

  /**
   * A quick, bright, glowing burst at tile-space point (tx, ty) for a hit
   * landing.
   */
  spark(tx: number, ty: number, color: string, count: number): void {
    this.throw(tx, ty, color, count, true);
  }

  update(dt: number): void {
    for (const chip of this.chips) {
      if (chip.age >= chip.life) {
        continue;
      }
      chip.age += dt;
      chip.vy -= GRAVITY * dt;
      chip.mesh.position.x += chip.vx * dt;
      chip.mesh.position.y = Math.max(0.035, chip.mesh.position.y + chip.vy * dt);
      chip.mesh.position.z += chip.vz * dt;
      chip.mesh.rotation.x += dt * 12;
      chip.mesh.visible = chip.age < chip.life;
    }
  }

  dispose(): void {
    this.materials.forEach((m: Material): void => m.dispose());
  }

  private throw(tx: number, ty: number, color: string, count: number, glow: boolean): void {
    const { x, z } = toWorld(tx, ty);
    const material = this.material(color, glow);
    for (let i = 0; i < count; i++) {
      const chip = this.chips[this.next];
      this.next = (this.next + 1) % POOL_SIZE;
      const angle = Math.random() * Math.PI * 2;
      const speed = glow ? 2.5 + Math.random() * 3 : 1 + Math.random() * 1.5;
      chip.mesh.material = material;
      chip.mesh.position.set(x, (glow ? 0.6 : 0.5) + Math.random() * 0.4, z);
      chip.mesh.scale.setScalar(glow ? 1.4 : 1);
      chip.mesh.visible = true;
      chip.vx = Math.cos(angle) * speed;
      chip.vz = Math.sin(angle) * speed;
      chip.vy = glow ? 1 + Math.random() * 2.5 : 2 + Math.random() * 2;
      chip.age = 0;
      chip.life = glow ? SPARK_LIFETIME : LIFETIME;
    }
  }

  private material(color: string, glow: boolean): Material {
    const key = `${color}|${glow}`;
    let m = this.materials.get(key);
    if (!m) {
      m = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
      this.materials.set(key, m);
    }
    return m;
  }
}
