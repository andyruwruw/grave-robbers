// Packages
import {
  BoxGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { STRUCTURE_KINDS } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { toWorld } from '../../space/world-coords';
import { UNIT_BOX } from '../config/avatar';
import { BUILD_PREVIEW_SHAPES, PLACE_BLOCKED, PLACE_OK } from './config/build-preview-shapes';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { PlacePreview } from '../../types/build';

/**
 * The edges of a unit box, for the preview and blocker outlines.
 */
const UNIT_EDGES = new EdgesGeometry(new BoxGeometry(1, 1, 1));

/**
 * The outline marking the tile a player would act on, and while they place
 * a structure, a see-through preview of it and an outline around whatever
 * is in the way.
 */
export class BuildMarker {
  /**
   * The facing-tile outline and preview, in world space; the renderer adds
   * it to the scene.
   */
  readonly marker = new Group();

  /**
   * Light red outline around whatever stops a build, in world space; the
   * renderer adds it to the scene.
   */
  readonly blocker: LineSegments;

  /**
   * The outline's material, in the player's color.
   */
  private _markerMaterial: MeshBasicMaterial;

  /**
   * A chevron over the build preview pointing the way a turned structure
   * (a conveyor belt) will face.
   */
  private _turnArrow = new Group();

  /**
   * Each structure's see-through preview shape.
   */
  private _ghosts: Record<StructureKind, Group>;

  /**
   * The preview shapes' fill.
   */
  private _ghostMaterial: MeshBasicMaterial;

  /**
   * The preview shapes' edges.
   */
  private _ghostEdges: LineBasicMaterial;

  /**
   * The blocker outline's material.
   */
  private _blockerMaterial: LineBasicMaterial;

  /**
   * Builds the outline, the turn arrow, every preview shape, and the
   * blocker outline, all hidden.
   * @param color The player's color.
   */
  constructor(color: string) {
    const edge = new MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    this._markerMaterial = edge;
    for (const [w, d, ox, oz] of [[1, 0.06, 0, -0.47], [1, 0.06, 0, 0.47], [0.06, 1, -0.47, 0], [0.06, 1, 0.47, 0]]) {
      const bar = new Mesh(UNIT_BOX, edge);
      bar.scale.set(w, 0.02, d);
      bar.position.set(ox, 0.03, oz);
      this.marker.add(bar);
    }
    this.marker.visible = false;
    for (const side of [-1, 1]) {
      const arm = new Mesh(UNIT_BOX, edge);
      arm.scale.set(0.34, 0.03, 0.07);
      arm.position.set(-0.05, 0, side * 0.1);
      arm.rotation.y = side * 0.8;
      this._turnArrow.add(arm);
    }
    this._turnArrow.position.y = 0.3;
    this._turnArrow.visible = false;
    this.marker.add(this._turnArrow);

    this._ghostMaterial = new MeshBasicMaterial({ color: PLACE_OK, transparent: true, opacity: 0.05, depthWrite: false });
    this._ghostEdges = new LineBasicMaterial({ color: PLACE_OK, transparent: true, opacity: 0.3 });
    this._ghosts = Object.fromEntries(STRUCTURE_KINDS.map((kind: StructureKind): [StructureKind, Group] => {
      const [w, h, d] = BUILD_PREVIEW_SHAPES[kind];
      const ghost = new Group();
      ghost.add(new Mesh(UNIT_BOX, this._ghostMaterial), new LineSegments(UNIT_EDGES, this._ghostEdges));
      ghost.scale.set(w, h, d);
      ghost.position.y = h / 2;
      ghost.visible = false;
      this.marker.add(ghost);
      return [kind, ghost];
    })) as Record<StructureKind, Group>;
    this._blockerMaterial = new LineBasicMaterial({ color: PLACE_BLOCKED, depthTest: false, transparent: true });
    this.blocker = new LineSegments(UNIT_EDGES, this._blockerMaterial);
    this.blocker.renderOrder = 10;
    this.blocker.visible = false;
  }

  /**
   * Outlines the tile this player would act on in their color, or while
   * they're placing a structure, a dim white outline and see-through shape
   * of it, light red if it can't go there, with whatever is in the way
   * outlined light red too. Null hides it.
   * @param target The player's state.
   * @param tile The tile to mark, or null to hide.
   * @param place The structure being placed, if any.
   * @param height Ground height the marker sits at.
   * @param facing Which way a turned structure will face, or null.
   */
  show(target: PlayerState, tile: { tx: number; ty: number } | null, place: PlacePreview | null, height: number, facing: number | null): void {
    const shown = tile !== null && target.connected && !target.dead;
    this.marker.visible = shown;
    this._turnArrow.visible = facing !== null;
    if (facing !== null) {
      this._turnArrow.rotation.y = -facing;
    }
    for (const kind of STRUCTURE_KINDS) {
      this._ghosts[kind].visible = place?.kind === kind;
    }
    const blocker = shown && place ? place.blocker : null;
    this.blocker.visible = blocker !== null;
    if (blocker) {
      const { x, z } = toWorld(blocker.x, blocker.y);
      this.blocker.position.set(x, blocker.base + blocker.h / 2, z);
      this.blocker.scale.set(blocker.w, blocker.h, blocker.w);
    }
    if (!tile) {
      return;
    }
    const { x, z } = toWorld(tile.tx + 0.5, tile.ty + 0.5);
    this.marker.position.set(x, height, z);
    const color = !place ? target.color : place.valid ? PLACE_OK : PLACE_BLOCKED;
    this._markerMaterial.color.set(color);
    this._markerMaterial.opacity = place?.valid ? 0.3 : 0.8;
    this._ghostMaterial.color.set(color);
    this._ghostMaterial.opacity = place?.valid ? 0.05 : 0.12;
    this._ghostEdges.color.set(color);
    this._ghostEdges.opacity = place?.valid ? 0.3 : 0.7;
  }

  /**
   * Disposes the outline, preview, and blocker materials.
   */
  dispose(): void {
    this._markerMaterial.dispose();
    this._ghostMaterial.dispose();
    this._ghostEdges.dispose();
    this._blockerMaterial.dispose();
  }
}
