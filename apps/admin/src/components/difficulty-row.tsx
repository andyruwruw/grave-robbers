// Packages
import React from 'react';
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_MAX,
  DIFFICULTY_MIN,
  difficultyOf,
} from '@halloween/shared/difficulty/difficulty';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';

/**
 * Props for the DifficultyRow component.
 */
interface DifficultyRowProps {
  /**
   * The server's settings.
   */
  settings: GameSettings;

  /**
   * Changes settings.
   */
  onChange: (settings: Partial<GameSettings>) => void;
}

/**
 * A signed percentage change, such as "+30%" or "-15%", or "0%".
 *
 * @param scale A multiplier.
 * @returns Its change in percent.
 */
function percent(scale: number): string {
  const change = Math.round((scale - 1) * 1000) / 10;
  return `${change > 0 ? '+' : ''}${change}%`;
}

/**
 * The server's difficulty as a stepped slider, Easy to Hardest, with each
 * step's name under it and what the picked one does to damage.
 *
 * @param {DifficultyRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function DifficultyRow({ settings, onChange }: DifficultyRowProps): React.JSX.Element {
  const level = difficultyOf(settings.difficulty);
  const steps = Array.from({ length: DIFFICULTY_MAX - DIFFICULTY_MIN + 1 }, (_, i: number): number => DIFFICULTY_MIN + i);
  return (
    <div className='flex flex-col gap-xsm'>
      <div className='flex items-center gap-sm px-sm text-sm text-foreground'>
        <span className='flex-1'>
          Difficulty
          <span className='ml-xsm text-foreground-subtle'>{level.label}</span>
        </span>
      </div>
      <div className='flex flex-col gap-0.5 px-sm'>
        <input
          type='range'
          min={DIFFICULTY_MIN}
          max={DIFFICULTY_MAX}
          step={1}
          list='difficulty-steps'
          value={settings.difficulty}
          aria-label='Difficulty'
          aria-valuetext={level.label}
          className='w-full accent-brand'
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange({ difficulty: Number(e.target.value) })} />
        <datalist id='difficulty-steps'>
          {steps.map((s: number) => (
            <option
              key={s}
              value={s} />
          ))}
        </datalist>
        <div className='flex justify-between text-[10px] text-foreground-subtle'>
          {steps.map((s: number) => (
            <span
              key={s}
              className={s === settings.difficulty ? 'text-foreground' : ''}>
              {DIFFICULTY_LEVELS[s].label}
            </span>
          ))}
        </div>
      </div>
      <span className='px-sm text-[11px] leading-snug text-foreground-subtle'>
        {`Damage players take ${percent(level.taken)}, damage monsters take ${percent(level.dealt)}. Players never see it: monsters just hit harder or last longer.`}
      </span>
    </div>
  );
}

export default DifficultyRow;
