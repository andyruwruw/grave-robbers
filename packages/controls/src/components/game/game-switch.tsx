// Packages
import React from 'react';

// Local Imports
import SwitchPill from '../ui/switch-pill';
import Kbd from './kbd';

// Types
import type { GameSwitch as GameSwitchInfo } from '../../types/game-panel';

/**
 * Props for the GameSwitch component.
 */
interface GameSwitchProps {
  /**
   * The switch's setting, label, hint, icon, and shortcut.
   */
  info: GameSwitchInfo;

  /**
   * Whether it's on.
   */
  on: boolean;

  /**
   * Shows its keyboard shortcut (the TV).
   */
  shortcuts: boolean;

  /**
   * Flips it.
   */
  onToggle: () => void;
}

/**
 * One switch row: icon, label, shortcut letter (on the TV), and the pill.
 *
 * @param {GameSwitchProps} props - Component props.
 * @returns {React.JSX.Element} The rendered switch.
 */
function GameSwitch({
  info: { label, hint, icon: Icon, shortcut },
  on,
  shortcuts,
  onToggle,
}: GameSwitchProps): React.JSX.Element {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={on}
      title={hint}
      className='flex items-center gap-sm rounded-md px-sm py-xsm text-left text-sm text-foreground hover:bg-muted'
      onClick={onToggle}>
      <Icon
        size={14}
        className='text-foreground-muted' />
      <span className='flex-1'>{label}</span>
      {shortcuts && shortcut && <Kbd>{shortcut}</Kbd>}
      <SwitchPill on={on} />
    </button>
  );
}

export default GameSwitch;
