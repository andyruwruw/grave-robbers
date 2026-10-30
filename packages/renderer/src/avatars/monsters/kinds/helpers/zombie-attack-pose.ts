// Local Imports
import { ZOMBIE_ATTACK_TIME } from '../../config/monster-motion';
import { ZOMBIE_REAR_END, ZOMBIE_SLAM_END } from '../config/zombie';

/**
 * How far into its attack a zombie is: `raise` (0..1) rears the arms and
 * head up, then `slam` (0..1) drives them down with a lunge.
 * @param age Seconds since the attack started.
 * @returns The raise and slam.
 */
export const zombieAttackPose = (age: number): { raise: number; slam: number } => {
  const a = age / ZOMBIE_ATTACK_TIME;
  if (a >= 1) {
    return { raise: 0, slam: 0 };
  }
  if (a < ZOMBIE_REAR_END) {
    const t = a / ZOMBIE_REAR_END;
    return { raise: 1 - (1 - t) * (1 - t), slam: 0 };
  }
  if (a < ZOMBIE_SLAM_END) {
    const t = (a - ZOMBIE_REAR_END) / (ZOMBIE_SLAM_END - ZOMBIE_REAR_END);
    return { raise: 1 - t, slam: t * t };
  }
  const t = (a - ZOMBIE_SLAM_END) / (1 - ZOMBIE_SLAM_END);
  return { raise: 0, slam: (1 - t) * (1 - t) };
};
