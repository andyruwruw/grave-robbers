// Packages
import React from 'react';
import { LogOut } from 'lucide-react';
import TransferCode from '@halloween/game-ui/components/screens/transfer-code';

// Local Imports
import { SETTINGS_BUTTON } from '../../config/play';
import SwitchSetting from './switch-setting';

// Types
import type { PlaySettings } from '../../types/play';

/**
 * Props for GameplaySettings.
 */
interface GameplaySettingsProps {
  /**
   * The current settings.
   */
  settings: PlaySettings;

  /**
   * Called with the changed settings.
   */
  onChange: (settings: PlaySettings) => void;


  /**
   * The last transfer code the server gave, or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Asks for a new transfer code.
   */
  onTransfer: () => void;

  /**
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * The Gameplay tab: whether the controller rumbles, moving the character
 * to another device (`TransferCode`), and Leave game.
 *
 * @param {GameplaySettingsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab.
 */
function GameplaySettings({ settings, onChange, transfer, onTransfer, onLeave }: GameplaySettingsProps): React.JSX.Element {
  return (
    <div className='flex flex-col gap-sm'>
      <span className='font-medium text-[13px] text-foreground-muted'>Gameplay</span>
      <SwitchSetting
        label='Controller rumble'
        on={settings.rumble}
        defaultOn
        onChange={(rumble: boolean): void => onChange({ ...settings, rumble })} />
      <div className='mt-md max-w-xs'>
        <TransferCode
          transfer={transfer}
          onRequest={onTransfer}
          buttonClassName={`${SETTINGS_BUTTON} self-start border-border bg-muted text-foreground`} />
      </div>
      <button
        type='button'
        className={`${SETTINGS_BUTTON} mt-md self-start border-border bg-muted text-status-warning-foreground`}
        onClick={onLeave}>
        <LogOut size={12} />
        Leave game
      </button>
    </div>
  );
}

export default GameplaySettings;
