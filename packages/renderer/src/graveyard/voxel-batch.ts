// Packages
import {
  BoxGeometry,
  Color,
  Euler,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
} from 'three';

/**
 * The unit box every loose piece is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * Most pieces a box is cut into along one axis when it breaks.
 */
const MAX_CUTS = 3;

/**
 * One box in a batch: center, size, color, and optional rotation.
 */
interface Voxel {
  /**
   * World-space center.
   */
  pos: [number, number, number];

  /**
   * Size along each axis.
   */
  size: [number, number, number];

  /**
   * Its color.
   */
  color: string;

  /**
   * Its rotation, if it's turned.
   */
  rot?: Euler;

  /**
   * Where its tree is rooted, for `TreeSway`.
   */
  anchor?: [number, number, number];
}

/**
 * Collects many colored boxes and bakes them into a single InstancedMesh,
 * so the whole static world is one draw call per material.
 */
export class VoxelBatch {
  /**
   * Every box added so far.
   */
  private _voxels: Voxel[] = [];

  /**
   * Where boxes added from now on are rooted (a tree's base), baked into
   * the mesh as `aSwayBase` for `TreeSway`, or null for none.
   */
  anchor: [number, number, number] | null = null;

  /**
   * Adds one box.
   * @param pos World-space center.
   * @param size Size along each axis.
   * @param color Its color.
   * @param rot Its rotation, if it's turned.
   */
  add(pos: [number, number, number], size: [number, number, number], color: string, rot?: Euler): void {
    this._voxels.push({ pos, size, color, rot, anchor: this.anchor ?? undefined });
  }

  /**
   * Every box as a loose mesh, for something breaking apart: boxes longer
   * than `chunk` along an axis are cut into up to MAX_CUTS pieces that way.
   * Materials come from `material` (by color), so callers can share them.
   * @param material The material for a color.
   * @param chunk Longest a piece may be along an axis, in world units.
   * @returns The loose pieces.
   */
  pieces(material: (color: string) => MeshLambertMaterial | MeshBasicMaterial, chunk: number): Mesh[] {
    const meshes: Mesh[] = [];
    const q = new Quaternion();
    const offset = new Vector3();
    for (const v of this._voxels) {
      q.setFromEuler(v.rot ?? new Euler());
      const [cx, cy, cz] = v.size.map((s: number): number => Math.min(MAX_CUTS, Math.max(1, Math.round(s / chunk))));
      const size: [number, number, number] = [v.size[0] / cx, v.size[1] / cy, v.size[2] / cz];
      for (let ix = 0; ix < cx; ix++) {
        for (let iy = 0; iy < cy; iy++) {
          for (let iz = 0; iz < cz; iz++) {
            const mesh = new Mesh(UNIT_BOX, material(v.color));
            offset.set((ix + 0.5) * size[0] - v.size[0] / 2, (iy + 0.5) * size[1] - v.size[1] / 2, (iz + 0.5) * size[2] - v.size[2] / 2).applyQuaternion(q);
            mesh.position.set(v.pos[0] + offset.x, v.pos[1] + offset.y, v.pos[2] + offset.z);
            mesh.quaternion.copy(q);
            mesh.scale.set(...size);
            mesh.castShadow = true;
            meshes.push(mesh);
          }
        }
      }
    }
    return meshes;
  }

  /**
   * Builds the mesh. `glow` boxes ignore lighting (jack-o'-lantern faces).
   * @param glow Whether the boxes ignore lighting.
   * @returns The instanced mesh of every box.
   */
  build(glow = false): InstancedMesh {
    const material = glow ? new MeshBasicMaterial() : new MeshLambertMaterial();
    const mesh = new InstancedMesh(new BoxGeometry(1, 1, 1), material, this._voxels.length);
    const m = new Matrix4();
    const q = new Quaternion();
    const c = new Color();
    this._voxels.forEach((v: Voxel, i: number): void => {
      q.setFromEuler(v.rot ?? new Euler());
      m.compose(new Vector3(...v.pos), q, new Vector3(...v.size));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(v.color));
    });
    if (this._voxels.some((v: Voxel): boolean => v.anchor !== undefined)) {
      mesh.geometry.setAttribute('aSwayBase', new InstancedBufferAttribute(new Float32Array(this._voxels.flatMap((v: Voxel): number[] => v.anchor ?? v.pos)), 3));
    }
    mesh.castShadow = !glow;
    mesh.receiveShadow = !glow;
    return mesh;
  }
}
