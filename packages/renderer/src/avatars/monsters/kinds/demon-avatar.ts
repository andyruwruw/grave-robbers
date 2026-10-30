// Packages
import {
  Group,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { ChargingMonsterAvatar } from '../charging-monster-avatar';
import { BLINK_FADE, HEAD_TURN } from '../config/monster-motion';
import { SWOOSH } from '../config/monster-palette';
import {
  DEMON_CLAW,
  DEMON_EMBER,
  DEMON_EYE,
  DEMON_HIDE,
  DEMON_HORN,
  DEMON_IDLE,
  DEMON_SHADOW,
  DEMON_SOLID,
  DEMON_STALK,
} from './config/demon';

// Types
import type { Mesh, Object3D } from 'three';
import type { TrailStyle } from '../types/trail-style';

/**
 * A demon: a see-through shadow that slithers, steps out of the dark, and
 * lunges to bite.
 */
export class DemonAvatar extends ChargingMonsterAvatar {
  /**
   * Its trails of smoke, each a chain of segments.
   */
  private _streams: Group[][] = [];

  /**
   * How solid it looks right now.
   */
  private _fade = DEMON_IDLE;

  /**
   * Its hinged jaw.
   */
  private _jaw = new Group();

  /**
   * How much it's slithering, eased toward 1 while it moves.
   */
  private _glide = 0;

  /**
   * A demon: a ghost made of shadow, low to the ground. A dark torso and
   * hunched shoulders, and a horned head with slanted burning eyes and a
   * hinged jaw of pale fangs over an ember maw; behind, its body comes
   * apart into three rippling trails of smoke. Everything is see-through,
   * more so while it stalks (see `animate`).
   */
  protected build(): void {
    const { box } = this._parts;
    this._size = 1.2;
    this.body.add(
      ...this._parts.roundedBox([0.34, 0.18, 0.36], [0.05, 0.3, 0], DEMON_SHADOW),
      ...this._parts.roundedBox([0.2, 0.12, 0.42], [0.12, 0.38, 0], DEMON_HIDE),
      box([0.02, 0.08, 0.02], [0.225, 0.32, -0.07], DEMON_EMBER, true),
      box([0.02, 0.05, 0.02], [0.225, 0.29, 0.06], DEMON_EMBER, true),
    );
    for (const z of [-0.1, 0, 0.1]) {
      let parent: Group = this.body;
      const stream: Group[] = [];
      for (let i = 0; i < 4; i++) {
        const seg = new Group();
        seg.position.set(i === 0 ? -0.1 : -0.13, i === 0 ? 0.28 : -0.015, i === 0 ? z : 0);
        seg.add(box([0.16, 0.13 - i * 0.025, 0.14 - i * 0.025], [-0.07, 0, 0], i % 2 === 0 ? DEMON_SHADOW : DEMON_HIDE));
        parent.add(seg);
        stream.push(seg);
        parent = seg;
      }
      this._streams.push(stream);
    }
    /**
     * Builds one curled horn.
     * @param side Which side of the head (-1 or 1).
     * @returns The horn.
     */
    const horn = (side: number): Group => {
      const g = new Group();
      g.position.set(-0.02, 0.15, 0.07 * side);
      g.rotation.x = 0.5 * side;
      const tip = box([0.03, 0.08, 0.03], [-0.03, 0.12, 0], DEMON_HORN);
      tip.rotation.z = 0.7;
      g.add(box([0.045, 0.09, 0.045], [0, 0.045, 0], DEMON_HORN), tip);
      return g;
    };
    /**
     * Builds one glowing eye, tilted outward.
     * @param side Which side of the face (-1 or 1).
     * @returns The eye.
     */
    const eye = (side: number): Mesh => {
      const mesh = box([0.02, 0.022, 0.055], [0.095, 0.1, 0.045 * side], DEMON_EYE, true);
      mesh.rotation.x = -0.35 * side;
      return mesh;
    };
    this._jaw.position.set(-0.04, 0.02, 0);
    this._jaw.add(
      box([0.17, 0.05, 0.16], [0.08, -0.025, 0], DEMON_HIDE),
      box([0.02, 0.035, 0.03], [0.155, 0.012, -0.05], DEMON_CLAW),
      box([0.02, 0.035, 0.03], [0.155, 0.012, 0.05], DEMON_CLAW),
      box([0.02, 0.025, 0.02], [0.155, 0.008, 0], DEMON_CLAW),
    );
    this._head.position.set(0.25, 0.37, 0);
    this._head.add(
      ...this._parts.roundedBox([0.18, 0.13, 0.18], [0, 0.1, 0], DEMON_HIDE),
      eye(-1),
      eye(1),
      box([0.02, 0.03, 0.03], [0.09, 0.035, -0.05], DEMON_CLAW),
      box([0.02, 0.03, 0.03], [0.09, 0.035, 0.05], DEMON_CLAW),
      box([0.06, 0.03, 0.1], [0.05, 0.03, 0], DEMON_EMBER, true),
      horn(-1),
      horn(1),
      this._jaw,
    );
    this.body.add(this._head);
    for (const material of this._parts.materials) {
      material.transparent = true;
      material.depthWrite = false;
    }
    this.body.traverse((o: Object3D): void => {
      o.castShadow = false;
    });
  }

  /**
   * A streak behind its jaws.
   * @returns The style.
   */
  protected trailStyle(): TrailStyle {
    return { points: [[this._head, [0.15, 0, 0]]], color: SWOOSH, opacity: 0.14, size: 0.14 };
  }

  /**
   * Slithers low to the ground, swaying side to side as it goes, its trails
   * of smoke rippling out behind (harder when it moves, still while it
   * attacks). To bite it rears its head back and up with its jaw gaping,
   * then lunges and snaps it shut. It's faint while it stalks someone and
   * turns solid as it attacks; just after stepping out of the shadows it's
   * squashed flat and pulls itself up. Fades only its own body's
   * materials (the swoosh sets its own opacity after this).
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   */
  protected animate(dt: number, time: number): void {
    const t = this.target;
    const { charge, strike } = this.attackPhase();
    const attacking = Math.max(charge, strike);
    this._glide += ((t.moving && attacking === 0 ? 1 : 0) - this._glide) * Math.min(1, dt * 4);
    const move = this._glide;
    const ph = this._gait.phase;
    this.body.position.y = 0.03 + Math.sin(time * 1.8 + ph) * 0.015 + charge * 0.06;
    this.body.position.x = strike * 0.1;
    this.body.rotation.z = Math.sin(time * 1.1 + ph) * 0.03 + charge * 0.2 - strike * 0.2;
    this.body.rotation.x = Math.sin(ph) * 0.08 * move;
    this.body.rotation.y = Math.sin(ph) * 0.18 * move;
    const calm = 1 - 0.75 * attacking;
    this._streams.forEach((stream: Group[], s: number): void => {
      stream.forEach((seg: Group, i: number): void => {
        seg.rotation.y = Math.sin(time * (3 + move * 2) + i * 0.9 + s * 1.7) * (0.25 + move * 0.2) * calm;
        seg.rotation.z = (Math.sin(time * 2.3 + i * 1.1 + s) * 0.18 + 0.05 * i) * calm;
      });
    });
    if (time >= this._nextLookAt) {
      this._nextLookAt = time + 2 + Math.random() * 3;
      this._headTarget = (Math.random() * 2 - 1) * HEAD_TURN;
    }
    this._head.rotation.y = t.hunting || attacking > 0 ? 0 : this._headTarget * 0.6;
    this._head.rotation.z = -0.05 + charge * 0.45 - strike * 0.35;
    this._head.position.x = 0.25 - charge * 0.07 + strike * 0.12;
    this._jaw.rotation.z = -0.95 * charge - 0.15 * (t.hunting && attacking === 0 ? 1 : 0) - Math.max(0, 0.6 - strike * 3) * (strike > 0 ? 1 : 0);
    const s = this._blink.age / BLINK_FADE;
    this.body.scale.set(1.4 - 0.4 * s, 0.2 + 0.8 * s, 1.4 - 0.4 * s);
    const want = attacking > 0 ? DEMON_SOLID : t.hunting ? DEMON_STALK : DEMON_IDLE;
    this._fade += (want - this._fade) * Math.min(1, dt * (want > this._fade ? 10 : 2));
    for (const material of this._parts.materials) {
      material.opacity = material instanceof MeshBasicMaterial ? Math.min(1, this._fade * 1.4) : this._fade;
    }
  }
}
