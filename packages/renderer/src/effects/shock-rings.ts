// Packages
import {
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
} from 'three';

// Local Imports
import { RING_LIFE, RING_POOL } from './config/infusion-layers';
import { EffectLayer } from './effect-layer';

/**
 * One ring in the pool.
 */
interface Ring {
  /**
   * The flat ring mesh (a unit radius, scaled out).
   */
  mesh: Mesh;

  /**
   * Its own material, faded as it spreads.
   */
  material: MeshBasicMaterial;

  /**
   * How far it spreads, in world units.
   */
  radius: number;

  /**
   * Seconds since it went off.
   */
  age: number;

  /**
   * Seconds it takes to spread and fade.
   */
  life: number;
}

/**
 * Shockwaves on the ground (a Wailing Sickle's wail, a ground slam, a holy
 * nova, a death blast, a Mirror Shield's glint): flat glowing rings that
 * spread out fast to their radius and fade, from a fixed pool reused
 * oldest first.
 */
export class ShockRings extends EffectLayer {
  /**
   * The pool of rings.
   */
  private _rings: Ring[] = [];

  /**
   * The pool slot the next ring goes off in.
   */
  private _next = 0;

  /**
   * Fills the pool with hidden rings.
   */
  constructor() {
    super();
    const geometry = new RingGeometry(0.82, 1, 36);
    geometry.rotateX(-Math.PI / 2);
    for (let i = 0; i < RING_POOL; i++) {
      const material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const mesh = new Mesh(geometry, material);
      mesh.visible = false;
      this.group.add(mesh);
      this._rings.push({ mesh, material, radius: 1, age: RING_LIFE, life: RING_LIFE });
    }
  }

  /**
   * Sets off a ring at a world-space point.
   * @param x World x.
   * @param y World height.
   * @param z World z.
   * @param radius How far it spreads, in world units.
   * @param color Its color.
   * @param life Seconds it takes to spread and fade.
   */
  ring(x: number, y: number, z: number, radius: number, color: string, life = RING_LIFE): void {
    const ring = this._rings[this._next];
    this._next = (this._next + 1) % RING_POOL;
    ring.mesh.position.set(x, y, z);
    ring.material.color.set(color);
    ring.radius = radius;
    ring.age = 0;
    ring.life = life;
    ring.mesh.visible = true;
    this.place(ring);
  }

  /**
   * Spreads and fades every ring, hiding the ones that are done.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (const ring of this._rings) {
      if (!ring.mesh.visible) {
        continue;
      }
      ring.age += dt;
      ring.mesh.visible = ring.age < ring.life;
      this.place(ring);
    }
  }

  /**
   * Frees the rings' geometry and materials.
   */
  dispose(): void {
    this._rings[0]?.mesh.geometry.dispose();
    this._rings.forEach((ring: Ring): void => ring.material.dispose());
  }

  /**
   * Sizes and fades a ring for its age: it shoots out and slows (ease out)
   * while fading.
   * @param ring The ring.
   */
  private place(ring: Ring): void {
    const t = Math.min(1, ring.age / ring.life);
    const spread = 1 - (1 - t) * (1 - t);
    ring.mesh.scale.setScalar(Math.max(0.05, ring.radius * (0.15 + 0.85 * spread)));
    ring.material.opacity = 0.85 * (1 - t);
  }
}
