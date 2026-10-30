// Packages
import { InstancedMesh } from 'three';

// Types
import type { Group } from 'three';

/**
 * Disposes and removes every voxel batch under `group`.
 * @param group The group to empty.
 */
export function disposeVoxels(group: Group): void {
  group.traverse((obj): void => {
    if (obj instanceof InstancedMesh) {
      obj.geometry.dispose();
      obj.material.dispose();
    }
  });
  group.clear();
}
