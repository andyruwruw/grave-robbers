// Packages
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { SPLASH_RADIUS } from '@halloween/shared/monsters/kinds/witch';

// Local Imports
import { toWorld } from '../space/world-coords';

// Types
import type { PuddleState } from '@halloween/shared/protocol/state/world-state';

/**
 * Most puddles drawn at once.
 */
const POOL = 12;

/**
 * A puddle: a dim purple pool over its whole splash radius with a brighter
 * middle, and a few bubbles rising and popping in it.
 */
const POOL_COLOR = '#5a1f8a';

/**
 * The brighter middle of a puddle.
 */
const MIDDLE_COLOR = '#9a3ae0';

/**
 * Bubbles rising in a puddle.
 */
const BUBBLE_COLOR = '#d08aff';

/**
 * A bloater's bile puddle, its brighter middle, and its bubbles.
 */
const BILE_COLORS = { pool: '#4a6a14', middle: '#8ab42a', bubble: '#d6f25a' };

/**
 * Bubbles per puddle.
 */
const BUBBLES = 5;

/**
 * Height above the ground line, clear of the tallest grass tufts.
 */
const PUDDLE_LIFT = 0.065;

/**
 * The pool over the whole splash radius.
 */
const DISC = new CylinderGeometry(SPLASH_RADIUS, SPLASH_RADIUS, 0.02, 14);

/**
 * The brighter middle.
 */
const MIDDLE = new CylinderGeometry(SPLASH_RADIUS * 0.6, SPLASH_RADIUS * 0.6, 0.02, 12);

/**
 * One bubble.
 */
const BUBBLE = new BoxGeometry(0.07, 0.07, 0.07);

/**
 * One puddle in the pool.
 */
interface Slot {
  /**
   * The puddle's meshes.
   */
  group: Group;

  /**
   * The pool's material, faded as it dries.
   */
  disc: MeshBasicMaterial;

  /**
   * The middle's material, faded as it dries.
   */
  middle: MeshBasicMaterial;

  /**
   * Its bubbles.
   */
  bubbles: Mesh[];
}

/**
 * Draws the puddles witches' potions (purple) and bloaters (green bile)
 * leave, fading as they dry up. They
 * glow faintly on their own, so they show in the dark.
 */
export class Puddles {
  /**
   * Every puddle mesh.
   */
  readonly group = new Group();

  /**
   * The pool of puddles.
   */
  private _slots: Slot[] = [];

  /**
   * The puddles to draw, from the latest world state.
   */
  private _puddles: PuddleState[] = [];

  /**
   * Fills the pool with hidden puddles.
   */
  constructor() {
    for (let i = 0; i < POOL; i++) {
      const group = new Group();
      const disc = new MeshBasicMaterial({ color: POOL_COLOR, transparent: true, opacity: 0, depthWrite: false });
      const middle = new MeshBasicMaterial({ color: MIDDLE_COLOR, transparent: true, opacity: 0, depthWrite: false });
      const inner = new Mesh(MIDDLE, middle);
      inner.position.y = 0.006;
      const bubbles = Array.from({ length: BUBBLES }, (): Mesh => new Mesh(BUBBLE, new MeshBasicMaterial({ color: BUBBLE_COLOR, transparent: true })));
      group.add(new Mesh(DISC, disc), inner, ...bubbles);
      group.visible = false;
      this.group.add(group);
      this._slots.push({ group, disc, middle, bubbles });
    }
  }

  /**
   * Takes the latest puddles.
   * @param puddles Every puddle on the map.
   */
  set(puddles: PuddleState[]): void {
    this._puddles = puddles;
  }

  /**
   * Places each puddle, fades it as it dries, and bubbles it.
   * @param time Seconds since the renderer started.
   * @param ground Ground height at a tile-space point.
   */
  update(time: number, ground: (x: number, y: number) => number): void {
    this._slots.forEach((slot: Slot, i: number): void => {
      const p = this._puddles[i];
      slot.group.visible = !!p;
      if (!p) {
        return;
      }
      const { x, z } = toWorld(p.x, p.y);
      slot.group.position.set(x, ground(p.x, p.y) + PUDDLE_LIFT, z);
      const fade = Math.min(1, p.life * 4);
      slot.disc.color.set(p.bile ? BILE_COLORS.pool : POOL_COLOR);
      slot.middle.color.set(p.bile ? BILE_COLORS.middle : MIDDLE_COLOR);
      slot.disc.opacity = 0.55 * fade;
      slot.middle.opacity = 0.5 * fade;
      slot.bubbles.forEach((bubble: Mesh, b: number): void => {
        const cycle = (time * 0.9 + b * 0.37 + p.id * 0.11) % 1;
        const angle = b * 2.4 + p.id;
        const r = SPLASH_RADIUS * (0.2 + ((b * 0.29) % 0.6));
        bubble.position.set(Math.cos(angle) * r, cycle * 0.12, Math.sin(angle) * r);
        bubble.scale.setScalar((1 - cycle) * fade);
        (bubble.material as MeshBasicMaterial).color.set(p.bile ? BILE_COLORS.bubble : BUBBLE_COLOR);
      });
    });
  }

  /**
   * Frees the puddle materials.
   */
  dispose(): void {
    for (const slot of this._slots) {
      slot.disc.dispose();
      slot.middle.dispose();
      slot.bubbles.forEach((b: Mesh): void => (b.material as MeshBasicMaterial).dispose());
    }
  }
}
