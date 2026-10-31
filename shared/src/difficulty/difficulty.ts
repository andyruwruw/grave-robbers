/**
 * One step of the server's difficulty: its name, and what it scales the
 * damage players take (from monsters and the world, never each other) and
 * the damage monsters take from everything. Nothing a player sees changes:
 * weapon stats and armor stay the same, monsters just last longer or hurt
 * more.
 */
export interface DifficultyLevel {
  /**
   * Its name on the admin's slider.
   */
  label: string;

  /**
   * What the damage players take is multiplied by.
   */
  taken: number;

  /**
   * What the damage monsters take is multiplied by.
   */
  dealt: number;
}

/**
 * The difficulty levels, 1 (easiest) to 5 (hardest), by level. The middle
 * one changes nothing; the steps between the ends and the middle are
 * halfway.
 */
export const DIFFICULTY_LEVELS: Record<number, DifficultyLevel> = {
  1: { label: 'Easy', taken: 0.7, dealt: 1.3 },
  2: { label: 'Gentle', taken: 0.85, dealt: 1.15 },
  3: { label: 'Normal', taken: 1, dealt: 1 },
  4: { label: 'Hard', taken: 1.375, dealt: 0.85 },
  5: { label: 'Hardest', taken: 1.75, dealt: 0.7 },
};

/**
 * The easiest and hardest levels, and the one a server starts on.
 */
export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 5;
export const DIFFICULTY_DEFAULT = 3;

/**
 * A difficulty level, rounded and kept in range.
 *
 * @param level Any number.
 * @returns A level from DIFFICULTY_MIN to DIFFICULTY_MAX.
 */
export function clampDifficulty(level: number): number {
  return Number.isFinite(level) ? Math.min(DIFFICULTY_MAX, Math.max(DIFFICULTY_MIN, Math.round(level))) : DIFFICULTY_DEFAULT;
}

/**
 * What a difficulty level does.
 *
 * @param level The level.
 * @returns Its scales.
 */
export function difficultyOf(level: number): DifficultyLevel {
  return DIFFICULTY_LEVELS[clampDifficulty(level)];
}
