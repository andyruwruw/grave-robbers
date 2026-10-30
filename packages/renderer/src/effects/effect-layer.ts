// Packages
import { Group } from 'three';

/**
 * An effect drawn as one group the world adds to its scene, stepped each
 * frame by the seconds since the last one, and disposed with the renderer.
 */
export abstract class EffectLayer {
  /**
   * Everything the effect draws.
   */
  readonly group = new Group();

  /**
   * Steps the effect.
   * @param dt Seconds since the last frame.
   */
  abstract update(dt: number): void;

  /**
   * Frees what the effect owns on the GPU.
   */
  abstract dispose(): void;
}
