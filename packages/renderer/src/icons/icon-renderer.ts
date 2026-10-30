// Packages
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  InstancedMesh,
  OrthographicCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from 'three';

// Local Imports
import { buildIconModel } from '../models/items/icon-model';
import { ICON_PX, VIEW } from './config/icons';

// Types
import type { MeshLambertMaterial } from 'three';
import type { IconKey } from '../types/icons';

/**
 * Draws item icons offscreen: one small renderer, scene and camera, made
 * on first use, that each icon is drawn with and read back as an image.
 */
export class IconRenderer {
  /**
   * The renderer, scene and camera every icon is drawn with, made on first
   * use.
   */
  private _stage: { renderer: WebGLRenderer; scene: Scene; camera: OrthographicCamera } | null = null;

  /**
   * Draws the item's model. Without `spin` it's framed tightly; with it, the
   * model is turned that far around its middle and framed by its bounding
   * sphere, which holds it at any angle.
   * @param key What the icon shows.
   * @param spin How far the model is turned, in radians, or null for a still icon.
   * @returns The image's data URL.
   */
  render(key: IconKey, spin: number | null): string {
    if (!this._stage) {
      const renderer = new WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.setSize(ICON_PX, ICON_PX, false);
      const scene = new Scene();
      const sun = new DirectionalLight('#ffffff', 2.2);
      sun.position.set(-1, 3, 2);
      scene.add(new AmbientLight('#ffffff', 1.4), sun);
      this._stage = { renderer, scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0.01, 20) };
    }
    const { renderer, scene, camera } = this._stage;
    const built = buildIconModel(key);
    built.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(built);
    const sphere = bounds.getBoundingSphere(new Sphere());
    let model: Group = built;
    if (spin !== null) {
      model = new Group();
      const turn = new Group();
      built.position.sub(sphere.center);
      turn.add(built);
      turn.rotation.y = spin;
      model.add(turn);
      model.position.copy(sphere.center);
    }
    scene.add(model);
    model.updateMatrixWorld(true);
    camera.position.copy(sphere.center).add(VIEW.clone().multiplyScalar(sphere.radius * 4));
    camera.near = sphere.radius;
    camera.far = sphere.radius * 8;
    camera.lookAt(sphere.center);
    camera.updateMatrixWorld();
    if (spin !== null) {
      const half = sphere.radius * 0.85;
      camera.left = -half;
      camera.right = half;
      camera.top = half;
      camera.bottom = -half;
    } else {
      const seen = new Box3();
      for (let i = 0; i < 8; i++) {
        seen.expandByPoint(new Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).applyMatrix4(camera.matrixWorldInverse));
      }
      const half = Math.max(seen.max.x - seen.min.x, seen.max.y - seen.min.y) / 2;
      const cx = (seen.max.x + seen.min.x) / 2;
      const cy = (seen.max.y + seen.min.y) / 2;
      camera.left = cx - half;
      camera.right = cx + half;
      camera.top = cy + half;
      camera.bottom = cy - half;
    }
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    scene.remove(model);
    model.traverse((o) => {
      if (o instanceof InstancedMesh) {
        o.geometry.dispose();
        (o.material as MeshLambertMaterial).dispose();
      }
    });
    return renderer.domElement.toDataURL();
  }
}
