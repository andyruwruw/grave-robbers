// Packages
import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { WORKING_GLOW } from '@halloween/shared/structures';

// Local Imports
import { toWorld } from './build-graveyard';

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const BLOOD_GLOW = new Color('#ff2236');

/**
 * Where the gauge sits on an altar, from the tile's middle and ground (in
 * the trough `build-graveyard.ts` cuts along the front of the altar's top,
 * where the overhead camera sees it best), and its size when full.
 */
const GAUGE_Y = 0.667;
const GAUGE_Z = 0.265;
const GAUGE_WIDTH = 0.62;
const GAUGE_HEIGHT = 0.012;
const GAUGE_DEPTH = 0.11;

/**
 * How fast the glow pulses (radians per second) and how deep.
 */
const PULSE = 3;
const PULSE_DEPTH = 0.25;

/**
 * Glowing blood that fills the trough along a sacrificial altar's top for
 * as long as its last offering lasts, draining from right to left, with a
 * slow pulse.
 */
export class AltarGauges {
  readonly group = new Group();
  private material = new MeshBasicMaterial({ color: BLOOD_GLOW });
  private gauges = new Map<number, Mesh>();

  /**
   * Shows a gauge for each lit altar: tile, seconds of glow left, and the
   * ground height there.
   */
  update(altars: { tx: number; ty: number; fuel: number; height: number }[], time: number): void {
    const seen = new Set<number>();
    for (const { tx, ty, fuel, height } of altars) {
      const key = ty * 1000 + tx;
      seen.add(key);
      let gauge = this.gauges.get(key);
      if (!gauge) {
        gauge = new Mesh(UNIT_BOX, this.material);
        this.gauges.set(key, gauge);
        this.group.add(gauge);
      }
      const full = Math.max(0, Math.min(1, fuel / WORKING_GLOW));
      const { x, z } = toWorld(tx + 0.5, ty + 0.5);
      gauge.visible = full > 0;
      gauge.scale.set(Math.max(0.001, GAUGE_WIDTH * full), GAUGE_HEIGHT, GAUGE_DEPTH);
      gauge.position.set(x - GAUGE_WIDTH / 2 + (GAUGE_WIDTH * full) / 2, height + GAUGE_Y, z + GAUGE_Z);
    }
    for (const [key, gauge] of this.gauges) {
      if (!seen.has(key)) {
        this.group.remove(gauge);
        this.gauges.delete(key);
      }
    }
    const pulse = 1 - PULSE_DEPTH * (0.5 + 0.5 * Math.sin(time * PULSE));
    this.material.color.copy(BLOOD_GLOW).multiplyScalar(pulse);
  }

  dispose(): void {
    this.material.dispose();
  }
}
