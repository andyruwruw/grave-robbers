// Packages
import {
  Box3,
  Group,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import { GRAVE_TILES } from '@halloween/shared/loot/graves';

// Local Imports
import { buildTile, buildTilePieces } from '../../graveyard/graveyard-builder';
import { isGround } from '../../graveyard/helpers/tile-queries';
import { buildShrub, shrubBetween } from '../../graveyard/shrubs';
import { disposeVoxels } from '../../helpers/dispose-voxels';
import { toWorld } from '../../space/world-coords';
import { DIRT, DUST } from '../config/effect-colors';
import { ScenePart } from '../scene-part';
import { DEBRIS_CHUNK, GROW_TIME, SINK_TIME } from './config/chunks';

// Types
import type { GrownTile } from '@halloween/shared/protocol/game-events';
import type { TileChange } from '@halloween/shared/world/tiles';
import type { PlayerAvatars } from '../actors/player-avatars';
import type { WorldContext } from '../world-context';
import type { TerrainChunks } from './terrain-chunks';

/**
 * Tiles changing on screen: whatever breaks bursts into chunks, dug-up
 * gravestones and the undergrowth of felled trees sink into the ground,
 * and new things grow in, each drawn on its own until it's done.
 */
export class TileAnimations extends ScenePart {
  /**
   * Things growing in, by tile index, drawn on their own (and left out of
   * their chunk) until they're done.
   */
  readonly growing = new Map<number, { tx: number; ty: number; tile: GrownTile; age: number; group: Group | null; height?: number }>();

  /**
   * Debris materials, by color and glow.
   */
  private _debrisMaterials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();

  /**
   * Gravestones and undergrowth sinking into the ground.
   */
  private _sinking: { x: number; y: number; age: number; group: Group; height: number }[] = [];

  /**
   * Starts with nothing moving.
   * @param ctx What every part of the scene shares.
   * @param _chunks The world's voxels, rebuilt once something has grown in.
   * @param _players The players, debris flies away from the nearest one.
   */
  constructor(ctx: WorldContext, private _chunks: TerrainChunks, private _players: PlayerAvatars) {
    super(ctx);
  }

  /**
   * Mirrors server tile changes; the next frame rebuilds the voxels.
   * Anything that broke (a structure, pumpkin, chest, felled tree, or
   * mined-out rock) bursts into chunks first, and a dug-up gravestone sinks
   * into the ground. Stumps rotting away just vanish.
   * @param changes The tile changes.
   */
  apply(changes: TileChange[]): void {
    if (!this.map) {
      return;
    }
    for (const c of changes) {
      const tx = c.i % this._ctx.mapWidth;
      const ty = Math.floor(c.i / this._ctx.mapWidth);
      const before = this.map.get(tx, ty);
      if (before === 'tree' && c.tile !== 'tree') {
        for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
          if (shrubBetween(this.map, tx, ty, dx, dy)) {
            const [ax, ay] = dx + dy > 0 ? [tx, ty] : [tx + dx, ty + dy];
            this.sinkShrub(ax, ay, Math.abs(dx), Math.abs(dy));
          }
        }
      }
      if (GRAVE_TILES.has(before) && c.tile === 'mound') {
        this.sink(tx, ty);
      } else if (!isGround(before) && before !== 'stump' && (isGround(c.tile) || c.tile === 'stump')) {
        this.shatter(tx, ty);
      }
    }
    this.map.apply(changes);
  }

  /**
   * Animates what's growing in, then what's sinking.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    this.updateGrowing(dt);
    this.updateSinking(dt);
  }

  /**
   * Frees the debris materials.
   */
  disposeDebris(): void {
    this._debrisMaterials.forEach((m): void => m.dispose());
  }

  /**
   * Frees whatever is still growing or sinking.
   */
  dispose(): void {
    this.growing.forEach(({ group }): void => {
      if (group) {
        disposeVoxels(group);
      }
    });
    this._sinking.forEach(({ group }): void => disposeVoxels(group));
  }

  /**
   * Draws a gravestone on its own so it can shudder down into the ground
   * (see `updateSinking`).
   * @param tx Tile x.
   * @param ty Tile y.
   */
  private sink(tx: number, ty: number): void {
    const group = new Group();
    group.add(buildTile(this.map!, this._ctx.seed, tx, ty));
    const { x, z } = toWorld(tx + 0.5, ty + 0.5);
    group.position.set(x, 0, z);
    this._ctx.lightMap.darken(group);
    this.scene.add(group);
    this._sinking.push({ x: tx + 0.5, y: ty + 0.5, age: 0, group, height: new Box3().setFromObject(group).max.y });
  }

  /**
   * Sinks the undergrowth between two trees into the ground, once one of
   * them falls.
   * @param tx Tile x of the western or northern tree.
   * @param ty Tile y of the western or northern tree.
   * @param dx 1 when the trees sit side by side.
   * @param dy 1 when the trees sit one above the other.
   */
  private sinkShrub(tx: number, ty: number, dx: number, dy: number): void {
    const group = buildShrub(this.map!, this._ctx.seed, tx, ty, dx, dy);
    this._ctx.lightMap.darken(group);
    this.scene.add(group);
    const x = tx + 0.5 + dx / 2;
    const y = ty + 0.5 + dy / 2;
    const at = toWorld(x, y);
    group.position.set(at.x, 0, at.z);
    this._sinking.push({ x, y, age: 0, group, height: new Box3().setFromObject(group).max.y });
  }

  /**
   * Breaks the current contents of a tile into chunks thrown away from the
   * nearest player.
   * @param tx Tile x.
   * @param ty Tile y.
   */
  private shatter(tx: number, ty: number): void {
    /**
     * A cached debris material for a color.
     * @param color The color.
     * @param glow Whether it ignores lighting.
     * @returns The material.
     */
    const material = (color: string, glow: boolean): MeshLambertMaterial | MeshBasicMaterial => {
      const key = `${color}|${glow}`;
      let m = this._debrisMaterials.get(key);
      if (!m) {
        m = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
        this._debrisMaterials.set(key, m);
      }
      return m;
    };
    const pieces = buildTilePieces(this.map!, this._ctx.seed, tx, ty, material, DEBRIS_CHUNK);
    const holder = new Group();
    holder.add(...pieces);
    this._ctx.lightMap.darken(holder);
    const x = tx + 0.5;
    const y = ty + 0.5;
    let angle = Math.random() * Math.PI * 2;
    let nearest = 3;
    for (const avatar of this._players.avatars.values()) {
      const d = Math.hypot(avatar.target.x - x, avatar.target.y - y);
      if (d < nearest) {
        nearest = d;
        angle = Math.atan2(y - avatar.target.y, x - avatar.target.x);
      }
    }
    this._ctx.gore.shatter(pieces, this._ctx.elevation(x, y), angle);
    this._ctx.chips.puff(x, y, DUST, 12);
    this._ctx.lightMap.darken(this._ctx.chips.group);
  }

  /**
   * Animates whatever just appeared, drawn on its own until it's done (then
   * its chunk is rebuilt with it in place): trees and chests rise out of
   * the ground with a shudder, pumpkins swell up from a bud.
   * @param dt Seconds since the last frame.
   */
  private updateGrowing(dt: number): void {
    for (const [i, g] of this.growing) {
      if (!this.map || this.map.get(g.tx, g.ty) !== g.tile) {
        if (g.group) {
          disposeVoxels(g.group);
          this.scene.remove(g.group);
        }
        this.growing.delete(i);
        this._chunks.markDirty(i);
        continue;
      }
      if (!g.group) {
        g.group = new Group();
        g.group.add(buildTile(this.map, this._ctx.seed, g.tx, g.ty));
        const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
        g.group.position.set(x, 0, z);
        g.height = new Box3().setFromObject(g.group).max.y;
        this._ctx.lightMap.darken(g.group);
        this.scene.add(g.group);
      }
      g.age += dt;
      const t = Math.min(1, g.age / GROW_TIME[g.tile]);
      if (g.tile === 'pumpkin') {
        const k = t < 1 ? 0.15 + 0.85 * (1 - (1 - t) ** 3) + Math.sin(t * Math.PI * 3) * 0.08 * (1 - t) : 1;
        g.group.scale.set(k, k, k);
      } else {
        const ease = 1 - (1 - t) ** 2;
        g.group.position.y = -(g.height ?? 1) * (1 - ease);
        const shudder = (1 - t) * 0.04;
        const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
        g.group.position.x = x + (Math.random() - 0.5) * shudder;
        g.group.position.z = z + (Math.random() - 0.5) * shudder;
        if (Math.random() < dt * 10 * (1 - t)) {
          this._ctx.chips.puff(g.tx + 0.5, g.ty + 0.5, DIRT, 2);
          this._ctx.lightMap.darken(this._ctx.chips.group);
        }
      }
      if (t >= 1) {
        disposeVoxels(g.group);
        this.scene.remove(g.group);
        this.growing.delete(i);
        this._chunks.markDirty(i);
      }
    }
  }

  /**
   * Dug-up gravestones shuddering down into their mounds, kicking up dirt,
   * gone once they're under.
   * @param dt Seconds since the last frame.
   */
  private updateSinking(dt: number): void {
    this._sinking = this._sinking.filter((s): boolean => {
      s.age += dt;
      const t = Math.min(1, s.age / SINK_TIME);
      const { x, z } = toWorld(s.x, s.y);
      const shudder = 0.06 * (1 - t * 0.5);
      s.group.position.set(x + (Math.random() - 0.5) * shudder, -s.height * t * t, z + (Math.random() - 0.5) * shudder);
      if (Math.random() < dt * 14) {
        this._ctx.chips.puff(s.x, s.y, DIRT, 2);
        this._ctx.lightMap.darken(this._ctx.chips.group);
      }
      if (t < 1) {
        return true;
      }
      disposeVoxels(s.group);
      this.scene.remove(s.group);
      return false;
    });
  }
}
