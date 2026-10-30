// Packages
import {
  Group,
  InstancedMesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { buildGraveyard } from '../../graveyard/graveyard-builder';
import { isGround } from '../../graveyard/helpers/tile-queries';
import { disposeVoxels } from '../../helpers/dispose-voxels';
import { ScenePart } from '../scene-part';
import {
  CHUNK,
  CHUNK_BUILDS_PER_FRAME,
  CHUNK_KEEP_MARGIN,
  CHUNK_LOAD_MARGIN,
  SMALL_MAP_CHUNKS,
  VIEW_DEPTH_PAD,
} from './config/chunks';

// Types
import type { StaticLight } from '../../types/terrain';
import type { CameraRig } from '../camera/camera-rig';
import type { WorldContext } from '../world-context';

/**
 * The world's voxels, built in CHUNK x CHUNK tile pieces: a small map
 * whole, a bigger one only around the camera (a few chunks a frame), each
 * chunk with its permanent lights, rebuilt when a tile in it changes.
 */
export class TerrainChunks extends ScenePart {
  /**
   * Every built chunk.
   */
  readonly group = new Group();

  /**
   * The permanent lights (pumpkins, candles, lamps) of every built chunk.
   */
  staticLights: StaticLight[] = [];

  /**
   * The built chunks by chunk index (row-major), each with its lights.
   */
  private _chunks = new Map<number, { group: Group; lights: StaticLight[] }>();

  /**
   * The chunks a tile change needs rebuilt.
   */
  private _dirtyChunks = new Set<number>();

  /**
   * Starts with nothing built.
   * @param ctx What every part of the scene shares.
   * @param _rig The camera, whose view decides which chunks to build.
   * @param _growingKeys The tile indexes drawn on their own while they grow
   *   in, left out of the chunks.
   */
  constructor(ctx: WorldContext, private _rig: CameraRig, private _growingKeys: () => Iterable<number>) {
    super(ctx);
  }

  /**
   * Throws away every chunk and builds the ones in view again (a new
   * world, or the editor's x-ray switching).
   */
  rebuild(): void {
    this.clear();
    this.ensure(Infinity);
    this._ctx.fog.setMap(this.map!, this._ctx.seed);
  }

  /**
   * Throws away every chunk.
   */
  clear(): void {
    disposeVoxels(this.group);
    this._chunks.clear();
    this._dirtyChunks.clear();
    this.staticLights = [];
  }

  /**
   * Marks the chunk holding tile index `i` for a rebuild, and its
   * neighbors too when the tile sits on its edge (walls and undergrowth
   * reach across).
   * @param i The tile index.
   */
  markDirty(i: number): void {
    const tx = i % this._ctx.mapWidth;
    const ty = Math.floor(i / this._ctx.mapWidth);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = Math.floor((tx + dx) / CHUNK);
        const cy = Math.floor((ty + dy) / CHUNK);
        if (cx >= 0 && cy >= 0 && cx < this.chunkCols() && cy < this.chunkRows()) {
          this._dirtyChunks.add(cy * this.chunkCols() + cx);
        }
      }
    }
  }

  /**
   * Builds the chunks in view that are missing or dirty (at most `budget`
   * of them, so walking into new ground doesn't stall a frame) and drops
   * ones well out of view, then gathers their permanent lights.
   * @param budget Most chunks to build.
   */
  ensure(budget = CHUNK_BUILDS_PER_FRAME): void {
    if (!this.map) {
      return;
    }
    const keep = this.chunksInView(CHUNK_KEEP_MARGIN);
    let changed = false;
    for (const [key, chunk] of this._chunks) {
      if (!keep.has(key)) {
        disposeVoxels(chunk.group);
        this.group.remove(chunk.group);
        this._chunks.delete(key);
        this._dirtyChunks.delete(key);
        changed = true;
      }
    }
    const want = this.chunksInView(CHUNK_LOAD_MARGIN);
    const todo = [...want].filter((key: number): boolean => !this._chunks.has(key) || this._dirtyChunks.has(key));
    for (const key of todo.slice(0, budget)) {
      this.buildChunk(key);
      this._dirtyChunks.delete(key);
      changed = true;
    }
    if (changed) {
      this.staticLights = [...this._chunks.values()].flatMap((c: { lights: StaticLight[] }): StaticLight[] => c.lights);
      this.showGlow();
    }
  }

  /**
   * Shows or hides every glowing part of the voxels (pumpkin faces,
   * candles) for the Lights off switch.
   */
  showGlow(): void {
    this.group.traverse((o): void => {
      if (o instanceof InstancedMesh && o.material instanceof MeshBasicMaterial) {
        o.visible = !this._ctx.lightsOff;
      }
    });
  }

  /**
   * How many chunks across the map is.
   * @returns The column count.
   */
  private chunkCols(): number {
    return Math.ceil(this._ctx.mapWidth / CHUNK);
  }

  /**
   * How many chunks down the map is.
   * @returns The row count.
   */
  private chunkRows(): number {
    return Math.ceil(this._ctx.mapHeight / CHUNK);
  }

  /**
   * The chunks to keep built: all of a small map, else those within the
   * camera's view (plus `margin` chunks) around where it looks.
   * @param margin Extra chunks around the view.
   * @returns The chunk indexes.
   */
  private chunksInView(margin: number): Set<number> {
    const cols = this.chunkCols();
    const rows = this.chunkRows();
    const all = new Set<number>();
    if (cols * rows <= SMALL_MAP_CHUNKS) {
      for (let k = 0; k < cols * rows; k++) {
        all.add(k);
      }
      return all;
    }
    const center = this._rig.follow.at ?? { x: 0, z: 0 };
    const cx = center.x + this._ctx.mapWidth / 2;
    const cy = center.z + this._ctx.mapHeight / 2;
    const rx = this.camera.right + CHUNK * margin;
    const ry = this.camera.top / Math.sin(this._rig.cameraAngle) + CHUNK * margin + VIEW_DEPTH_PAD;
    for (let y = Math.max(0, Math.floor((cy - ry) / CHUNK)); y <= Math.min(rows - 1, Math.floor((cy + ry) / CHUNK)); y++) {
      for (let x = Math.max(0, Math.floor((cx - rx) / CHUNK)); x <= Math.min(cols - 1, Math.floor((cx + rx) / CHUNK)); x++) {
        all.add(y * cols + x);
      }
    }
    return all;
  }

  /**
   * Builds (or rebuilds) one chunk, leaving out tiles still growing in and,
   * under the x-ray, everything but ground, stairs, and the fence.
   * @param key The chunk index.
   */
  private buildChunk(key: number): void {
    const old = this._chunks.get(key);
    if (old) {
      disposeVoxels(old.group);
      this.group.remove(old.group);
    }
    const cols = this.chunkCols();
    const x = (key % cols) * CHUNK;
    const y = Math.floor(key / cols) * CHUNK;
    const region = { x, y, w: Math.min(CHUNK, this._ctx.mapWidth - x), h: Math.min(CHUNK, this._ctx.mapHeight - y) };
    const bare = new Set<number>();
    for (const i of this._growingKeys()) {
      bare.add(i);
    }
    if (this._ctx.xray) {
      for (let ty = region.y; ty < region.y + region.h; ty++) {
        for (let tx = region.x; tx < region.x + region.w; tx++) {
          const tile = this.map!.get(tx, ty);
          if (!isGround(tile) && tile !== 'stairs' && tile !== 'fence') {
            bare.add(ty * this._ctx.mapWidth + tx);
          }
        }
      }
    }
    const { group, lights } = buildGraveyard(this.map!, this._ctx.seed, bare, region);
    this._ctx.lightMap.darken(group);
    this._ctx.treeSway.attach(group);
    this.group.add(group);
    this._chunks.set(key, { group, lights });
  }
}
