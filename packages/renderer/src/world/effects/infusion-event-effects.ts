// Packages
import { Vector3 } from 'three';

// Local Imports
import { toWorld } from '../../space/world-coords';
import { SHAKE_TIME } from '../camera/config/camera';
import { DIRT, FLAME_COLORS, SMOKE } from '../config/effect-colors';
import { ScenePart } from '../scene-part';
import {
  BLAST_COLORS,
  BLAST_FLASH,
  CHAIN_HEIGHT,
  CHAIN_SPARK,
  ESSENCE_GLOW,
  FLASH_LIFE,
  INFUSE_FLASH,
  INFUSE_GOLD,
  INFUSION_SHAKE,
  NOVA_COLORS,
  NOVA_FLASH,
  REFLECT_SPARK,
  RING_LIFT,
  SLAM_RING,
  SPRAY_CHIPS,
  WAIL_COLORS,
} from './config/infusion-effects';

// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { CameraRig } from '../camera/camera-rig';
import type { WorldContext } from '../world-context';

/**
 * Plays the one-off events infused weapons make (see `docs/infusions.md`):
 * chain lightning, death blasts, a Wailing Sickle's wail, ground slams and
 * fissures, a Hellmouth's spray, holy novas, Mirror Shield reflects, and
 * the sparkle at the anvil when a weapon is infused. Called by
 * `EventEffects.play` for every event.
 */
export class InfusionEventEffects extends ScenePart {
  /**
   * Keeps the camera rig, for the heavier hits' shake.
   * @param ctx What every part of the scene shares.
   * @param _rig The camera rig.
   */
  constructor(ctx: WorldContext, private _rig: CameraRig) {
    super(ctx);
  }

  /**
   * Plays one event if it's an infusion's.
   * @param e The event.
   */
  play(e: GameEvent): void {
    const { chips } = this._ctx;
    if (e.t === 'chain') {
      this._ctx.bolts.strike(e.points.map((p: { x: number; y: number }): Vector3 => this.at(p.x, p.y, CHAIN_HEIGHT)));
      for (const p of e.points.slice(1)) {
        chips.spark(p.x, p.y, CHAIN_SPARK, 5);
      }
    } else if (e.t === 'death-blast') {
      chips.spark(e.x, e.y, BLAST_COLORS.spark, 18);
      chips.puff(e.x, e.y, BLAST_COLORS.smoke, 14);
      chips.whirl(e.x, e.y, e.radius, e.ignite ? BLAST_COLORS.ember : BLAST_COLORS.spark, e.ignite ? 16 : 10);
      this.ring(e.x, e.y, e.radius, BLAST_COLORS.ring);
      this.flash(e.x, e.y, e.radius * BLAST_FLASH.reach, BLAST_COLORS.ring, BLAST_FLASH.intensity, FLASH_LIFE);
      this.shake(INFUSION_SHAKE.heavy);
    } else if (e.t === 'wail') {
      chips.whirl(e.x, e.y, e.radius, WAIL_COLORS.spark, 22);
      this.ring(e.x, e.y, e.radius, WAIL_COLORS.ring);
      this.ring(e.x, e.y, e.radius * 0.6, WAIL_COLORS.spark, 0.5);
    } else if (e.t === 'slam') {
      this.ring(e.x, e.y, e.radius, SLAM_RING);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        chips.puff(e.x + Math.cos(a) * e.radius * 0.6, e.y + Math.sin(a) * e.radius * 0.6, DIRT, 3);
      }
      this.shake(INFUSION_SHAKE.slam);
    } else if (e.t === 'fissure') {
      this._ctx.cracks.crack(e.x, e.y, e.angle, e.length, (x: number, y: number): number => this._ctx.elevation(x, y));
      for (let d = 0.5; d < e.length; d += 0.8) {
        chips.puff(e.x + Math.cos(e.angle) * d, e.y + Math.sin(e.angle) * d, DIRT, 4);
      }
      this.shake(INFUSION_SHAKE.heavy);
    } else if (e.t === 'flame-spray') {
      chips.jet(e.x, e.y, e.angle, e.cone, e.range, FLAME_COLORS, SPRAY_CHIPS);
    } else if (e.t === 'nova') {
      chips.whirl(e.x, e.y, e.radius, NOVA_COLORS.spark, 24);
      chips.spark(e.x, e.y, NOVA_COLORS.ring, 16);
      this.ring(e.x, e.y, e.radius, NOVA_COLORS.ring);
      this.flash(e.x, e.y, e.radius * NOVA_FLASH.reach, NOVA_COLORS.ring, NOVA_FLASH.intensity, FLASH_LIFE);
      this.shake(INFUSION_SHAKE.heavy);
    } else if (e.t === 'reflect') {
      chips.spark(e.x, e.y, REFLECT_SPARK, 10);
      this.ring(e.x, e.y, 0.5, REFLECT_SPARK, 0.2);
    } else if (e.t === 'infused') {
      const glow = ESSENCE_GLOW[e.infusion.essence];
      chips.spark(e.x, e.y, glow, 20);
      chips.spark(e.x, e.y, INFUSE_GOLD, 10);
      chips.whirl(e.x, e.y, 0.8, glow, 14);
      chips.puff(e.x, e.y, SMOKE, 6);
      this.ring(e.x, e.y, 1.2, glow, 0.6);
      this.flash(e.x, e.y, INFUSE_FLASH.radius, glow, INFUSE_FLASH.intensity, INFUSE_FLASH.life);
    }
  }

  /**
   * A world point at a tile-space point, some height over the ground.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param lift Height over the ground.
   * @returns The world point.
   */
  private at(x: number, y: number, lift: number): Vector3 {
    const { x: wx, z } = toWorld(x, y);
    return new Vector3(wx, this._ctx.elevation(x, y) + lift, z);
  }

  /**
   * Sets off a shockwave ring on the ground.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param radius How far it spreads, in tiles.
   * @param color Its color.
   * @param life Seconds it takes to spread and fade (the default if left out).
   */
  private ring(x: number, y: number, radius: number, color: string, life?: number): void {
    const p = this.at(x, y, RING_LIFT);
    this._ctx.rings.ring(p.x, p.y, p.z, radius, color, life);
  }

  /**
   * Lights a short burst of light.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param radius How far it reaches, in tiles.
   * @param color Its color.
   * @param intensity How bright it starts.
   * @param life Seconds it takes to fade.
   */
  private flash(x: number, y: number, radius: number, color: string, intensity: number, life: number): void {
    this._ctx.flashes.push({ x, y, radius, color, intensity, at: this._ctx.clock.elapsedTime, life });
  }

  /**
   * Shakes the screen (never less than a shake already going).
   * @param share How hard, as a share of a full shake.
   */
  private shake(share: number): void {
    this._rig.shake = Math.max(this._rig.shake, SHAKE_TIME * share);
  }
}
