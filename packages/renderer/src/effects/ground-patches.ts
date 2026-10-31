// Packages
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { toWorld } from '../space/world-coords';
import {
  PATCH_LIFT,
  PATCH_LOOKS,
  PATCH_MOTES,
  PATCH_POOL,
  PATCH_PULSE,
} from './config/ground-patches';

// Types
import type { PatchState } from '@halloween/shared/protocol/state/world-state';

/**
 * A unit disc (radius 1), scaled to each patch.
 */
const DISC = new CylinderGeometry(1, 1, 0.02, 16);

/**
 * A unit box, scaled to each mote.
 */
const MOTE = new BoxGeometry(1, 1, 1);

/**
 * One patch in the pool.
 */
interface Slot {
  /**
   * The patch's meshes.
   */
  group: Group;

  /**
   * The ground disc's material.
   */
  disc: MeshBasicMaterial;

  /**
   * The brighter middle's material.
   */
  middle: MeshBasicMaterial;

  /**
   * The middle disc.
   */
  inner: Mesh;

  /**
   * The motes' shared material.
   */
  mote: MeshBasicMaterial;

  /**
   * The motes.
   */
  motes: Mesh[];
}

/**
 * Patches of ground infused weapons leave (`PatchState`): scorched ground
 * glowing with embers (Hellfire Hammer), a burning fire trail (Pyre Bow),
 * and drifting clouds of incense smoke (Censer Flail, Thurible of
 * Judgment), each fading as it runs out. Pooled like `Puddles`; the flames
 * and light over the burning ones come from `LightCollector`.
 */
export class GroundPatches {
  /**
   * Every patch mesh.
   */
  readonly group = new Group();

  /**
   * The patches to draw, from the latest world state.
   */
  patches: PatchState[] = [];

  /**
   * The pool of patches.
   */
  private _slots: Slot[] = [];

  /**
   * Fills the pool with hidden patches.
   */
  constructor() {
    for (let i = 0; i < PATCH_POOL; i++) {
      const group = new Group();
      const disc = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const middle = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const mote = new MeshBasicMaterial({ transparent: true, depthWrite: false });
      const inner = new Mesh(DISC, middle);
      inner.position.y = 0.006;
      const motes = Array.from({ length: PATCH_MOTES }, (): Mesh => new Mesh(MOTE, mote));
      group.add(new Mesh(DISC, disc), inner, ...motes);
      group.visible = false;
      this.group.add(group);
      this._slots.push({ group, disc, middle, inner, mote, motes });
    }
  }

  /**
   * Takes the latest patches.
   * @param patches Every patch on the map.
   */
  set(patches: PatchState[]): void {
    this.patches = patches;
  }

  /**
   * Places each patch, fades it as it runs out, pulses its middle, and
   * lifts its motes (embers and licks of fire rise and wink out, smoke
   * swells as it drifts up).
   * @param time Seconds since the renderer started.
   * @param ground Ground height at a tile-space point.
   */
  update(time: number, ground: (x: number, y: number) => number): void {
    this._slots.forEach((slot: Slot, i: number): void => {
      const p = this.patches[i];
      slot.group.visible = !!p;
      if (!p) {
        return;
      }
      const look = PATCH_LOOKS[p.kind];
      const { x, z } = toWorld(p.x, p.y);
      slot.group.position.set(x, ground(p.x, p.y) + PATCH_LIFT, z);
      const fade = Math.min(1, p.life * 4);
      const pulse = 1 - PATCH_PULSE.depth * (0.5 + 0.5 * Math.sin(time * PATCH_PULSE.rate + p.id));
      slot.group.children[0].scale.set(p.radius, 1, p.radius);
      slot.inner.scale.set(p.radius * 0.6, 1, p.radius * 0.6);
      slot.disc.color.set(look.disc);
      slot.middle.color.set(look.middle);
      slot.mote.color.set(look.mote);
      slot.disc.opacity = look.discOpacity * fade;
      slot.middle.opacity = look.middleOpacity * fade * pulse;
      slot.mote.opacity = look.moteOpacity * fade;
      slot.motes.forEach((mote: Mesh, m: number): void => {
        const cycle = (time * look.speed + m * 0.41 + p.id * 0.17) % 1;
        const angle = m * 2.4 + p.id * 1.3 + (look.grow > 0 ? time * 0.4 : 0);
        const r = p.radius * (0.15 + ((m * 0.31) % 0.65));
        mote.position.set(Math.cos(angle) * r, cycle * look.rise, Math.sin(angle) * r);
        mote.scale.setScalar(look.size * (look.grow > 0 ? 0.6 + cycle * look.grow : 1 - cycle) * fade);
        mote.rotation.set(time + m, time * 0.7 + m, 0);
      });
    });
  }

  /**
   * Frees the patch materials.
   */
  dispose(): void {
    for (const slot of this._slots) {
      slot.disc.dispose();
      slot.middle.dispose();
      slot.mote.dispose();
    }
  }
}
