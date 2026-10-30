// Types
import type { MonsterKind } from './monster-kinds';

/**
 * How a monster's attack lands once its windup ends: a melee hitbox in
 * front of it, an arrow, a lobbed potion, a pounce (a fixed leap), a lunge
 * (a dash just past its target, see DEMON_LUNGE), or a ghost's ectoplasm
 * (ghosts keep their own timing).
 */
export type AttackStyle = 'melee' | 'arrow' | 'potion' | 'pounce' | 'lunge' | 'ecto';

/**
 * How each kind's attack lands.
 */
export const ATTACK_STYLE: Record<MonsterKind, AttackStyle> = {
  zombie: 'melee',
  vampire: 'melee',
  ghost: 'ecto',
  brute: 'melee',
  skeleton: 'arrow',
  witch: 'potion',
  ghoul: 'pounce',
  demon: 'lunge',
};

/**
 * Stats for one kind of monster. Ghosts can't be hurt and never attack
 * players, so their hp and damage are unused.
 */
export interface MonsterDef {
  /**
   * Name shown in the kill feed.
   */
  label: string;

  /**
   * Health before the world level scales it (see `monsterHealth`).
   */
  hp: number;

  /**
   * Tiles per second.
   */
  speed: number;

  /**
   * Damage a hit does before the world level scales it (see `monsterDamage`).
   */
  damage: number;

  /**
   * Seconds from one attack starting to the next (windup included).
   */
  cooldown: number;

  /**
   * Seconds an attack winds up (shown on the TV) before it lands. The
   * monster stands its ground and turns to keep its target in front.
   */
  windup: number;

  /**
   * Half-width (radians) of a melee hitbox in front of it.
   */
  arc: number;

  /**
   * For ranged attacks and pounces, how far off it starts one; shooters
   * back away from anyone closer than `keep`.
   */
  range?: number;

  /**
   * How close a shooter lets a player get before backing away.
   */
  keep?: number;

  /**
   * Seconds before an attack lands that its aim stops following its target
   * (a ghoul's pounce, so stepping aside dodges it); without it, the aim
   * follows right up to the strike.
   */
  lock?: number;

  /**
   * How close (tile units, center to center) a player must be for a
   * melee attack to start; its hitbox reaches STRIKE_SLACK further, so
   * stepping away during the windup is what dodges it. A ghoul's pounce
   * hits anyone this close along its leap.
   */
  reach: number;

  /**
   * How far (tiles) it notices a player it has a clear line of sight to,
   * in front of it (within SIGHT_CONE of where it faces); any direction
   * counts within NEAR_SIGHT.
   */
  sight: number;

  /**
   * Seconds it keeps heading for where it last saw someone.
   */
  memory: number;

  /**
   * How far (tiles) its hits throw a player.
   */
  knockback?: number;
}

/**
 * Every monster kind's stats.
 */
export const MONSTERS: Record<MonsterKind, MonsterDef> = {
  zombie: { label: 'Zombie', hp: 10, speed: 1.6, damage: 2, cooldown: 0.9, windup: 0.35, arc: 1.2, reach: 1.1, sight: 7, memory: 6 },
  vampire: { label: 'Vampire', hp: 18, speed: 4.8, damage: 3, cooldown: 0.7, windup: 0.25, arc: 1, reach: 0.85, sight: 14, memory: 6 },
  ghost: { label: 'Ghost', hp: 8, speed: 1.3, damage: 0, cooldown: 0, windup: 0, arc: 0, reach: 0, sight: 6, memory: 0 },
  brute: { label: 'Brute', hp: 30, speed: 1.15, damage: 3.5, cooldown: 1.3, windup: 0.65, arc: 1.1, reach: 1, sight: 7, memory: 8, knockback: 2.4 },
  skeleton: { label: 'Skeleton', hp: 9, speed: 1.9, damage: 2, cooldown: 1.8, windup: 0.7, arc: 0, reach: 0.85, range: 6.5, keep: 3, sight: 9, memory: 6 },
  witch: { label: 'Witch', hp: 14, speed: 1.8, damage: 1.5, cooldown: 2.6, windup: 0.9, arc: 0, reach: 0.85, range: 6, keep: 4.5, sight: 8, memory: 8 },
  ghoul: { label: 'Ghoul', hp: 8, speed: 4.4, damage: 3.5, cooldown: 2, windup: 0.5, arc: 0, reach: 0.7, range: 3.6, lock: 0.3, sight: 9, memory: 6 },
  demon: { label: 'Demon', hp: 22, speed: 2.6, damage: 6.5, cooldown: 1.4, windup: 0.45, arc: 1, reach: 0.95, range: 3.6, lock: 0.12, sight: 12, memory: 10 },
};

/**
 * How much further than `reach` a melee hitbox lands.
 */
export const STRIKE_SLACK = 0.25;
