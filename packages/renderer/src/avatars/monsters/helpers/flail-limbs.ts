// Types
import type { Object3D } from 'three';

/**
 * Kicks a monster's legs and flaps its arms and head while the TV's mouse
 * holds it up. Runs after its pose for the frame.
 *
 * @param limbs Its legs (kicked only when it has two).
 * @param armL Its left arm.
 * @param armR Its right arm.
 * @param head Its head.
 * @param phase Its walk phase (offsets the kick).
 * @param amount 0 (on the ground) to 1 (fully lifted).
 * @param time Seconds since the renderer started.
 */
export const flailLimbs = (limbs: Object3D[], armL: Object3D, armR: Object3D, head: Object3D, phase: number, amount: number, time: number): void => {
  const kick = Math.sin(time * 13 + phase) * 0.6 * amount;
  if (limbs.length === 2) {
    limbs[0].rotation.z = kick;
    limbs[1].rotation.z = -kick;
  }
  if (amount > 0) {
    armL.rotation.z += Math.sin(time * 9) * 0.6 * amount;
    armR.rotation.z += Math.sin(time * 9 + 2.5) * 0.6 * amount;
    head.rotation.z += Math.sin(time * 5) * 0.25 * amount;
  }
};
