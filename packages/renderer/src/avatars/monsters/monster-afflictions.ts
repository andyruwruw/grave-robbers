// Packages
import {
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { hasStatus } from '@halloween/shared/monsters/monster-status';

// Local Imports
import { NO_BLOOM_LAYER } from '../../effects/post/config/post';
import { UNIT_BOX } from '../config/avatar';
import {
  AFFLICTION_FADE,
  AFFLICTION_MOTES,
  AFFLICTION_STATUS,
  AFFLICTION_TINTS,
} from './config/afflictions';

// Types
import type { Affliction } from './types/affliction';

/**
 * One affliction's bits around the monster, once built.
 */
interface Bits {
  /**
   * The bits' group, in the avatar's group.
   */
  group: Group;

  /**
   * Their shared material, faded with the affliction.
   */
  material: MeshBasicMaterial;
}

/**
 * Every affliction, in the order they're stepped.
 */
const AFFLICTIONS = Object.keys(AFFLICTION_STATUS) as Affliction[];

/**
 * What's afflicting a monster, shown on its avatar (from the
 * `MonsterState.status` bits, see `docs/infusions.md`): a glow mixed into
 * its body (orange flickering while burning, purple cursed, green
 * poisoned, pale ecto slowed, steady teal when turned on the other
 * monsters) and bits around it (embers, curse wisps, poison drips, ecto
 * wisps, pinning spikes), built the first time each is needed. Each fades
 * in and out. The flames on a burning monster are `LightCollector`'s.
 */
export class MonsterAfflictions {
  /**
   * How strongly each affliction shows, 0 to 1.
   */
  private _strength: Record<Affliction, number> = { burning: 0, cursed: 0, poisoned: 0, slowed: 0, pinned: 0, turned: 0 };

  /**
   * Each affliction's bits, once built.
   */
  private _bits: Partial<Record<Affliction, Bits>> = {};

  /**
   * The mixed glow this frame.
   */
  private _tint = new Color();

  /**
   * Scratch: one affliction's share of the glow.
   */
  private _part = new Color();

  /**
   * Fades each affliction toward the status, animates its bits, and mixes
   * the body's glow.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param status The monster's `MonsterState.status`.
   * @param group The avatar's group, where the bits go.
   * @returns The glow to give the body (black for none).
   */
  update(dt: number, time: number, status: number, group: Group): Color {
    this._tint.setRGB(0, 0, 0);
    for (const kind of AFFLICTIONS) {
      const on = hasStatus(status, AFFLICTION_STATUS[kind]);
      const strength = Math.max(0, Math.min(1, this._strength[kind] + (on ? 1 : -1) * AFFLICTION_FADE * dt));
      this._strength[kind] = strength;
      const tint = AFFLICTION_TINTS[kind];
      if (tint && strength > 0) {
        const throb = tint.pulse ? 0.65 + 0.35 * Math.sin(time * tint.pulse) : 1;
        this._tint.add(this._part.set(tint.color).multiplyScalar(tint.amount * strength * throb));
      }
      this.animate(kind, strength, time, group);
    }
    return this._tint;
  }

  /**
   * Frees the bits' materials.
   */
  dispose(): void {
    for (const bits of Object.values(this._bits)) {
      bits.material.dispose();
    }
  }

  /**
   * Places an affliction's bits for this frame, building them the first
   * time they show, or hides them.
   * @param kind The affliction.
   * @param strength How strongly it shows, 0 to 1.
   * @param time Seconds since the renderer started.
   * @param group The avatar's group.
   */
  private animate(kind: Affliction, strength: number, time: number, group: Group): void {
    const look = AFFLICTION_MOTES[kind];
    if (!look || (strength <= 0 && !this._bits[kind])) {
      return;
    }
    const bits = this._bits[kind] ?? this.build(kind, group);
    bits.group.visible = strength > 0;
    if (strength <= 0) {
      return;
    }
    bits.material.opacity = look.opacity * strength;
    bits.group.children.forEach((bit, i: number): void => {
      const n = look.count;
      const spread = (i * Math.PI * 2) / n;
      if (kind === 'burning') {
        const cycle = (time * 1.3 + i * 0.29) % 1;
        bit.position.set(Math.cos(spread + i) * 0.2, 0.2 + cycle * 0.75, Math.sin(spread + i) * 0.2);
        bit.scale.setScalar(look.size * (1 - cycle));
      } else if (kind === 'cursed') {
        const a = time * 2.2 + spread;
        bit.position.set(Math.cos(a) * 0.34, 0.3 + 0.15 * Math.sin(time * 3 + i), Math.sin(a) * 0.34);
        bit.scale.setScalar(look.size * (0.8 + 0.2 * Math.sin(time * 5 + i)));
      } else if (kind === 'poisoned') {
        const cycle = (time * 0.9 + i * 0.27) % 1;
        bit.position.set(Math.cos(spread * 1.7) * 0.16, 0.55 * (1 - cycle * cycle), Math.sin(spread * 1.7) * 0.16);
        bit.scale.set(look.size, look.size * (1 + cycle), look.size);
      } else if (kind === 'slowed') {
        const a = time * 0.8 + spread;
        bit.position.set(Math.cos(a) * 0.38, 0.12 + ((i * 0.2 + time * 0.2) % 0.6), Math.sin(a) * 0.38);
        bit.scale.setScalar(look.size);
      } else {
        bit.position.set(Math.cos(spread + 0.4) * 0.28, 0.07, Math.sin(spread + 0.4) * 0.28);
        bit.rotation.set(Math.sin(spread + 0.4) * 0.5, 0, -Math.cos(spread + 0.4) * 0.5);
        bit.scale.set(look.size, look.size * 6 * strength, look.size);
      }
    });
  }

  /**
   * Builds an affliction's bits into the avatar's group.
   * @param kind The affliction.
   * @param group The avatar's group.
   * @returns The bits.
   */
  private build(kind: Affliction, group: Group): Bits {
    const look = AFFLICTION_MOTES[kind]!;
    const material = new MeshBasicMaterial({ color: look.color, transparent: true, depthWrite: false });
    const bits = { group: new Group(), material };
    for (let i = 0; i < look.count; i++) {
      const mesh = new Mesh(UNIT_BOX, material);
      mesh.layers.set(NO_BLOOM_LAYER);
      bits.group.add(mesh);
    }
    group.add(bits.group);
    this._bits[kind] = bits;
    return bits;
  }
}
