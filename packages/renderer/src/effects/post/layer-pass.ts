// Packages
import { Pass } from 'three/addons/postprocessing/Pass.js';

// Types
import type {
  Camera,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';

/**
 * Draws only one layer of the scene over what's already in the buffer,
 * depth-tested against it. The scene's background is hidden meanwhile,
 * since three.js clears the whole frame for a color background even with
 * autoClear off.
 */
export class LayerPass extends Pass {
  /**
   * Starts drawing nothing but `_layer`, without swapping buffers.
   * @param _scene The scene to draw.
   * @param _camera The camera to draw it with.
   * @param _layer The one layer to draw.
   */
  constructor(private _scene: Scene, private _camera: Camera, private _layer: number) {
    super();
    this.needsSwap = false;
  }

  /**
   * Draws the layer into the read buffer.
   * @param renderer The renderer.
   * @param _writeBuffer Unused: the layer goes into the read buffer.
   * @param readBuffer The buffer drawn so far.
   */
  render(renderer: WebGLRenderer, _writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    const autoClear = renderer.autoClear;
    const shadows = renderer.shadowMap.autoUpdate;
    const background = this._scene.background;
    renderer.autoClear = false;
    renderer.shadowMap.autoUpdate = false;
    this._scene.background = null;
    this._camera.layers.set(this._layer);
    renderer.setRenderTarget(readBuffer);
    renderer.render(this._scene, this._camera);
    this._camera.layers.set(0);
    this._scene.background = background;
    renderer.shadowMap.autoUpdate = shadows;
    renderer.autoClear = autoClear;
  }
}
