// Packages
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { WORLD_LEVEL_BOOST_MAX, WORLD_LEVEL_BOOST_STEP } from '@halloween/shared/difficulty/world-level';

// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';

/**
 * Props for the WorldLevelRow component.
 */
interface WorldLevelRowProps {
  /**
   * The server's current switches (for the boost).
   */
  settings: GameSettings;

  /**
   * The hidden world level right now.
   */
  worldLevel: number;

  /**
   * Changes some of the switches.
   */
  onChange: (settings: Partial<GameSettings>) => void;
}

/**
 * The world level, with -/+ buttons for the boost added on top of what the
 * players call for.
 *
 * @param {WorldLevelRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function WorldLevelRow({ settings, worldLevel, onChange }: WorldLevelRowProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-xsm'>
      <div className='flex items-center gap-sm px-sm text-sm text-foreground'>
        <span className='flex-1'>
          World level
          <span className='ml-xsm text-foreground-subtle'>{worldLevel.toFixed(1)}</span>
        </span>
        <button
          type='button'
          aria-label='Lower the world level boost'
          disabled={settings.levelBoost <= 0}
          className='flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors hover:bg-background disabled:opacity-40'
          onClick={(): void => onChange({ levelBoost: Math.max(0, settings.levelBoost - WORLD_LEVEL_BOOST_STEP) })}>
          <Minus size={14} />
        </button>
        <span className='w-9 text-center text-xs text-foreground-muted'>+{settings.levelBoost}</span>
        <button
          type='button'
          aria-label='Raise the world level boost'
          disabled={settings.levelBoost >= WORLD_LEVEL_BOOST_MAX}
          className='flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors hover:bg-background disabled:opacity-40'
          onClick={(): void => onChange({ levelBoost: Math.min(WORLD_LEVEL_BOOST_MAX, settings.levelBoost + WORLD_LEVEL_BOOST_STEP) })}>
          <Plus size={14} />
        </button>
      </div>
      <span className='px-sm text-[11px] leading-snug text-foreground-subtle'>Levels added on top of what the players call for: more, tougher, better armed monsters.</span>
    </div>
  );
}

export default WorldLevelRow;
