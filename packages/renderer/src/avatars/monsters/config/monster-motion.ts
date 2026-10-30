// Packages
import { DEMON_LUNGE_TIME } from '@halloween/shared/monsters/kinds/demon';
import { GHOUL_LEAP_TIME } from '@halloween/shared/monsters/kinds/ghoul';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * Radians of stride per second for each kind while it moves.
 */
export const GAIT: Record<MonsterKind, number> = { zombie: 8, vampire: 18, ghost: 8, brute: 3.2, skeleton: 9, witch: 6, ghoul: 8.5, demon: 5 };

/**
 * Fastest each kind turns its body, in radians per second.
 */
export const TURN_RATE: Record<MonsterKind, number> = { zombie: 1.8, vampire: 9, ghost: 3, brute: 1.3, skeleton: 5, witch: 3, ghoul: 8, demon: 6 };

/**
 * The faint streak a melee attack leaves: pool size per source, how long
 * each bit lingers, and how many bits fill the gap between frames.
 */
export const TRAIL_POOL = 32;

/**
 * How long each streak bit lingers, in seconds (see TRAIL_POOL).
 */
export const TRAIL_LIFE = 0.22;

/**
 * How many streak bits fill the gap between frames (see TRAIL_POOL).
 */
export const TRAIL_STEPS = 4;

/**
 * How long after the windup a melee attack keeps drawing its streak, per
 * kind (a ghoul's pounce and a demon's lunge carry it through the leap).
 */
export const SWOOSH_TIME: Record<MonsterKind, number> = { zombie: 0.18, vampire: 0.16, ghost: 0, brute: 0, skeleton: 0, witch: 0, ghoul: GHOUL_LEAP_TIME, demon: DEMON_LUNGE_TIME };

/**
 * Overall scale relative to a tile (players are 1.3).
 */
export const MONSTER_SCALE = 1.3;

/**
 * Hit reaction: how hard a blow kicks the head sideways, in radians per
 * second.
 */
export const KICK_YAW = 14;

/**
 * How hard a blow kicks the head back, in radians per second.
 */
export const KICK_PITCH = 10;

/**
 * How hard a blow rocks the body, in radians per second.
 */
export const KICK_RECOIL = 6;

/**
 * Stiffness of the spring that brings the hit reaction back.
 */
export const KICK_STIFFNESS = 90;

/**
 * Damping of the spring that brings the hit reaction back.
 */
export const KICK_DAMPING = 9;

/**
 * Seconds a lunge takes.
 */
export const LUNGE_TIME = 0.3;

/**
 * Seconds a stumble takes.
 */
export const STUMBLE_TIME = 0.9;

/**
 * A zombie's windup: the server's telegraph.
 */
export const ZOMBIE_WINDUP = MONSTERS.zombie.windup;

/**
 * A zombie's whole attack (also used for chewing walls, and by kinds with
 * no attack of their own): rearing up through its windup, slamming down,
 * then recovering.
 */
export const ZOMBIE_ATTACK_TIME = ZOMBIE_WINDUP + 0.45;

/**
 * Seconds an attack of the newer kinds plays on after its windup.
 */
export const FOLLOW_THROUGH = 0.45;

/**
 * How long a demon takes to pull itself together after stepping out of the
 * shadows.
 */
export const BLINK_FADE = 0.35;

/**
 * Most a monster turns its head, in radians.
 */
export const HEAD_TURN = 0.8;

/**
 * How quickly a zombie's head usually creeps around.
 */
export const HEAD_CREEP = 1.1;

/**
 * How quickly a zombie's head sometimes jerks around.
 */
export const HEAD_SNAP = 4;

/**
 * Arm pitch out in front.
 */
export const ARM_OUT = 0;

/**
 * Arm pitch half down.
 */
export const ARM_HALF = -0.9;

/**
 * Arm pitch hanging.
 */
export const ARM_DOWN = -1.35;

/**
 * Shortest an idle mood lasts, in seconds.
 */
export const MOOD_MIN = 4;

/**
 * How much longer than MOOD_MIN an idle mood may last, in seconds.
 */
export const MOOD_SPREAD = 6;
