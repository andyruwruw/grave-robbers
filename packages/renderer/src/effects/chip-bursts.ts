// Packages
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import { RESOURCE_COLORS } from '@halloween/shared/goods/goods-display';

// Local Imports
import { toWorld } from '../space/world-coords';
import {
  CHIPS_PER_HIT,
  CHIP_COLORS,
  FLAME_LIFETIME,
  FLING_LIFETIME,
  GRAVITY,
  LIFETIME,
  POOL_SIZE,
  SPARK_LIFETIME,
  WHIRL_SPEED,
} from './config/chip-bursts';
import { EffectLayer } from './effect-layer';

// Types
import type { Material } from 'three';

/**
 * One flying chip in the pool.
 */
interface Chip {
  /**
   * The chip's mesh.
   */
  mesh: Mesh;

  /**
   * Velocity along x.
   */
  vx: number;

  /**
   * Velocity along y.
   */
  vy: number;

  /**
   * Velocity along z.
   */
  vz: number;

  /**
   * Seconds since it was thrown.
   */
  age: number;

  /**
   * Seconds it flies before it's hidden.
   */
  life: number;
}

/**
 * Wood and stone chips that fly off a gathered tile, puffs when a monster
 * dies or a light is snuffed, and bright hit sparks. A fixed pool of meshes
 * is reused; idle chips are hidden. Chips and puffs are lit by the light
 * map; sparks glow on their own, so hits read even in the dark.
 */
export class ChipBursts extends EffectLayer {
  /**
   * Shared materials by color and glow.
   */
  private _materials = new Map<string, Material>();

  /**
   * The pool of chips.
   */
  private _chips: Chip[] = [];

  /**
   * The pool slot the next chip is thrown from.
   */
  private _next = 0;

  /**
   * Fills the pool with hidden chips.
   */
  constructor() {
    super();
    const geometry = new BoxGeometry(0.07, 0.07, 0.07);
    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = new Mesh(geometry, this.material(RESOURCE_COLORS.wood, false));
      mesh.visible = false;
      this.group.add(mesh);
      this._chips.push({ mesh, vx: 0, vy: 0, vz: 0, age: LIFETIME, life: LIFETIME });
    }
  }

  /**
   * Chips flying off a gathered tile.
   * @param tx The tile's x.
   * @param ty The tile's y.
   * @param chip What it's made of.
   */
  burst(tx: number, ty: number, chip: 'wood' | 'stone'): void {
    this.puff(tx + 0.5, ty + 0.5, CHIP_COLORS[chip], CHIPS_PER_HIT);
  }

  /**
   * Throws `count` chips of `color` from tile-space point (tx, ty).
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param color The chips' color.
   * @param count How many chips.
   */
  puff(tx: number, ty: number, color: string, count: number): void {
    this.throw(tx, ty, color, count, false);
  }

  /**
   * Tosses `count` clods of `color` from tile-space point (tx, ty) up in an
   * arc toward (dx, dy) (a unit direction), like a shovelful thrown over a
   * shoulder. They last longer than chips so the arc reads.
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param dx Direction x.
   * @param dy Direction y.
   * @param color The clods' color.
   * @param count How many clods.
   */
  fling(tx: number, ty: number, dx: number, dy: number, color: string, count: number): void {
    const { x, z } = toWorld(tx, ty);
    const material = this.material(color, false);
    for (let i = 0; i < count; i++) {
      const chip = this._chips[this._next];
      this._next = (this._next + 1) % POOL_SIZE;
      const along = 1.6 + Math.random() * 1.4;
      const side = (Math.random() - 0.5) * 1.2;
      chip.mesh.material = material;
      chip.mesh.position.set(x + (Math.random() - 0.5) * 0.25, 0.3 + Math.random() * 0.2, z + (Math.random() - 0.5) * 0.25);
      chip.mesh.scale.setScalar(1 + Math.random() * 0.8);
      chip.mesh.visible = true;
      chip.vx = dx * along - dy * side;
      chip.vz = dy * along + dx * side;
      chip.vy = 3.2 + Math.random() * 1.6;
      chip.age = 0;
      chip.life = FLING_LIFETIME;
    }
  }

  /**
   * A gout of fire from tile-space point (tx, ty) toward `angle`, fanning
   * out `spread` radians either way and reaching about `reach` tiles,
   * in glowing chips of `colors`.
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param angle Direction of the gout, in radians.
   * @param spread How far it fans out either way, in radians.
   * @param reach About how far it reaches, in tiles.
   * @param colors The flame colors to pick from.
   * @param count How many chips.
   */
  jet(tx: number, ty: number, angle: number, spread: number, reach: number, colors: string[], count: number): void {
    const { x, z } = toWorld(tx, ty);
    for (let i = 0; i < count; i++) {
      const chip = this._chips[this._next];
      this._next = (this._next + 1) % POOL_SIZE;
      const a = angle + (Math.random() - 0.5) * 2 * spread;
      const speed = (reach / FLAME_LIFETIME) * (0.55 + Math.random() * 0.45);
      chip.mesh.material = this.material(colors[Math.floor(Math.random() * colors.length)], true);
      chip.mesh.position.set(x + Math.cos(angle) * 0.4, 0.6 + Math.random() * 0.15, z + Math.sin(angle) * 0.4);
      chip.mesh.scale.setScalar(1.4 + Math.random() * 1.2);
      chip.mesh.visible = true;
      chip.vx = Math.cos(a) * speed;
      chip.vz = Math.sin(a) * speed;
      chip.vy = 1 + Math.random() * 1.5;
      chip.age = 0;
      chip.life = FLAME_LIFETIME;
    }
  }

  /**
   * Glowing sparks spun around tile-space point (tx, ty) at `radius`, for
   * blades sweeping round.
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param radius How far out the sparks spin, in tiles.
   * @param color The sparks' color.
   * @param count How many sparks.
   */
  whirl(tx: number, ty: number, radius: number, color: string, count: number): void {
    const { x, z } = toWorld(tx, ty);
    const material = this.material(color, true);
    const start = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const chip = this._chips[this._next];
      this._next = (this._next + 1) % POOL_SIZE;
      const a = start + (i / count) * Math.PI * 2;
      chip.mesh.material = material;
      chip.mesh.position.set(x + Math.cos(a) * radius * 0.75, 0.55, z + Math.sin(a) * radius * 0.75);
      chip.mesh.scale.setScalar(1.2);
      chip.mesh.visible = true;
      chip.vx = -Math.sin(a) * WHIRL_SPEED;
      chip.vz = Math.cos(a) * WHIRL_SPEED;
      chip.vy = 0.6;
      chip.age = 0;
      chip.life = SPARK_LIFETIME;
    }
  }

  /**
   * A quick, bright, glowing burst at tile-space point (tx, ty) for a hit
   * landing.
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param color The sparks' color.
   * @param count How many sparks.
   */
  spark(tx: number, ty: number, color: string, count: number): void {
    this.throw(tx, ty, color, count, true);
  }

  /**
   * Moves every flying chip and hides the ones that are done.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (const chip of this._chips) {
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

  /**
   * Frees the chip materials.
   */
  dispose(): void {
    this._materials.forEach((m: Material): void => m.dispose());
  }

  /**
   * Throws chips all around tile-space point (tx, ty).
   * @param tx Tile-space x.
   * @param ty Tile-space y.
   * @param color The chips' color.
   * @param count How many chips.
   * @param glow Whether they glow (sparks) or are lit (chips and puffs).
   */
  private throw(tx: number, ty: number, color: string, count: number, glow: boolean): void {
    const { x, z } = toWorld(tx, ty);
    const material = this.material(color, glow);
    for (let i = 0; i < count; i++) {
      const chip = this._chips[this._next];
      this._next = (this._next + 1) % POOL_SIZE;
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

  /**
   * The shared material for a color.
   * @param color The color.
   * @param glow Whether it glows (unlit).
   * @returns The material.
   */
  private material(color: string, glow: boolean): Material {
    const key = `${color}|${glow}`;
    let m = this._materials.get(key);
    if (!m) {
      m = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
      this._materials.set(key, m);
    }
    return m;
  }
}
