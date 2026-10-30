// Packages
import React from 'react';
import {
  Moon,
  Skull,
  Sun,
} from 'lucide-react';

// Local Imports
import { PANEL_BUTTON } from '../../config/styles';
import Kbd from './kbd';

/**
 * Props for the WorldActions component.
 */
interface WorldActionsProps {
  /**
   * Whether a blood moon is up right now.
   */
  bloodMoon: boolean;

  /**
   * Whether it's daytime.
   */
  daytime: boolean;

  /**
   * Shows each button's keyboard shortcut (the TV).
   */
  shortcuts: boolean;

  /**
   * Summons a blood moon.
   */
  onBloodMoon: () => void;

  /**
   * Switches between day and night.
   */
  onDaytime: () => void;

  /**
   * Kills every monster on the map.
   */
  onKillMonsters: () => void;
}

/**
 * Buttons to summon a blood moon, switch to daytime and back, and kill
 * every monster.
 *
 * @param {WorldActionsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered buttons.
 */
function WorldActions({
  bloodMoon,
  daytime,
  shortcuts,
  onBloodMoon,
  onDaytime,
  onKillMonsters,
}: WorldActionsProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      <button
        type='button'
        disabled={bloodMoon}
        className={`${PANEL_BUTTON} relative`}
        onClick={onBloodMoon}>
        <Moon
          size={14}
          fill='currentColor'
          className='text-danger' />
        {bloodMoon ? 'Blood moon rising' : 'Summon blood moon'}
        {shortcuts && <span className='absolute right-sm'><Kbd>B</Kbd></span>}
      </button>
      <button
        type='button'
        aria-pressed={daytime}
        className={`${PANEL_BUTTON} relative`}
        onClick={onDaytime}>
        {daytime ? (
          <Moon size={14} />
        ) : (
          <Sun
            size={14}
            className='text-status-warning-foreground' />
        )}
        {daytime ? 'Back to night' : 'Make it day'}
        {shortcuts && <span className='absolute right-sm'><Kbd>D</Kbd></span>}
      </button>
      <button
        type='button'
        className={`${PANEL_BUTTON} relative`}
        onClick={onKillMonsters}>
        <Skull size={14} />
        Kill all monsters
        {shortcuts && <span className='absolute right-sm'><Kbd>K</Kbd></span>}
      </button>
    </div>
  );
}

export default WorldActions;
