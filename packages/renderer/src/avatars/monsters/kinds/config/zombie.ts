// Local Imports
import { ZOMBIE_ATTACK_TIME, ZOMBIE_WINDUP } from '../../config/monster-motion';

// Types
import type { ZombieMood } from '../types/moods';

/**
 * Skin tones a zombie may have.
 */
export const ZOMBIE_SKINS = ['#7fa36a', '#8a9a78', '#6f8f6a', '#a3a88a', '#9aa6b0', '#86745a'];

/**
 * Hair colors a zombie may have.
 */
export const ZOMBIE_HAIR = ['#3b4a2a', '#2a2420', '#5a4a30', '#8a8a80'];

/**
 * Ribs showing through.
 */
export const ZOMBIE_BONE = '#d8d2bc';

/**
 * Where the rear-up ends in a zombie's attack, as a fraction of it.
 */
export const ZOMBIE_REAR_END = ZOMBIE_WINDUP / ZOMBIE_ATTACK_TIME;

/**
 * Where the slam ends in a zombie's attack, as a fraction of it.
 */
export const ZOMBIE_SLAM_END = (ZOMBIE_WINDUP + 0.15) / ZOMBIE_ATTACK_TIME;

/**
 * How likely each idle mood is. Hunting zombies always reach. Each lasts
 * MOOD_MIN to MOOD_MIN + MOOD_SPREAD seconds.
 */
export const MOODS: [ZombieMood, number][] = [['reach', 0.3], ['slack', 0.35], ['one-up', 0.15], ['look', 0.2]];
