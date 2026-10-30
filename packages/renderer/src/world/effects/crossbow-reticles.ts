// Packages
import {
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { NO_BLOOM_LAYER } from '../../effects/post/config/post';
import { ScenePart } from '../scene-part';
import {
  RETICLE_COLOR,
  RETICLE_LIFT,
  RETICLE_OPACITY,
  RETICLE_TICK,
} from './config/reticles';

// Types
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';

/**
 * The dim target over every monster a crossbow is locked onto: four
 * corner ticks in a slowly turning square, pooled and made as needed.
 */
export class CrossbowReticles extends ScenePart {
  /**
   * Every target made so far.
   */
  private _reticles: Group[] = [];

  /**
   * The ticks' material.
   */
  private _reticleMaterial = new MeshBasicMaterial({ color: RETICLE_COLOR, transparent: true, opacity: RETICLE_OPACITY, depthWrite: false, depthTest: false });

  /**
   * Scratch box for a monster's height.
   */
  private _reticleBox = new Box3();

  /**
   * Puts a dim target over every monster a crossbow is locked onto.
   * @param time Clock seconds.
   * @param avatars Every player's avatar.
   * @param monsters Every monster's avatar.
   */
  update(time: number, avatars: ReadonlyMap<string, PlayerAvatar>, monsters: ReadonlyMap<number, MonsterAvatar>): void {
    const locked = new Set([...avatars.values()].map((a: PlayerAvatar): number | null => a.target.aimTarget).filter((id): id is number => id !== null));
    let used = 0;
    for (const id of locked) {
      const monster = monsters.get(id);
      if (!monster) {
        continue;
      }
      if (used === this._reticles.length) {
        const reticle = new Group();
        for (let i = 0; i < 4; i++) {
          const corner = new Group();
          corner.rotation.y = (i * Math.PI) / 2;
          const a = new Mesh(RETICLE_TICK, this._reticleMaterial);
          a.position.set(0.22, 0, 0.3);
          const b = new Mesh(RETICLE_TICK, this._reticleMaterial);
          b.rotation.y = Math.PI / 2;
          b.position.set(0.3, 0, 0.22);
          for (const tick of [a, b]) {
            tick.renderOrder = 20;
            tick.layers.set(NO_BLOOM_LAYER);
          }
          corner.add(a, b);
          reticle.add(corner);
        }
        this.scene.add(reticle);
        this._reticles.push(reticle);
      }
      const reticle = this._reticles[used++];
      reticle.visible = true;
      const top = this._reticleBox.setFromObject(monster.group).max.y;
      reticle.position.set(monster.group.position.x, top + RETICLE_LIFT, monster.group.position.z);
      reticle.rotation.y = time * 1.5;
      reticle.scale.setScalar(1 + Math.sin(time * 8) * 0.06);
    }
    for (let i = used; i < this._reticles.length; i++) {
      this._reticles[i].visible = false;
    }
  }
}
