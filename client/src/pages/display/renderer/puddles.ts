// Packages
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { SPLASH_RADIUS } from '@halloween/shared/monsters';

// Local Imports
import { toWorld } from './build-graveyard';

// Types
import type { PuddleState } from '@halloween/shared/protocol';

/**
 * Most puddles drawn at once.
 */
const POOL = 12;

/**
 * A puddle: a dim purple pool over its whole splash radius with a brighter
 * middle, and a few bubbles rising and popping in it.
 */
const POOL_COLOR = '#5a1f8a';
const MIDDLE_COLOR = '#9a3ae0';
const BUBBLE_COLOR = '#d08aff';
const BUBBLES = 5;

/**
 * Height above the ground line, clear of the tallest grass tufts.
 */
const PUDDLE_LIFT = 0.065;
const DISC = new CylinderGeometry(SPLASH_RADIUS, SPLASH_RADIUS, 0.02, 14);
const MIDDLE = new CylinderGeometry(SPLASH_RADIUS * 0.6, SPLASH_RADIUS * 0.6, 0.02, 12);
const BUBBLE = new BoxGeometry(0.07, 0.07, 0.07);

interface Slot {
  group: Group;
  disc: MeshBasicMaterial;
  middle: MeshBasicMaterial;
  bubbles: Mesh[];
}

/**
 * Draws the puddles witches' potions leave, fading as they dry up. They
 * glow faintly on their own, so they show in the dark.
 */
export class Puddles {
  readonly group = new Group();
  private slots: Slot[] = [];
  private puddles: PuddleState[] = [];

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
      this.slots.push({ group, disc, middle, bubbles });
    }
  }

  set(puddles: PuddleState[]): void {
    this.puddles = puddles;
  }

  update(time: number, ground: (x: number, y: number) => number): void {
    this.slots.forEach((slot: Slot, i: number): void => {
      const p = this.puddles[i];
      slot.group.visible = !!p;
      if (!p) {
        return;
      }
      const { x, z } = toWorld(p.x, p.y);
      slot.group.position.set(x, ground(p.x, p.y) + PUDDLE_LIFT, z);
      const fade = Math.min(1, p.life * 4);
      slot.disc.opacity = 0.55 * fade;
      slot.middle.opacity = 0.5 * fade;
      slot.bubbles.forEach((bubble: Mesh, b: number): void => {
        const cycle = (time * 0.9 + b * 0.37 + p.id * 0.11) % 1;
        const angle = b * 2.4 + p.id;
        const r = SPLASH_RADIUS * (0.2 + ((b * 0.29) % 0.6));
        bubble.position.set(Math.cos(angle) * r, cycle * 0.12, Math.sin(angle) * r);
        bubble.scale.setScalar((1 - cycle) * fade);
      });
    });
  }

  dispose(): void {
    for (const slot of this.slots) {
      slot.disc.dispose();
      slot.middle.dispose();
      slot.bubbles.forEach((b: Mesh): void => (b.material as MeshBasicMaterial).dispose());
    }
  }
}
