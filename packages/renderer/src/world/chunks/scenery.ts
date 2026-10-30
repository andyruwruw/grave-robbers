// Packages
import { Group } from 'three';

// Local Imports
import { buildOutskirts } from '../../graveyard/outskirts';
import { buildTower } from '../../graveyard/tower';
import { disposeVoxels } from '../../helpers/dispose-voxels';
import { ScenePart } from '../scene-part';

// Types
import type { PlayerAvatar } from '../../avatars/player/player-avatar';

/**
 * The scenery around the map: the outskirts beyond the fence, built as wide
 * as the view needs, and the watchtower's upper walls, cut away while a
 * player climbs inside.
 */
export class Scenery extends ScenePart {
  /**
   * The scenery beyond the fence.
   */
  readonly outskirts = new Group();

  /**
   * How far (tiles) past the map the built outskirts reach.
   */
  private _outskirtsSpan = { x: 0, y: 0 };

  /**
   * How far (tiles) past the map the view needs outskirts.
   */
  private _neededSpan = { x: 0, y: 0 };

  /**
   * The watchtower's upper walls and where it stands, or null.
   */
  private _tower: { back: Group; front: Group; x: number; y: number; w: number; h: number } | null = null;

  /**
   * Notes how far past the map the view now reaches, building more
   * outskirts if that's past what's built.
   * @param span How far (tiles) past the map the view needs outskirts.
   */
  fitSpan(span: { x: number; y: number }): void {
    this._neededSpan = span;
    if (this._neededSpan.x > this._outskirtsSpan.x || this._neededSpan.y > this._outskirtsSpan.y) {
      this.buildOutskirts();
    }
  }

  /**
   * (Re)builds the scenery beyond the fence, wide and tall enough to fill
   * the screen (none past a huge map's chasm, which falls off into the dark).
   */
  buildOutskirts(): void {
    if (!this.map) {
      return;
    }
    disposeVoxels(this.outskirts);
    if (this.map.edge === 'chasm') {
      return;
    }
    const { x, y } = this._neededSpan;
    const group = buildOutskirts(this.map, this._ctx.seed, x, y);
    this._ctx.lightMap.darken(group);
    this.outskirts.add(group);
    this._outskirtsSpan = { x, y };
  }

  /**
   * (Re)builds the watchtower's upper walls.
   */
  buildTower(): void {
    if (this._tower) {
      disposeVoxels(this._tower.back);
      disposeVoxels(this._tower.front);
      this.scene.remove(this._tower.back, this._tower.front);
    }
    this._tower = buildTower(this.map!, this._ctx.seed);
    if (this._tower) {
      this._ctx.lightMap.darken(this._tower.back);
      this._ctx.lightMap.darken(this._tower.front);
      this.scene.add(this._tower.back, this._tower.front);
    }
  }

  /**
   * Cuts the front of the tower away while a living player
   * is inside it, so they can be seen climbing.
   * @param avatars Every player's avatar.
   */
  updateTower(avatars: ReadonlyMap<string, PlayerAvatar>): void {
    if (!this._tower) {
      return;
    }
    const { x, y, w, h } = this._tower;
    const inside = [...avatars.values()].some(({ target: p }): boolean =>
      !p.dead && p.x > x && p.x < x + w && p.y > y && p.y < y + h + 0.5);
    this._tower.front.visible = !inside && !this._ctx.xray;
    this._tower.back.visible = !this._ctx.xray;
  }

  /**
   * Hides the tower for the map editor's x-ray, or shows it again.
   * @param on Whether the x-ray is on.
   */
  setXray(on: boolean): void {
    if (this._tower) {
      this._tower.back.visible = !on;
      this._tower.front.visible = !on;
    }
  }

  /**
   * Frees the outskirts' and the tower's voxels.
   */
  dispose(): void {
    disposeVoxels(this.outskirts);
    if (this._tower) {
      disposeVoxels(this._tower.back);
      disposeVoxels(this._tower.front);
    }
  }
}
