// Packages
import { InstancedMesh, Vector4 } from 'three';

// Types
import type { Material, Object3D, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three';

/**
 * Most things shaking trees at once (the strongest win), and how far
 * (tiles) a shake reaches, fading to nothing at the edge.
 */
const MAX_SOURCES = 6;
const REACH = 3.2;

/**
 * How far a tree's top moves per unit of height at full strength, and how
 * fast it shivers.
 */
const SWAY = 0.035;

/**
 * Something heavy nearby: where (world x, z) and how hard (0 is nothing,
 * 1 a footfall, more for a slam).
 */
export interface ShakeSource {
  x: number;
  z: number;
  strength: number;
}

/**
 * Makes trees shiver around heavy things (brutes) without rebuilding the
 * world: trees are baked into their own instanced mesh with each box's
 * tree base as `aSwayBase` (see `buildGraveyard`), and its material's
 * vertex shader pushes each box sideways by its height above that base,
 * scaled by how close and how hard the shake sources are.
 */
export class TreeSway {
  private sources = { value: Array.from({ length: MAX_SOURCES }, (): Vector4 => new Vector4()) };
  private time = { value: 0 };

  /**
   * Patches the tree mesh under `root` (call after the light map has
   * patched it, so both changes apply).
   */
  attach(root: Object3D): void {
    root.traverse((obj: Object3D): void => {
      if (obj instanceof InstancedMesh && obj.geometry.getAttribute('aSwayBase') && !obj.material.userData.swaying) {
        this.patch(obj.material as Material);
      }
    });
  }

  private patch(material: Material): void {
    material.userData.swaying = true;
    const before = material.onBeforeCompile;
    material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void => {
      before.call(material, shader, renderer);
      shader.uniforms.treeShake = this.sources;
      shader.uniforms.shakeTime = this.time;
      shader.vertexShader = `uniform vec4 treeShake[${MAX_SOURCES}];\nuniform float shakeTime;\nattribute vec3 aSwayBase;\n${shader.vertexShader.replace(
        '#include <project_vertex>',
        `vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        vec2 swayPush = vec2(0.0);
        for (int i = 0; i < ${MAX_SOURCES}; i++) {
          vec4 s = treeShake[i];
          float near = s.z * clamp(1.0 - distance(aSwayBase.xz, s.xy) / ${REACH.toFixed(1)}, 0.0, 1.0);
          swayPush += near * vec2(sin(shakeTime * 23.0 + aSwayBase.x * 3.1 + s.w), sin(shakeTime * 19.0 + aSwayBase.z * 2.7 + s.w));
        }
        mvPosition.xz += swayPush * max(0.0, mvPosition.y - aSwayBase.y) * ${SWAY.toFixed(3)};
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`,
      )}`;
    };
    material.needsUpdate = true;
  }

  /**
   * Sets this frame's shake sources (the strongest few).
   */
  update(time: number, sources: ShakeSource[]): void {
    this.time.value = time;
    const strongest = [...sources].sort((a: ShakeSource, b: ShakeSource): number => b.strength - a.strength);
    this.sources.value.forEach((v: Vector4, i: number): void => {
      const s = strongest[i];
      v.set(s?.x ?? 0, s?.z ?? 0, s?.strength ?? 0, i * 1.7);
    });
  }
}
