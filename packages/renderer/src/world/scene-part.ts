// Types
import type { OrthographicCamera, Scene } from 'three';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { WorldContext } from './world-context';

/**
 * One part of the TV's scene (the camera, the chunks, the avatars, an
 * effect): holds the shared `WorldContext` and reads its scene, camera, and
 * map live, never as copies, since the map is replaced with each world.
 */
export abstract class ScenePart {
  /**
   * Keeps the shared context.
   * @param _ctx What every part of the scene shares.
   */
  constructor(protected readonly _ctx: WorldContext) {}

  /**
   * Everything drawn.
   * @returns The scene.
   */
  protected get scene(): Scene {
    return this._ctx.scene;
  }

  /**
   * The camera.
   * @returns The camera.
   */
  protected get camera(): OrthographicCamera {
    return this._ctx.camera;
  }

  /**
   * The map as this screen has it, or null before a world arrives.
   * @returns The map.
   */
  protected get map(): WorldMap | null {
    return this._ctx.map;
  }
}
